export async function getImage(query, accessKey) {
  try {
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`;

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.urls?.regular || null;
  } catch (e) {
    console.error("Unsplash error:", e.message);
    return null;
  }
}
