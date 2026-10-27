import { describe, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { CoverVault, MemoryVault, VaultCrypto } from "./vault";
describe("payment login return paths", () => {
  it("preserves only a same-site payment route through a one-use login", async () => {
    const vault = new CoverVault(
      new MemoryVault(),
      new VaultCrypto(randomBytes(32))
    );
    const path = "/kansi-maksu/" + randomUUID();
    const token = await vault.requestLink(
      "author@example.com",
      false,
      "test",
      path
    );
    const login = await vault.verify(token!, "author@example.com");
    expect(login?.returnPath).toBe(path);
    expect(await vault.verify(token!, "author@example.com")).toBeNull();
  });
  it("does not store an arbitrary external redirect", async () => {
    const vault = new CoverVault(
      new MemoryVault(),
      new VaultCrypto(randomBytes(32))
    );
    const token = await vault.requestLink(
      "author@example.com",
      false,
      "test",
      "https://evil.invalid"
    );
    expect(
      (await vault.verify(token!, "author@example.com"))?.returnPath
    ).toBeUndefined();
  });
});
