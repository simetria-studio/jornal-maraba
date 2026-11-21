import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

export const runtime = "nodejs";

const TIPOS: Record<string, string> = {
  ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
};

export async function GET(_: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(arquivo)) return new Response("Not found", { status: 404 });
  try {
    const buf = fs.readFileSync(path.join(UPLOAD_DIR, arquivo));
    return new Response(buf, {
      headers: {
        "Content-Type": TIPOS[path.extname(arquivo)],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
