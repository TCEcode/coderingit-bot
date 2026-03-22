# CoderingIT Bot

Автоматический Telegram бот для канала @CoderingIT.
Собирает IT-новости из RSS, фильтрует через DeepSeek, генерирует посты через Gemini, публикует с картинками из Unsplash.

## Стек
- **Cloudflare Workers** — хостинг и расписание (Cron)
- **Cloudflare KV** — хранение опубликованных новостей
- **Gemini Flash** — генерация постов
- **DeepSeek** — фильтрация и дедупликация
- **Unsplash** — картинки

## Установка

### 1. Установи Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Создай KV namespace
```bash
wrangler kv:namespace create "POSTED_NEWS"
```
Скопируй полученный ID и вставь в `wrangler.toml` в поле `id`.

### 3. Добавь секреты в Cloudflare
```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put GEMINI_API_KEY
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put UNSPLASH_ACCESS_KEY
```

#### Где взять ключи:
- **TELEGRAM_BOT_TOKEN** — создай бота через @BotFather, добавь его в канал как администратора
- **GEMINI_API_KEY** — https://aistudio.google.com/app/apikey
- **DEEPSEEK_API_KEY** — https://platform.deepseek.com/api_keys
- **UNSPLASH_ACCESS_KEY** — https://unsplash.com/oauth/applications/902696 → поле "Access Key"

### 4. Задеплой
```bash
wrangler deploy
```

## Расписание
Бот запускается каждые 3 часа автоматически.

## Ручной запуск для теста
После деплоя открой в браузере:
```
https://coderingit-bot.<твой-субдомен>.workers.dev/run
```

## Добавление нового канала
Просто скопируй папку проекта, измени `config.js` — тему, список RSS и стиль постов, задеплой как отдельный воркер.
