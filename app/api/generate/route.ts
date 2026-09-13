import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();

    const prompt = `Ты — лучший авитолог и копирайтер в РФ. Напиши идеальное продающее объявление для Авито/Юлы.

Товар: ${title}
Состояние: ${condition}
Доп. детали и нюансы: ${details || "Нет"}

Структура объявления:
1. Заголовок с цепляющими эмодзи и выгодой.
2. Вступающая фраза, привлекающая внимание.
3. Блок "Характеристики и состояние" (в виде аккуратных пунктов).
4. Блок "Почему стоит купить именно у меня" (гарантия, проверки, бережный уход).
5. Условия покупки (самовывоз, Авито Доставка, бронь).
6. Внизу блок SEO-тегов через хэштеги для поиска на Авито.

Текст должен быть убедительным, без "воды", написан живым языком.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free", // Мощная бесплатная модель
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return NextResponse.json({ error: "Ошибка ИИ сервиса" }, { status: 500 });
    }

    const aiText = data.choices?.[0]?.message?.content || "Не удалось сгенерировать текст.";
    return NextResponse.json({ text: aiText });

  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
