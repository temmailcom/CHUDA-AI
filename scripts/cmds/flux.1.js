const axios = require('axios');

module.exports.config = {
    name: "flux.1",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "User",
    description: "Generate an image based on a prompt using the provided API.",
    commandCategory: "image",
    usages: "[prompt]",
    cooldowns: 5
};

module.exports.onStart = function({ api, event }) {
    console.log("Command 'imagine' is starting...");
};

module.exports.run = async function({ api, event, args }) {
    const prompt = args.join(" ");
    
    if (!prompt) {
        return api.sendMessage("❌ You need to provide a prompt to generate an image.", event.threadID, event.messageID);
    }

    try {
        // Send a request to the image generation API
        const response = await axios.get("https://first-api-w496.onrender.com/api/flux", {
            params: { 
                prompt: prompt,
                apikey: "nusu"  // Use the provided API key
            },
            responseType: 'arraybuffer'  // Ensures the response is treated as binary data.
        });

        // Send the image to the chat
        api.sendMessage({
            body: `🖼️ Here is your image based on the prompt: "${prompt}"`,
            attachment: Buffer.from(response.data, 'binary')
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Failed to generate the image. Please try again later.", event.threadID, event.messageID);
    }
};
