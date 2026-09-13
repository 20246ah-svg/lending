import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ключ API не найден" }, { status: 401 });
    }

    const prompt = `Ты — эксперт по продажам на Авито. 
    Напиши идеальное продающее объявление для товара: ${title}. 
    Состояние: ${condition}. 
    Дополнительно: ${details}. 
    Текст должен быть на русском языке, структурирован, с использованием эмодзи.`;

    // Список возможных названий моделей (Google иногда меняет их)
    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-pro"
    ];

    let lastError = null;

    for (const modelName of modelNames) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
        } else {
          lastError = data.error?.message || "Unknown error";
          console.warn(`Model ${modelName} failed, trying next...`);
        }
      } catch (err) {
        lastError = "Fetch failed";
      }
    }

    return NextResponse.json({ error: `Google AI Error: ${lastError}` }, { status: 500 });

  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
