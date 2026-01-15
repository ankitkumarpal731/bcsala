const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Aapka Proxy URL
const YOUR_PROXY_API_URL = 'https://numinfo-proxy-api.vercel.app';
// Aapka Channel Username (Bot ko yahan Admin banana zaroori hai)
const CHANNEL_USERNAME = '@EhcoderGec'; 

// Token environment variable se
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
}

// Bot setup
const bot = new TelegramBot(token, { polling: true });

// Simple User Counter (Memory mein store hoga)
const users = new Set();

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || "User";

    // User ko list mein add karein
    users.add(chatId);

    // --- 1. CHANNEL JOIN CHECK (FORCE SUBSCRIBE) ---
    try {
        // User ka status check karein
        const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
        const status = chatMember.status;

        // Agar user member nahi hai (left, kicked, ya restricted)
        if (status === 'left' || status === 'kicked') {
            return bot.sendMessage(chatId, `⚠️ **Access Denied!**\n\n${firstName}, is bot ko use karne ke liye hamara channel join karna zaroori hai.`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🚀 Join Channel Now", url: "https://t.me/EhcoderGec" }]
                    ]
                }
            });
        }
    } catch (error) {
        // Agar bot channel mein Admin nahi hai, toh error aayega.
        console.error("Channel Check Error (Bot ko Channel me Admin banayein):", error.message);
        // Error ke bawajood hum user ko rok nahi rahe taaki bot fail na ho, 
        // par aap console check karke admin bana lena.
    }

    // --- 2. COMMANDS ---
    
    // /start Command (Stylish Welcome)
    if (text === '/start') {
        const welcomeMsg = `
👋 **Namaste ${firstName}!**

Swagat hai **TrueCaller & Info Bot** mein. 🤖

🔍 **Main kya kar sakta hoon?**
Main kisi bhi Indian Mobile Number ki **Location, Operator aur Owner Name** nikaal kar de sakta hoon.

🚀 **Kaise Use Karein?**
Bas wo **Phone Number** likh kar bhejein jiske baare mein jaanna hai.
(Example: \`9876543210\`)

⚡ _Fast & Free Service by EhcoderGec_
        `;
        return bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
    }

    // /stats Command (Sirf aapke dekhne ke liye - Hidden)
    if (text === '/stats') {
        return bot.sendMessage(chatId, `📊 **Live Status:**\n\n👥 Total Users (Session): ${users.size}\n✅ Bot is Running.`);
    }

    // --- 3. NUMBER INFO LOGIC ---
    
    // Agar koi '/start' ya '/stats' nahi bhej raha, toh maan lete hain number hai
    bot.sendMessage(chatId, "🔍 **Searching details...** ⏳", { parse_mode: 'Markdown' });

    try {
        const response = await axios.get(`${YOUR_PROXY_API_URL}/?num=${text}`);
        const apiResponse = response.data;

        let infoData = apiResponse.data;

        // Fix: Agar data array hai
        if (!infoData) infoData = apiResponse;
        if (Array.isArray(infoData)) infoData = infoData[0];

        let message = `📱 **Mobile Number Info:**\n\n`;
        let found = false;

        if (infoData && typeof infoData === 'object') {
            for (const [key, value] of Object.entries(infoData)) {
                if (value !== null && value !== undefined && value !== "") {
                    if (typeof value === 'object') continue;
                    
                    // Format Key (Address_name -> Address Name)
                    const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    message += `🔹 *${cleanKey}:* \`${value}\`\n`;
                    found = true;
                }
            }
        }

        if (!found) {
            message = "❌ **No Data Found!**\nKripya number check karein.";
        } else {
            // Footer (Bina Dev Name aur Expiry ke)
            message += `\n━━━━━━━━━━━━━━━━━━\n✅ *Joined:* @EhcoderGec`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        bot.sendMessage(chatId, "❌ **Error:** Number sahi format mein bhejein (e.g., 9999999999).");
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
