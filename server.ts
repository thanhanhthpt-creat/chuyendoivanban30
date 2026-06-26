import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Fallback models listed in instructions
const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-2.5-flash"];

// Helper to call Gemini AI with recursive fallback
async function generateWithFallback(prompt: string, userKey: string | undefined, modelIndex: number = 0): Promise<string> {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Không tìm thấy Gemini API Key. Vui lòng nhập API Key trong cấu hình.");
  }

  const currentModel = MODELS[modelIndex];
  console.log(`[Gemini] Đang thử gọi model: ${currentModel} (Mục thứ ${modelIndex + 1}/${MODELS.length})`);

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: currentModel,
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temperature for more consistent formatting & corrections
      },
    });

    if (response && response.text) {
      return response.text;
    } else {
      throw new Error(`Model ${currentModel} trả về kết quả rỗng.`);
    }
  } catch (error: any) {
    console.error(`[Gemini Error] Lỗi với model ${currentModel}:`, error.message || error);
    
    // Check if we can fallback to the next model
    if (modelIndex < MODELS.length - 1) {
      console.log(`[Gemini] Đang tự động fallback sang model tiếp theo...`);
      return generateWithFallback(prompt, userKey, modelIndex + 1);
    }
    
    throw new Error(error.message || "Tất cả các mô hình Gemini đều gặp lỗi.");
  }
}

// Endpoint proxy cho Gemini AI
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;
    if (!prompt) {
       res.status(400).json({ error: "Nội dung prompt không được để trống" });
       return;
    }

    const text = await generateWithFallback(prompt, apiKey);
    res.json({ text });
  } catch (error: any) {
    console.error("[API Error] Gemini generate failed:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi gọi Gemini AI" });
  }
});

// Endpoint trả về cấu hình model có sẵn
app.get("/api/config", (req, res) => {
  res.json({
    models: MODELS,
    hasServerKey: !!process.env.GEMINI_API_KEY,
  });
});

async function start() {
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
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

start();
