import { useState } from "react";
export default function CoverServiceHelp() {
  const [stage, setStage] = useState("työn alla"),
    [need, setNeed] = useState("kannen suunnitteluun");
  const text =
    "Hei Santeri! Käytän Thunderin kansisuunnittelijaa. Käsikirjoitukseni on " +
    stage +
    ". Tarvitsisin apua " +
    need +
    ". Miten kannattaisi edetä?";
  return (
    <section className="cover-service-help">
      <div>
        <p className="cover-eyebrow">THUNDERIN AMMATTILAISET APUNASI</p>
        <h2>Voimme hoitaa myös toteutuksen.</h2>
        <p>
          Voit tehdä kannen itse tai antaa suunnittelun meille. Autamme myös
          sisäsivujen taitossa, painatuksessa ja kirjan julkaisemisessa
          kirjakauppoihin. Palvelut sovitaan ja hinnoitellaan erikseen.
        </p>
        <p>
          Kerro lyhyesti tilanteesi WhatsAppissa. Santeri ehdottaa sopivaa
          seuraavaa askelta.
        </p>
      </div>
      <div>
        <label>
          Käsikirjoitukseni on
          <select value={stage} onChange={e => setStage(e.target.value)}>
            <option>valmis</option>
            <option>työn alla</option>
            <option>vasta idea</option>
          </select>
        </label>
        <label>
          Tarvitsen apua
          <select value={need} onChange={e => setNeed(e.target.value)}>
            <option>kannen suunnitteluun</option>
            <option>sisäsivujen taittoon</option>
            <option>painatukseen</option>
            <option>kirjan julkaisemiseen ja jakeluun</option>
            <option>koko kirjan toteutukseen</option>
          </select>
        </label>
        <a
          className="cover-primary"
          href={"https://wa.me/358403519546?text=" + encodeURIComponent(text)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Kysy Santerilta WhatsAppissa →
        </a>
        <small>
          Viesti avautuu WhatsAppiin. Voit muokata sitä ennen lähettämistä.
        </small>
      </div>
    </section>
  );
}
