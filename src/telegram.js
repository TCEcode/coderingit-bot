const TG_API = "https://api.telegram.org/bot";

export async function sendPost(text, imageUrl, botToken, channelId) {
  try {
    if (imageUrl) {
      // Пост с картинкой
      const response = await fetch(`${TG_API}${botToken}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: channelId,
          photo: imageUrl,
          caption: text,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();
      if (data.ok) return true;

      // Если картинка не загрузилась — шлём без неё
      console.warn("Photo failed, sending text only");
    }

    // Пост без картинки
    const response = await fetch(`${TG_API}${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (e) {
    console.error("Telegram error:", e.message);
    return false;
  }
}
