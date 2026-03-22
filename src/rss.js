export async function fetchRSS(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
      cf: { cacheTtl: 300 },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items = [];

    // Парсим RSS/Atom через регулярки (без сторонних библиотек)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1] || match[2];

      const title = extractTag(block, "title");
      const link = extractTag(block, "link") || extractAttr(block, "link", "href");
      const description = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");
      const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");
      const image = extractImage(block);

      if (title && link) {
        items.push({
          id: link,
          title: cleanText(title),
          description: cleanText(description || ""),
          link,
          pubDate,
          image,
        });
      }
    }

    return items.slice(0, 10); // Берём последние 10 с каждого источника
  } catch (e) {
    console.error(`RSS error for ${url}:`, e.message);
    return [];
  }
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<\\!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "si"));
  return match ? match[1].trim() : null;
}

function extractAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i"));
  return match ? match[1].trim() : null;
}

function extractImage(block) {
  // Пробуем разные места где может быть картинка
  const enclosure = block.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];

  const mediaThumbnail = block.match(/<media:thumbnail[^>]*url="([^"]*)"/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  const mediaContent = block.match(/<media:content[^>]*url="([^"]*)"[^>]*type="image/i);
  if (mediaContent) return mediaContent[1];

  const imgTag = block.match(/<img[^>]*src="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (imgTag) return imgTag[1];

  return null;
}

function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, "") // убираем HTML теги
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
