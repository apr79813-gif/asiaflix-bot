const express = require('express');
const https = require('https');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID ? process.env.ADMIN_CHAT_ID.trim() : '-1004303101631';

app.use(express.json());

// Telegram API ko request bhejne ke liye safe function
function sendTelegramMessage(chatId, text, replyToMessageId = null) {
    const cleanChatId = chatId ? chatId.toString().trim() : '';
    const data = JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        reply_to_message_id: replyToMessageId
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`📤 Telegram API Response for Chat ${cleanChatId}:`, responseBody);
        });
    });

    req.on('error', (error) => {
        console.error(`❌ Telegram Request Error:`, error);
    });

    req.write(data);
    req.end();
}

app.get('/', (req, res) => {
    res.send('AsiaFlix Request Bot is running live! 🌸');
});

// Test route taaki browser se bot turant group me message bhej sake
app.get('/test-group', (req, res) => {
    const data = JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: '🤖 Hello AsiaFlix Admin Group! Bot is now active here!'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk);
        apiRes.on('end', () => {
            res.send(JSON.parse(body));
        });
    });

    apiReq.write(data);
    apiReq.end();
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
                    sendTelegramMessage(targetUserId, `🎬 Admin ka jawab:\n\n${text}`);
                }
            } 
            // 2. Agar normal user ka private message hai
            else if (chatId !== ADMIN_CHAT_ID) {
                if (text === '/start') {
                    sendTelegramMessage(chatId, 'Namaste! AsiaFlix Request Bot par aapka swagat hai. Apni movie ya series ka naam yahan bhejiye! 🍿');
                } else {
                    console.log(`🚀 Sending request to Admin Group (${ADMIN_CHAT_ID})...`);
                    sendTelegramMessage(
                        ADMIN_CHAT_ID, 
                        `📩 New Request!\n\n👤 Name: ${userName}\n🆔 User ID: ${chatId}\n💬 Request: "${text}"`
                    );

                    sendTelegramMessage(chatId, 'Aapki request admin ke paas bhej di gayi hai! Jald hi reply milega. 🌸');
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
