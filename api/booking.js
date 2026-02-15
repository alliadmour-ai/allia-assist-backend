import nodemailer from "nodemailer";

const CLINIC_EMAIL = process.env.CLINIC_EMAIL || "allia.dmour@gmail.com";
const CLINIC_PHONE = process.env.CLINIC_PHONE || "0747619919";

// ENV necesare în Vercel:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      name = "",
      phone = "",
      email = "",
      consultationType = "",
      preferredDoctor = "",
      preferredDate = "",
      notes = ""
    } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: "Telefon obligatoriu" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const subject = `Cerere programare — ${name || "Pacient"} — ${consultationType || "Nespecificat"}`;

    const body = `
Clinica Doctor Allia Dmour — Cerere programare

Nume pacient: ${name}
Telefon: ${phone}
Email pacient: ${email}

Tip consultație: ${consultationType}
Medic preferat: ${preferredDoctor}
Data / interval preferat: ${preferredDate}

Observații: ${notes}

Consimțământ GDPR: Da
Telefon clinică: ${CLINIC_PHONE}
`.trim();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: CLINIC_EMAIL,
      subject,
      text: body
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email send failed" });
  }
}
