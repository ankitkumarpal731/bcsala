const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Aapka Proxy URL (Original file se liya gaya)
const YOUR_PROXY_API_URL = 'https://numinfo-proxy-api.vercel.app';

// Token environment variable se aayega (Security ke liye)
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
}

// Bot setup (Polling method)
const bot = new TelegramBot(token, { polling: true });

// Message Handler
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Start command
    if (text === '/start') {
        return bot.sendMessage(chatId, "Welcome! Apna phone number bhejein jiske baare mein info chahiye (e.g., 9876543210).");
    }

    // Agar user number bhejta hai
    bot.sendMessage(chatId, "Fetching details... ⏳");

    try {
        // API Call
        const response = await axios.get(`${YOUR_PROXY_API_URL}/?num=${text}`);
        
        // Data ko formatted text mein convert karna
        const data = response.data;
        let message = `📱 **Number Info:**\n\n`;
        
        // JSON object ko loop karke print karna
        for (const [key, value] of Object.entries(data)) {
            message += `🔹 *${key}:* ${value}\n`;
        }

        // Reply bhejna
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Error: Data nahi mila ya number galat hai.");
    }
});

// --- Express Server (Hosting ke liye zaroori hai) ---
// Render jaise platforms port bind mangte hain
app.get('/', (req, res) => {
    res.send('Telegram Bot is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});