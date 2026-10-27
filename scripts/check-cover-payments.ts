import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import { ThunderCheckoutClient, prepareInitialPrintQuote, THUNDER_STRIPE_ACCOUNT } from '../server/cover/checkout';
import { MysqlCoverCheckoutStore } from '../server/cover/checkout-store';
import { VaultCrypto } from '../server/cover/vault';
import { createProject } from '../client/src/lib/cover/model';
import { printQuote, coverGeometry } from '../shared/print-production';
import { PAGE_PRICE_POLICY_VERSION } from '../shared/page-settlement';
import type { Submission } from '../server/cover/submissions';

// Operator-only smoke check. It never confirms a payment or sends email.
const base = 'https://api.stripe.com/v1';
const key = process.env.COVER_STRIPE_SECRET_KEY || '';
const rates = JSON.parse(process.env.COVER_STRIPE_TAX_RATES || '{}');
const provider = new ThunderCheckoutClient({ secret:key, mode:'live', taxRates:rates });
let store: MysqlCoverCheckoutStore | undefined;
let db: mysql.Pool | undefined;
let fixtureId: string | undefined;
try {
  await provider.initialize();
  console.log('THUNDER_ACCOUNT_AND_13_5_INCLUSIVE_TAX_OK');
  const crypt = new VaultCrypto(Buffer.from(process.env.COVER_VAULT_KEY || '', 'hex'));
  store = new MysqlCoverCheckoutStore(process.env.DATABASE_URL!, crypt);
  await store.init();
  db = mysql.createPool({uri:process.env.DATABASE_URL!,connectionLimit:1});
  const now = Date.now();
  fixtureId = randomUUID();
  const project=createProject(); project.title='TEKNINEN TESTI – ÄLÄ MAKSA';
  const quote=printQuote(project.production)!;
  const source:Submission={
    receipt:{id:fixtureId,status:'awaiting_review',totalCents:quote.totalCents!,provisional:true,expires:now+86400000},
    customer:{name:'Thunder tekninen testi',email:'info+kansistudio-maksutesti@thunderkustannus.fi',phone:'',address:'Testiosoite',postal:'00100',city:'Helsinki'},
    project,projectId:randomUUID(),revision:1,manuscript:'',filename:'tekninen-testi.pdf',digest:'a'.repeat(64),geometry:coverGeometry(project.production),quote,receivedAt:now,review:'required',
  };
  const approved=prepareInitialPrintQuote(source,{sourceDigest:source.digest,pagePolicyVersion:PAGE_PRICE_POLICY_VERSION,priceTermsAccepted:true},now);
  const record={id:fixtureId,owner:crypt.id(source.customer.email),quote:approved,customer:source.customer,state:'quoted' as const,attempt:null,session:null};
  await store.create(record);
  const roundtrip=await store.get(fixtureId);
  if(roundtrip?.quote.digest!==approved.digest)throw Error('database-roundtrip-mismatch');
  try {await store.update(fixtureId,r=>{r.state='review';throw Error('EXPECTED_ROLLBACK');});}catch(e){if((e as Error).message!=='EXPECTED_ROLLBACK')throw e;}
  if((await store.get(fixtureId))?.state!=='quoted')throw Error('database-rollback-mismatch');
  const [rows]=await db.execute<any[]>('SELECT payload FROM cover_checkouts WHERE id=?',[fixtureId]);
  if(rows[0].payload.toString().includes(source.customer.email))throw Error('database-payload-not-encrypted');
  console.log('MYSQL_ENCRYPTED_ROUNDTRIP_AND_ROLLBACK_OK');
  if(process.argv.includes('--create-unpaid')) {
    const attempt={id:randomUUID(),createdAt:now,expiresAt:now+3600000};
    const session=await provider.create(approved,attempt,now);
    await provider.retrieve(approved,attempt,session.id);
    console.log('UNPAID_CHECKOUT_OK amount='+approved.totalCents+' session='+session.id);
    console.log('UNPAID_PREVIEW_URL='+session.url);
    // Expire immediately: this smoke session must never be used for payment.
    const expired=await fetch(base+'/checkout/sessions/'+session.id+'/expire',{method:'POST',headers:{Authorization:'Bearer '+key,'Stripe-Account':THUNDER_STRIPE_ACCOUNT}});
    if(!expired.ok)throw Error('smoke-session-expiry-pending');
    console.log('SMOKE_CHECKOUT_EXPIRED_NO_CHARGE');
  }
} catch(e) {
  const message=e instanceof Error ? e.message : 'unknown';
  console.error('CHECK_FAILED '+message.replace(/(?:rk|sk)_(?:live|test)_\S+/g,'[redacted]'));
  process.exitCode=1;
} finally {
  if(db && fixtureId)await db.execute('DELETE FROM cover_checkouts WHERE id=?',[fixtureId]);
  await db?.end(); await store?.close();
}
