import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON body
  app.use(express.json());

  // Safe Gemini AI client initialization helper
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY top-level environment variable is not defined.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // --- API Endpoints ---

  // Endpoint to generate customized Uzbek motivation quote for a habit based on progress
  app.post("/api/gemini/motivate", async (req, res) => {
    try {
      const { habitTitle, progressPercent, targetHours, timeSpentFormatted } = req.body;
      const ai = getAiClient();

      const prompt = `Foydalanuvchi quyidagi odat bilan shug'ullanmoqda:
- Odat nomi: "${habitTitle}"
- Maqsad: ${targetHours} soat
- Bajarilgan vaqt: ${timeSpentFormatted} (${progressPercent}% bajarildi)

Iltimos, ushbu foydalanuvchiga davom etishi uchun juda kreativ, ilhomlantiruvchi va qisqa (1-2 ta jumlada) o'zbek tilida motivatsion maslahat yoki chaqiriq yozib bering. Uni ruhlantiring!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Siz Focus AI ilovasining aqlli va g'ayratli AI maslahatchisisiz. Javoblaringiz qisqa, ta'sirchan va o'zbek tilida bo'lishi kerak.",
          temperature: 0.8,
        }
      });

      res.json({ motivation: response.text || "Olg'a! Siz albatta maqsadingizga erishasiz." });
    } catch (error: any) {
      console.error("Gemini motivate error:", error);
      res.status(500).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  // Endpoint to suggest standard/custom focus habits based on user focus interest
  app.post("/api/gemini/suggest", async (req, res) => {
    try {
      const { userGoal } = req.body;
      const ai = getAiClient();

      const prompt = `Foydalanuvchining maqsadi yoki qiziqishi: "${userGoal || 'Yaxshiroq vaqt boshqaruvi va unumdorlik'}"

Ushbu maqsadga mos keluvchi 3 ta ajoyib odat taklif qiling. Har bir odat uchun quyidagilarni aniqlang:
1. title (odat nomi, o'zbek tilida)
2. targetHours (tavsiya etilgan maqsad soati, butun son, masalan 10, 20, 50)
3. description (qisqacha o'zbek tilida tavsif, 1 ta jumla)
4. category (toifasi, masalan: "Unumdorlik", "Salomatlik", "Ta'lim", "Texnologiya")
5. iconType (quyidagi ramzlardan birini moslab tanlang: "brain", "book", "code", "run", "laptop", "meditation", "target")

Javobni quyidagi qat'iy JSON formatida qaytaring.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                targetHours: { type: Type.INTEGER },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                iconType: { type: Type.STRING },
              },
              required: ["title", "targetHours", "description", "category", "iconType"],
            },
          },
        },
      });

      const suggestions = JSON.parse(response.text || "[]");
      res.json({ suggestions });
    } catch (error: any) {
      console.error("Gemini suggest error:", error);
      res.status(500).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  // Vite middleware setup (development vs production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
