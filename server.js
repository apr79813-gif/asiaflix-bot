const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Webhook endpoint jo Telegram se messages receive karega
app.post('/api/webhook', async (req, res) => {
    const update = req.body;

    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        // Agar user '/start' bhejta hai toh yeh reply aayega
        if (text === '/start') {
            try {
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: 'Namaste! Mera naam AsiaFlix Bot hai. Main ab Vercel par 24/7 live hoon! 🚀'
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    res.status(200).send('OK');
});

// Home route
app.get('/', (req, res) => {
    res.send('AsiaFlix Telegram Bot is running live on Vercel! 🌸');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
