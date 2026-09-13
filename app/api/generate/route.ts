import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ключ не найден" }, { status: 401 });
    }

    const prompt = `Напиши продающее объявление для Авито на русском языке. 
    Товар: ${title}
    Состояние: ${condition}
    Детали: ${details}
    Используй структуру: Заголовок, Описание, Характеристики, Призыв к действию. Добавь эмодзи.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lending-pied.vercel.app/",
        "X-Title": "TurboSell AI",
      },
      body: JSON.stringify({
        // Пробуем Mistral 7B — она почти всегда доступна бесплатно
        model: "mistralai/mistral-7b-instruct:free", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      // Если Mistral не сработал, попробуем Gemini прямо внутри (простой фолбек)
      return NextResponse.json({ error: "Модель перегружена, попробуйте через минуту" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content || "Не удалось сгенерировать текст.";
    return NextResponse.json({ text: aiText });

  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
