import { RSS_SOURCES, CHANNEL, POST_STYLE } from "./config.js";
import { fetchRSS } from "./rss.js";
import { filterAndDeduplicate, getImageQuery } from "./deepseek.js";
import { generatePost } from "./gemini.js";
import { getImage } from "./unsplash.js";
import { sendPost } from "./telegram.js";

export default {
  // Запускается по Cron расписанию (каждые 3 часа)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runBot(env));
  },

  // Для ручного тестирования через HTTP запрос
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/run") {
      await runBot(env);
      return new Response("Done", { status: 200 });
    }

    return new Response("CoderingIT Bot is running", { status: 200 });
  },
};

async function runBot(env) {
  console.log("🚀 Bot started at", new Date().toISOString());

  try {
    // 1. Собираем новости со всех RSS источников
    const allItems = [];
    for (const url of RSS_SOURCES) {
      const items = await fetchRSS(url);
      allItems.push(...items);
    }
    console.log(`📥 Fetched ${allItems.length} items from RSS`);

    // 2. Убираем уже опубликованные (первый уровень — точные совпадения по URL)
    const newItems = [];
    for (const item of allItems) {
      const key = `posted:${hashString(item.id)}`;
      const exists = await env.POSTED_NEWS.get(key);
      if (!exists) {
        newItems.push(item);
      }
    }
    console.log(`🆕 ${newItems.length} new items after KV check`);

    if (newItems.length === 0) {
      console.log("No new items, stopping");
      return;
    }

    // 3. DeepSeek фильтрует и убирает смысловые дубли
    const filtered = await filterAndDeduplicate(newItems, env.DEEPSEEK_API_KEY);
    console.log(`✅ ${filtered.length} items after DeepSeek filter`);

    // 4. Публикуем каждую новость
    for (const item of filtered) {
      try {
        // Генерируем пост через Gemini
        const postText = await generatePost(item, POST_STYLE, env.GEMINI_API_KEY);

        // Определяем картинку
        let imageUrl = item.image || null;

        if (!imageUrl) {
          // Если в RSS нет картинки — DeepSeek придумывает запрос, Unsplash даёт фото
          const query = await getImageQuery(item.title, env.DEEPSEEK_API_KEY);
          imageUrl = await getImage(query, env.UNSPLASH_ACCESS_KEY);
        }

        // Публикуем в Telegram
        const success = await sendPost(postText, imageUrl, env.TELEGRAM_BOT_TOKEN, CHANNEL);

        if (success) {
          // Сохраняем в KV чтобы не повторять (храним 30 дней)
          const key = `posted:${hashString(item.id)}`;
          await env.POSTED_NEWS.put(key, "1", { expirationTtl: 60 * 60 * 24 * 30 });
          console.log(`✔️ Published: ${item.title}`);
        }

        // Пауза между постами чтобы не спамить
        await sleep(5000);
      } catch (e) {
        console.error(`Error processing item "${item.title}":`, e.message);
      }
    }

    console.log("✅ Bot finished");
  } catch (e) {
    console.error("Bot error:", e.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
            }
