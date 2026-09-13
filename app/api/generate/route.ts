import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ключ API не найден в настройках Vercel" }, { status: 401 });
    }

    // Список моделей для поочередной проверки (от самой умной к самой стабильной)
    const models = [
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "deepseek/deepseek-r1:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    const prompt = `Действуй как профессиональный продавец на Авито. Напиши объявление для товара: ${title}. 
    Состояние: ${condition}. Дополнительно: ${details}. 
    Текст должен быть на русском, с заголовком, списком преимуществ и эмодзи.`;

    let lastError = "";

    // Цикл: пробуем каждую модель из списка, пока одна не ответит
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://lending-pied.vercel.app/",
            "X-Title": "TurboSell AI",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          console.log(`Success with model: ${model}`);
          return NextResponse.json({ text: data.choices[0].message.content });
        } else {
          lastError = data.error?.message || "Unknown error";
          console.warn(`Model ${model} failed: ${lastError}`);
          continue; // Пробуем следующую модель
        }
      } catch (err) {
        console.error(`Fetch error for ${model}:`, err);
        continue;
      }
    }

    return NextResponse.json({ error: `Все нейросети временно перегружены. Ошибка: ${lastError}` }, { status: 503 });

  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
