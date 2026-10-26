declare module "fontkit" { export function create(buffer:Buffer): {hasGlyphForCodePoint(code:number):boolean}; }
