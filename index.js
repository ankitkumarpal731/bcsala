const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Aapka Proxy URL
const YOUR_PROXY_API_URL = 'https://numinfo-proxy-api.vercel.app';
// Aapka Channel Username
const CHANNEL_USERNAME = '@EhcoderGec'; 

// Token environment variable se
const token = process.env.TELEGRAM_BOT_TOKEN;

// Bot setup
const bot = new TelegramBot(token, { polling: true });

// Memory storage for users
const users = new Set();

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || "User";

    users.add(chatId);

    // --- 1. CHANNEL JOIN CHECK ---
    try {
        const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
        const status = chatMember.status;

        if (status === 'left' || status === 'kicked') {
            return bot.sendMessage(chatId, `⚠️ **Rukiye ${firstName}!**\n\nIs bot ko use karne ke liye hamara channel join karna zaroori hai.`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🚀 Join Channel Now", url: "https://t.me/EhcoderGec" }]
                    ]
                }
            });
        }
    } catch (error) {
        // Admin error ignore karein (taaki bot ruke nahi)
    }

    // --- 2. COMMANDS ---
    if (text === '/start') {
        const welcomeMsg = `
👋 **Namaste ${firstName}!**

Swagat hai **Number Info Bot** mein. 🤖

🔍 **Main kya kar sakta hoon?**
Main kisi bhi Indian Mobile Number ki details nikaal sakta hoon.

🚀 **Kaise Use Karein?**
Bas number bhejein (Example: \`9876543210\`)

⚡ _Powered by EhcoderGec_
        `;
        return bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
    }

    if (text === '/stats') {
        return bot.sendMessage(chatId, `📊 **Status:**\nActive Users: ${users.size}`);
    }

    // --- 3. NUMBER INFO LOGIC ---
    bot.sendMessage(chatId, "🔍 **Searching details...** ⏳", { parse_mode: 'Markdown' });

    try {
        const response = await axios.get(`${YOUR_PROXY_API_URL}/?num=${text}`);
        let infoData = response.data;

        // Data Structure Fix
        if (infoData.data) infoData = infoData.data;
        if (Array.isArray(infoData)) infoData = infoData[0];

        let message = `📱 **Mobile Number Info:**\n\n`;
        let found = false;

        if (infoData && typeof infoData === 'object') {
            for (const [key, value] of Object.entries(infoData)) {
                // Khali values hatein
                if (value !== null && value !== undefined && value !== "") {
                    if (typeof value === 'object') continue;

                    // --- KEY FORMATTING (e.g. father_name -> Father Name) ---
                    let cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    // --- VALUE CLEANING (Address fix) ---
                    let cleanValue = value.toString();
                    
                    // Agar Address hai, to '!' hata kar comma lagayein
                    if (key.toLowerCase().includes('address')) {
                        cleanValue = cleanValue.replace(/!+/g, ', ').replace(/, ,/g, ',').trim();
                        // Agar end mein comma reh jaye
                        if (cleanValue.endsWith(', ')) cleanValue = cleanValue.slice(0, -2);
                    }

                    message += `🔹 *${cleanKey}:* \`${cleanValue}\`\n`;
                    found = true;
                }
            }
        }

        if (!found) {
            message = "❌ **No Data Found!**\nNumber check karke dobara try karein.";
        } else {
            // Footer
            message += `\n━━━━━━━━━━━━━━━━━━\n✅ *Joined:* @EhcoderGec`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        bot.sendMessage(chatId, "❌ **Error:** Number sahi format mein nahi hai.");
    }
});

// --- Express Server ---
app.get('/', (req, res) => {
    res.send('Bot is Running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
