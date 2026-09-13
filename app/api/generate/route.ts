import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ключ GEMINI_API_KEY не найден" }, { status: 401 });
    }

    const prompt = `Ты — эксперт по продажам на Авито. 
    Напиши идеальное продающее объявление для товара: ${title}. 
    Состояние: ${condition}. 
    Дополнительно: ${details}. 
    Текст должен быть на русском языке, структурирован (Заголовок, Описание, Почему я, Доставка), с использованием уместных эмодзи. 
    Сделай текст живым и привлекательным для покупателя.`;

    // Прямой запрос к Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return NextResponse.json({ error: "Ошибка Google AI" }, { status: response.status });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Не удалось сгенерировать текст.";
    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
