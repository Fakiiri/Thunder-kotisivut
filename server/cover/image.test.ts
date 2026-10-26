import { describe, it, expect, vi } from "vitest";
import sharp from "sharp";
import {
  readImage,
  validateProjectImage,
} from "../../client/src/lib/cover/storage";
import { createProject } from "../../client/src/lib/cover/model";
import { inspectCover } from "./prepress";
describe("original cover image boundary", () => {
  it("keeps the original bytes instead of silently resizing or recompressing the uploaded image", async () => {
    const raw = await sharp({
      create: { width: 2000, height: 3000, channels: 3, background: "#778899" },
    })
      .jpeg({ quality: 97 })
      .toBuffer();
    class TestImage {
      naturalWidth = 2000;
      naturalHeight = 3000;
      src = "";
      async decode() {}
    }
    class TestReader {
      result = "";
      onload = () => {};
      onerror = () => {};
      async readAsDataURL(blob: Blob) {
        this.result =
          "data:" +
          blob.type +
          ";base64," +
          Buffer.from(await blob.arrayBuffer()).toString("base64");
        this.onload();
      }
    }
    vi.stubGlobal("Image", TestImage);
    vi.stubGlobal("FileReader", TestReader);
    try {
      const image = await readImage(new Blob([raw], { type: "image/jpeg" }));
      expect(Buffer.from(image.data.split(",")[1], "base64").equals(raw)).toBe(
        true
      );
      expect(image).toMatchObject({
        original: true,
        width: 2000,
        height: 3000,
      });
      const old = createProject();
      old.image = { ...image, original: false };
      expect((await validateProjectImage(old)).image?.original).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("refuses forged dimensions before accepting source image metadata", async () => {
    const raw = await sharp({
      create: { width: 200, height: 300, channels: 3, background: "#778899" },
    })
      .png()
      .toBuffer();
    const p = createProject();
    p.image = {
      data: "data:image/png;base64," + raw.toString("base64"),
      width: 2000,
      height: 3000,
      original: true,
    };
    await expect(inspectCover(p, null)).rejects.toThrow("todelliset mitat");
  });
});
