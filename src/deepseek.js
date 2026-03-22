const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

// Фильтрует список новостей — убирает нерелевантные и семантические дубли
export async function filterAndDeduplicate(items, apiKey) {
  if (items.length === 0) return [];

  const prompt = `Ты фильтр новостей для IT-канала.

Вот список новостей (каждая с индексом):
${items.map((item, i) => `[${i}] ${item.title}`).join("\n")}

Задачи:
1. Убери новости не связанные с IT, технологиями, программированием, гаджетами, интернетом
2. Если несколько новостей об одном и том же событии — оставь только одну с лучшим заголовком
3. Оставь максимум 5 лучших новостей

Ответь ТОЛЬКО массивом индексов которые нужно оставить, например: [0,2,5,7,9]
Никакого текста кроме массива.`;

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    const match = text.match(/\[[\d,\s]+\]/);
    if (!match) return items.slice(0, 5);

    const indices = JSON.parse(match[0]);
    return indices.map((i) => items[i]).filter(Boolean);
  } catch (e) {
    console.error("DeepSeek filter error:", e.message);
    // Если ошибка — просто возвращаем первые 5
    return items.slice(0, 5);
  }
}

// Генерирует поисковый запрос для Unsplash на основе заголовка
export async function getImageQuery(title, apiKey) {
  const prompt = `Придумай поисковый запрос на английском для поиска фото на Unsplash к этой IT-новости: "${title}"
Ответь ТОЛЬКО 2-4 словами на английском. Ничего лишнего.`;

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "technology computer";
  } catch (e) {
    return "technology computer";
  }
}
