import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing!");
      return NextResponse.json({ error: "Ключ API не найден" }, { status: 500 });
    }

    const prompt = `Напиши продающее объявление для Авито. 
    Товар: ${title}, Состояние: ${condition}, Детали: ${details}. 
    Используй структуру: Заголовок, Описание, Преимущества, Доставка. Добавь эмодзи.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lending-pied.vercel.app/", // Обязательно для OpenRouter
        "X-Title": "TurboSell AI", // Обязательно для OpenRouter
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Попробуем Gemini — она быстрее и стабильнее сейчас
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return NextResponse.json({ error: data.error?.message || "Ошибка API" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content || "Не удалось сгенерировать текст.";
    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
