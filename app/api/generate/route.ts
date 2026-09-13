import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    
    // ВНИМАНИЕ: Проверяем наличие ключа
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "") {
      return NextResponse.json({ error: "API_KEY_IS_MISSING" }, { status: 401 });
    }

    const prompt = `Напиши продающее объявление для Авито. 
    Товар: ${title}, Состояние: ${condition}, Детали: ${details}. 
    Используй структуру: Заголовок с эмодзи, Описание, Преимущества, Доставка.
    Текст должен быть на русском языке.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lending-pied.vercel.app/",
        "X-Title": "TurboSell AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free", // Самая стабильная бесплатная модель
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter Error Details:", data);
      return NextResponse.json({ error: data.error?.message || "AI_ERROR" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content || "Не удалось сгенерировать текст.";
    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
