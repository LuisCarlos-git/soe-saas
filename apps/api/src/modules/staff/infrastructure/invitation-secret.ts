import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

export class InvitationSecret {
  private readonly key: Buffer;
  constructor(private readonly secret: string) {
    this.key = createHash("sha256")
      .update(`soe-invitation-delivery:${secret}`)
      .digest();
  }
  hash(token: string) {
    return createHmac("sha256", this.secret)
      .update(`invitation:${token}`)
      .digest("hex");
  }
  mint(id: string, revision: number) {
    const token = randomBytes(32).toString("base64url");
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(Buffer.from(`${id}:${revision}`));
    const encrypted = Buffer.concat([
      cipher.update(token, "utf8"),
      cipher.final(),
    ]);
    return {
      hash: this.hash(token),
      encrypted: Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
        "base64url",
      ),
    };
  }
  decrypt(id: string, revision: number, encrypted: string) {
    const value = Buffer.from(encrypted, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      value.subarray(0, 12),
    );
    decipher.setAAD(Buffer.from(`${id}:${revision}`));
    decipher.setAuthTag(value.subarray(12, 28));
    return Buffer.concat([
      decipher.update(value.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
  }
}
