const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is missing!');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.start((ctx) => {
    ctx.reply('Namaste! Mera naam AsiaFlix Request Bot hai. Main ab Render par 24/7 live hoon! 🚀');
});

// Basic message response
bot.on('text', (ctx) => {
    ctx.reply(`Aapne kaha: "${ctx.message.text}". Bot bilkul theek kaam kar raha hai! 🔥`);
});

// Launch bot (Polling mode)
bot.launch().then(() => {
    console.log('Telegram Bot started successfully!');
}).catch((err) => {
    console.error('Error starting bot:', err);
});

// Render ke liye Express server (port binding zaroori hai)
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('AsiaFlix Telegram Bot is running live on Render! 🌸');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
