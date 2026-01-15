const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Aapka Proxy URL
const YOUR_PROXY_API_URL = 'https://numinfo-proxy-api.vercel.app';

// Token environment variable se
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing! Make sure to set it in Render Environment Variables.");
}

// Bot setup
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Start command
    if (text === '/start') {
        return bot.sendMessage(chatId, "👋 Welcome! Koi bhi phone number bhejein (e.g., 9876543210) details janne ke liye.");
    }

    // User ko batayein ki process chal raha hai
    bot.sendMessage(chatId, "🔍 Searching details... ⏳");

    try {
        // API Request
        const response = await axios.get(`${YOUR_PROXY_API_URL}/?num=${text}`);
        const apiResponse = response.data;

        let message = `📱 **Number Info:**\n\n`;
        
        // --- DATA EXTRACTING LOGIC (Sudhara hua) ---
        let infoData = apiResponse.data;

        // 1. Agar 'data' field missing hai, toh shayad direct response hi data ho
        if (!infoData) {
            infoData = apiResponse;
        }

        // 2. CHECK: Agar data ek Array (List) hai (jaise [ {...} ]), toh pehla item nikalo
        // Yeh line us "0: object Object" wali problem ko fix karegi
        if (Array.isArray(infoData)) {
            infoData = infoData[0];
        }

        // 3. Agar infoData ab ek object hai, toh uske andar ki details print karo
        if (infoData && typeof infoData === 'object') {
            for (const [key, value] of Object.entries(infoData)) {
                // Agar value null, undefined ya empty nahi hai, tabhi print karein
                if (value !== null && value !== undefined && value !== "") {
                    
                    // Agar value abhi bhi object hai (nested), toh usse ignore karein taaki [object Object] na aaye
                    if (typeof value === 'object') {
                        continue; 
                    }
                    
                    // Key ko thoda saaf dikhane ke liye (Phela letter bada karein)
                    const cleanKey = key.charAt(0).toUpperCase() + key.slice(1);
                    message += `🔹 *${cleanKey}:* ${value}\n`;
                }
            }
        } else {
            message += "⚠️ Data format unknown or empty.";
        }

        // --- DEVELOPER & EXTRA INFO ---
        if (apiResponse.developer) {
            message += `\n👨‍💻 **Dev:** ${apiResponse.developer}`;
        }
        if (apiResponse.key_expiry) {
            message += `\n⏳ **Expiry:** ${apiResponse.key_expiry}`;
        }

        // Message bhejein
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("API Error:", error.message);
        bot.sendMessage(chatId, "❌ Error: Data nahi mila. Kripya number check karein ya baad mein try karein.");
    }
});

// --- Express Server (Render ko zinda rakhne ke liye) ---
app.get('/', (req, res) => {
    res.send('Telegram Bot is Running smoothly!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
