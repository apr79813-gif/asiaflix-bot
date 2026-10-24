const express = require('express');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

app.post('*', async (req, res) => {
    console.log("🔥 Incoming Update:", JSON.stringify(req.body));
    
    try {
        const update = req.body;
        if (update.message) {
            const chatId = update.message.chat.id.toString();
            const chatType = update.message.chat.type;
            const text = update.message.text || '';
            const userName = update.message.from.first_name || 'User';

            // Agar message kisi GROUP ya SUPERGROUP se aaya hai, toh uska ID print kar do!
            if (chatType === 'group' || chatType === 'supergroup') {
                console.log(`📌 REAL GROUP CHAT ID FOUND: ${chatId} (Type: ${chatType})`);
            }

            // Agar normal user ka message hai toh user ko reply do
            if (chatType === 'private' && text === '/start') {
                await fetch(`${TELEGRAM_API}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: 'Namaste! Bot active hai. 🍿'
                    })
                });
            }
        }
    } catch (err) {
        console.error("❌ Error:", err);
    }

    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
