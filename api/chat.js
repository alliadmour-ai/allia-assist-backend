import OpenAI from "openai";

const CLINIC_PHONE = process.env.CLINIC_PHONE || "0747619919";
const CLINIC_EMAIL = process.env.CLINIC_EMAIL || "allia.dmour@gmail.com";

export default async function handler(req, res) {
  // răspunde pe GET fără să crape
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing in server environment." });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const system = `
Ești Allia Assist, asistentul Clinicii Doctor Allia Dmour (Iași).
Obiectiv: răspunsuri clare, scurte, profesioniste, orientate spre programare.

Reguli stricte:
- NU oferi diagnostic sau tratament. Dacă este urgență → 112.
- NU confirma programări în chat. Clinica confirmă telefonic.
- Menționează mereu: "Poți suna direct la ${CLINIC_PHONE}".
`;

    const messages = [
      { role: "system", content: system.trim() },
      ...Array.isArray(history) ? history : [],
      { role: "user", content: message }
    ];

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      temperature: 0.4
    });

    const text = response.output_text || "Îmi pare rău, nu am putut genera un răspuns.";

    return res.status(200).json({ reply: text, clinicPhone: CLINIC_PHONE, clinicEmail: CLINIC_EMAIL });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
