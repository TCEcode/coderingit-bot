const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generatePost(item, style, apiKey) {
  const prompt = `${style}

Новость для обработки:
Заголовок: ${item.title}
Описание: ${item.description || "нет описания"}
Ссылка: ${item.link}

Напиши пост для Telegram. В самом конце добавь ссылку на источник в формате: 🔗 Подробнее`;

  try {
    const response = await fetch(`${GEMINI_API}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.8,
        },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response from Gemini");

    return text.trim();
  } catch (e) {
    console.error("Gemini error:", e.message);
    // Фолбэк — простой пост без AI
    return `⚡️ ${item.title}\n\n${item.description?.slice(0, 200) || ""}\n\n🔗 ${item.link}`;
  }
}
