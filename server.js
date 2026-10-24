const express = require('express');
const fetch = require('node-fetch');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.json());

// Start command & Webhook/Polling handler
app.post(`/api/${BOT_TOKEN}`, async (req, res) => {
    const update = req.body;
    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text === '/start') {
            await fetch(`${TELEGRAM_API}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: 'Namaste! AsiaFlix Bot Render par live ho gaya hai! 🚀'
                })
            });
        }
    }
    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.send('AsiaFlix Telegram Bot is running live! 🌸');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
