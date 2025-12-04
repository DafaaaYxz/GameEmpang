import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL = 'gemini-2.5-flash';

export const getNPCAdvice = async (
  playerName: string,
  money: number,
  level: number,
  context: string
): Promise<string> => {
  try {
    const prompt = `
      Berperanlah sebagai "Pak Soleh", seorang peternak lele senior dan sesepuh di desa ini.
      Gunakan bahasa Indonesia yang santai, sedikit logat daerah (Jawa/Sunda), bijak, dan lucu.
      
      Status Pemain:
      - Uang: Rp ${money}
      - Level: ${level}
      
      Konteks pertanyaan: "${context}"
      
      Berikan saran singkat (maksimal 2 kalimat).
    `;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text || "Waduh, sinyalnya jelek Nak.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf Juragan, Bapak lagi sariawan.";
  }
};

export const negotiatePrice = async (
  fishType: string,
  count: number,
  marketPrice: number,
  playerOffer: number,
  npcName: string
): Promise<{ accepted: boolean; message: string; counterOffer?: number }> => {
  try {
    const prompt = `
      Anda adalah ${npcName}, seorang tengkulak ikan yang pelit tapi adil.
      Harga pasar untuk ${count} ekor ${fishType} adalah Rp ${marketPrice}.
      Pemain menawarkan harga: Rp ${playerOffer}.

      Tugas anda:
      1. Jika tawaran pemain <= 110% harga pasar, terima dengan senang hati atau sedikit menggerutu.
      2. Jika tawaran pemain > 110% dan <= 130%, tawar balik (counter offer) di antara harga pasar dan tawaran pemain.
      3. Jika tawaran pemain > 130% harga pasar, tolak mentah-mentah dengan kasar/lucu.

      Outputkan HANYA JSON format ini:
      {
        "accepted": boolean,
        "message": "string (respon anda dalam bahasa Indonesia gaul/daerah)",
        "counterOffer": number (opsional, jika menawar balik)
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Negotiation Error:", error);
    return { accepted: false, message: "Aduh pusing pala berbie, nanti aja ya." };
  }
};