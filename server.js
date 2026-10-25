const express = require('express');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : '8967050529:AAFnXQG_sH5YqkxJBUkPzkqDkMeUc2kLUVA';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID ? process.env.ADMIN_CHAT_ID.trim() : '-1004303101631';

app.use(express.json());

// Website jaisa exact fetch method jo 100% kaam karta hai!
async function sendTelegramMessage(chatId, text) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(`📤 Telegram Response for Chat ${chatId}:`, JSON.stringify(data));
        return data;
    } catch (err) {
        console.error(`❌ Telegram Request Error:`, err);
    }
}

app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

// Test route
app.get('/test-group', async (req, res) => {
    const result = await sendTelegramMessage(ADMIN_CHAT_ID, '🤖 Hello AsiaFlix Admin Group! Bot is now active via Server!');
    res.send(result);
});

app.post('*', async (req, res) => {
    try {
        const update = req.body;
        console.log("🔥 Incoming Update:", JSON.stringify(update));

        if (update.message) {
            const chatId = update.message.chat.id.toString();
            const text = update.message.text || '';
            const userName = update.message.from.first_name || 'User';

            // 1. Agar admin group se reply aaya hai
            if (chatId === ADMIN_CHAT_ID && update.message.reply_to_message) {
                const repliedText = update.message.reply_to_message.text || '';
                const match = repliedText.match(/User ID: (\d+)/);
                if (match && match[1]) {
                    const targetUserId = match[1];
                    // CLEAN ADMIN REPLY FORMAT
                    await sendTelegramMessage(targetUserId, `Admin 🛡️:\n\n${text}`);
                }
            } 
            // 2. Agar normal user ka private message hai
            else if (chatId !== ADMIN_CHAT_ID) {
                if (text === '/start') {
                    await sendTelegramMessage(chatId, 'Namaste! AsiaFlix Request Bot par aapka swagat hai. Apni movie ya series ka naam yahan bhejiye! 🍿');
                } else {
                    console.log(`🚀 Sending request to Admin Group (${ADMIN_CHAT_ID})...`);
                    await sendTelegramMessage(
                        ADMIN_CHAT_ID, 
                        `📩 *New Request!*\n\n👤 *Name:* ${userName}\n🆔 *User ID:* ${chatId}\n💬 *Request:* "${text}"`
                    );

                    // SHORT & CLEAN AUTO-REPLY
                    await sendTelegramMessage(chatId, 'Request sent! 🌸\nAsiaFlix Prime 🚀');
                }
            }
        }
    } catch (err) {
        console.error("❌ Server Error:", err);
    }

    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
