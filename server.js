const express = require('express');
const fetch = require('node-fetch');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.json());

// 1. Root route taaki website khulne par pata chale server zinda hai
app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

// 2. Universal Webhook Route (Chahe koi bhi URL ho, yeh sab catch kar lega)
app.post('*', async (req, res) => {
    console.log("🔥 Incoming Update from Telegram:", JSON.stringify(req.body));
    
    try {
        const update = req.body;
        if (update.message) {
            const chatId = update.message.chat.id.toString();
            const text = update.message.text || '';
            const userName = update.message.from.first_name || 'User';

            // Agar admin group se reply aaya hai
            if (chatId === ADMIN_CHAT_ID && update.message.reply_to_message) {
                const repliedText = update.message.reply_to_message.text || '';
                const match = repliedText.match(/User ID: (\d+)/);
                if (match && match[1]) {
                    const targetUserId = match[1];
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
            // Agar normal user ka message hai
            else if (chatId !== ADMIN_CHAT_ID) {
                if (text === '/start') {
                    await fetch(`${TELEGRAM_API}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: 'Namaste! AsiaFlix Request Bot par aapka swagat hai. Apni movie ya series ka naam yahan bhejiye! 🍿'
                        })
                    });
                } else {
                    // Admin group mein request bhejo
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
                            text: 'Aapki request admin ke paas bhej di gayi hai! Jald hi reply milega. 🌸'
                        })
                    });
                }
            }
        }
    } catch (err) {
        console.error("❌ Error processing update:", err);
    }

    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
