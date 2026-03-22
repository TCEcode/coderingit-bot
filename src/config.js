export const CHANNEL = "@CoderingIT";

export const RSS_SOURCES = [
  // Русскоязычные
  "https://habr.com/ru/rss/hubs/all/articles/",
  "https://habr.com/ru/rss/best/",
  "https://www.linux.org.ru/section-rss.jsp?section=1",
  // Англоязычные (AI переведёт и адаптирует)
  "https://feeds.feedburner.com/TechCrunch",
  "https://www.theverge.com/rss/index.xml",
  "https://hnrss.org/frontpage",
  "https://www.wired.com/feed/rss",
  "https://feeds.arstechnica.com/arstechnica/index",
];

export const POST_STYLE = `
Ты редактор IT-канала @CoderingIT для СНГ аудитории.
Твоя задача — написать пост для Telegram на основе новости.

Правила:
- Пиши живо, с характером, немного с иронией — как у крутых IT каналов
- Максимум 200 слов
- Можно использовать эмодзи но не злоупотреблять
- Выдели главную суть в первых двух строках — это самое важное
- В конце короткий вывод или комментарий от себя
- Пиши на русском
- НЕ добавляй хэштеги
- НЕ добавляй подпись канала, она добавится автоматически
- Если новость на английском — адаптируй на русский, не переводи дословно
`;
