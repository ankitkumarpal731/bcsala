const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Aapka Proxy URL
const YOUR_PROXY_API_URL = 'https://numinfo-proxy-api.vercel.app';

// Token environment variable se aayega
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
}

// Bot setup
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        return bot.sendMessage(chatId, "Welcome! Apna phone number bhejein (e.g., 9876543210).");
    }

    bot.sendMessage(chatId, "Fetching details... ⏳");

    try {
        const response = await axios.get(`${YOUR_PROXY_API_URL}/?num=${text}`);
        const apiResponse = response.data; // Poora API response

        let message = `📱 **Number Info:**\n\n`;

        // Check karein agar 'data' field ek object hai
        if (apiResponse.data && typeof apiResponse.data === 'object') {
            // Sirf andar wala data loop karein
            for (const [key, value] of Object.entries(apiResponse.data)) {
                message += `🔹 *${key}:* ${value}\n`;
            }
        } else {
            // Agar seedha data bahar hi hai (backup logic)
            for (const [key, value] of Object.entries(apiResponse)) {
                if (typeof value !== 'object') {
                    message += `🔹 *${key}:* ${value}\n`;
                }
            }
        }

        // Extra info (Optional)
        if (apiResponse.developer) message += `\n👨‍💻 Dev: ${apiResponse.developer}`;
        if (apiResponse.key_expiry) message += `\n⏳ Expiry: ${apiResponse.key_expiry}`;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Error: Data nahi mila ya format sahi nahi hai.");
    }
});

// --- Express Server for Render ---
app.get('/', (req, res) => {
    res.send('Telegram Bot is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
