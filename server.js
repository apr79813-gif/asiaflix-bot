const express = require('express');
const fetch = require('node-fetch');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID; // Yahan tera admin group ka chat ID aayega
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.json());

app.post(`/api/${BOT_TOKEN}`, async (req, res) => {
    const update = req.body;

    if (update.message) {
        const chatId = update.message.chat.id.toString();
        const text = update.message.text;
        const userName = update.message.from.first_name || 'User';

        // 1. Agar message Admin Group se aaya hai aur admin kisi message ka reply kar raha hai
        if (chatId === ADMIN_CHAT_ID && update.message.reply_to_message) {
            const repliedText = update.message.reply_to_message.text || '';
            
            // Message se User ID extract karna (e.g., "User ID: 123456")
            const match = repliedText.match(/User ID: (\d+)/);
            if (match && match[1]) {
                const targetUserId = match[1];
                // User ko admin ka reply bhej do
                await fetch(`${TELEGRAM_API}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: targetUserId,
                        text: `🎬 Admin ka jawab:\n\n${text}`
                    })
                });
            }
        } 
        // 2. Agar message normal user ka hai
        else if (chatId !== ADMIN_CHAT_ID) {
            if (text === '/start') {
                await fetch(`${TELEGRAM_API}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: 'Namaste! AsiaFlix Request Bot par aapka swagat hai. Apni movie ya series ka naam yahan bhejiye, admin jald hi reply karenge! 🍿'
                    })
                });
            } else {
                // User ka message admin group par forward/send karo
                await fetch(`${TELEGRAM_API}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: ADMIN_CHAT_ID,
                        text: `📩 New Request!\n\n👤 Name: ${userName}\n🆔 User ID: ${chatId}\n💬 Request: "${text}"`
                    })
                });

                // User ko confirmation do
                await fetch(`${TELEGRAM_API}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: 'Aapki request admin ke paas bhej di gayi hai! Jald hi movie link milega. 🌸'
                    })
                });
            }
        }
    }

    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
