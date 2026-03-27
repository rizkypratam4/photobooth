// app/api/send-email/route.ts
// POST /api/send-email  → kirim foto hasil ke email pengguna
// Install dulu: npm install resend

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, imageBase64 } = await request.json();

  if (!email || !imageBase64) {
    return NextResponse.json(
      { error: "Email dan foto wajib diisi" },
      { status: 400 },
    );
  }

  // Ubah base64 jadi buffer untuk attachment
  const base64Data = imageBase64.replace("data:image/png;base64,", "");
  const imageBuffer = Buffer.from(base64Data, "base64");

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Foto Photobooth Kamu Sudah Siap! 📸",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #111;">Hei! Foto kamu sudah siap 🎉</h2>
        <p style="color: #555;">
          Terima kasih sudah menggunakan photobooth kami.
          Foto strip kamu ada di lampiran email ini.
        </p>
        <p style="color: #555;">
          Simpan dan bagikan momenmu!
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          Email ini dikirim otomatis dari Photobooth App.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `photobooth-${Date.now()}.png`,
        content: imageBuffer,
      },
    ],
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, id: data?.id });
}
