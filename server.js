const express = require('express');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.json());

// 1. Root route
app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

// 2. Universal Webhook Route
app.post('*', async (req, res) => {
    console.log("🔥 Incoming Update:", JSON.stringify(req.body));
    console.log("🔍 Configured ADMIN_CHAT_ID:", ADMIN_CHAT_ID);
    
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
                    console.log("📤 Forwarding request to Admin Group ID:", ADMIN_CHAT_ID);
                    
                    // Admin group ko message bhejo
                    const adminRes = await fetch(`${TELEGRAM_API}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: ADMIN_CHAT_ID,
                            text: `📩 New Request!\n\n👤 Name: ${userName}\n🆔 User ID: ${chatId}\n💬 Request: "${text}"`
                        })
                    });
                    
                    const adminData = await adminRes.json();
                    console.log("📥 Telegram Response for Admin Group:", JSON.stringify(adminData));

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
        console.error("❌ Error in webhook processing:", err);
    }

    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
