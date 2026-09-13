import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, condition, details } = await req.json();
    const apiKey = process.env.HF_TOKEN;

    if (!apiKey) {
      return NextResponse.json({ error: "Токен HF_TOKEN не найден" }, { status: 401 });
    }

    const prompt = `<|im_start|>system
Ты — профессиональный эксперт по продажам на Авито. Пиши только на русском языке.<|im_end|>
<|im_start|>user
Напиши продающее объявление для товара: ${title}.
Состояние: ${condition}.
Детали: ${details}.
Используй структуру: Заголовок с эмодзи, Описание товара, Преимущества, Информация о доставке. В конце добавь 5 SEO-тегов.<|im_end|>
<|im_start|>assistant`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 1000, stop: ["<|im_end|>"] }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("HF Error:", data);
      return NextResponse.json({ error: "Нейросеть отдыхает, попробуй еще раз через 10 секунд" }, { status: response.status });
    }

    // Hugging Face возвращает текст в разном формате, чистим его:
    let aiText = "";
    if (Array.isArray(data)) {
      aiText = data[0].generated_text;
    } else {
      aiText = data.generated_text;
    }
    
    // Убираем промпт из ответа, если он там есть
    aiText = aiText.replace(prompt, "").trim();

    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
