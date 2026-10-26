import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";
export const coverFontFile = (sans = false, bold = false) =>
  path.resolve(
    process.cwd(),
    "client/public/fonts/cover",
    "Noto" +
      (sans ? "Sans" : "Serif") +
      "-" +
      (bold ? "Bold" : "Regular") +
      ".ttf"
  );
let ready = false;
export function registerCoverFonts() {
  if (ready) return;
  for (const sans of [false, true])
    for (const bold of [false, true]) {
      if (
        !GlobalFonts.registerFromPath(
          coverFontFile(sans, bold),
          sans ? "Thunder Cover Sans" : "Thunder Cover Serif"
        )
      )
        throw Error("Cover fonts unavailable");
    }
  ready = true;
}
