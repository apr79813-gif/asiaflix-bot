const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// CONFIGURATIONS
const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_CHAT_ID = "-1004303101631";

// Temporary memory to store User Chat IDs mapped by their Username or Ticket ID
// (Production me aap isse database ya Google Sheets me store kar sakte hain)
const userSessionMap = new Map();

// 1. Endpoint: Jab user website se Request ya Support Ticket bhejega
app.post('/api/send-ticket', async (req, res) => {
    try {
        const { username, category, title, message, type } = req.body;
        
        let messageText = "";
        if (type === 'request') {
            messageText = `🎬 *NEW DRAMA REQUEST* 🌸\n\n` +
                          `👤 *User:* @${username}\n` +
                          `📌 *Title:* ${title}\n` +
                          `🔊 *Audio:* ${category}\n` +
                          `📝 *Message:* ${message}\n\n` +
                          `🌐 _Sent via AsiaFlix Prime Portal_`;
        } else {
            messageText = `🎧 *NEW SUPPORT TICKET* 🎧\n\n` +
                          `👤 *User:* @${username}\n` +
                          `⚠️ *Issue:* ${category}\n` +
                          `🎬 *Drama:* ${title}\n` +
                          `💬 *Message:* ${message}\n\n` +
                          `🌐 _Sent via AsiaFlix Prime Portal_`;
        }

        // Send message to Admin Group via Bot
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${GROUP_CHAT_ID}&text=${encodeURIComponent(messageText)}&parse_mode=Markdown`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.ok) {
            // Hum yahan mock chat ID map kar rahe hain (Real implementation me user ka chat_id bot ke /start se aayega)
            res.json({ success: true, message: "Sent to group successfully!" });
        } else {
            res.json({ success: false, error: data.description });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Telegram Webhook: Jab admin group me reply karega, yeh endpoint sunega
app.post(`/webhook/${BOT_TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        // Check if message is a reply in the group
        if (update.message && update.message.reply_to_message) {
            const repliedMessageText = update.message.reply_to_message.text;
            const adminReplyText = update.message.text;

            // Extract username from the original notification message text
            const match = repliedMessageText.match(/👤 \*User:\* @([a-zA-Z0-9_]+)/);
            if (match && match[1]) {
                const targetUsername = match[1];
                
                // Note: Real routing ke liye user ka chat_id hona zaroori hai. 
                // Jaise hi user ek baar bot ko /start karega, uska chat_id yahan map ho jayega.
                const targetChatId = userSessionMap.get(targetUsername);

                if (targetChatId) {
                    // Send Direct Message (DM) to User privately
                    const dmUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${targetChatId}&text=${encodeURIComponent("🛡️ *Admin Response:* " + adminReplyText)}&parse_mode=Markdown`;
                    await fetch(dmUrl);
                }
            }
        }

        // Track user chat_id when they interact with bot (/start)
        if (update.message && update.message.text && update.message.text.startsWith('/start')) {
            const chatId = update.message.chat.id;
            const username = update.message.from.username;
            if (username) {
                userSessionMap.set(username, chatId);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook Error:", err);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AsiaFlix Bot Server running on port ${PORT}`);
});
