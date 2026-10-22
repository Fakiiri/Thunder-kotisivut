import { afterEach, expect, it, vi } from "vitest";
import { updateMetaConsent } from "../../client/src/lib/meta-consent";
afterEach(()=>vi.unstubAllGlobals());
it("does not load a marketing script until consent and initializes it only once",()=>{
  const appendChild=vi.fn();vi.stubGlobal("window",{});vi.stubGlobal("document",{createElement:()=>({}),head:{appendChild}});
  updateMetaConsent(false);expect(appendChild).not.toHaveBeenCalled();
  updateMetaConsent(true);updateMetaConsent(true);expect(appendChild).toHaveBeenCalledOnce();
  updateMetaConsent(false);
  expect((window as unknown as {fbq:{queue:unknown[]}}).fbq.queue).toContainEqual(["consent","revoke"]);
});
