import crypto from "node:crypto";

export function hashSenha(senha: string): string {
  const sal = crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${h}`;
}

export function confereSenha(senha: string, guardado: string): boolean {
  const [sal, h] = guardado.split(":");
  if (!sal || !h) return false;
  const calc = crypto.scryptSync(senha, sal, 64);
  const esp = Buffer.from(h, "hex");
  return calc.length === esp.length && crypto.timingSafeEqual(calc, esp);
}
