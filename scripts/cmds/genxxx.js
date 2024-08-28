module.exports.config = {
    name: "genxxx",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Redwan",
    description: "Generate images using the gayhimu API",
    commandCategory: "image",
    usages: "[prompt]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    const prompt = args.join(" ");

    if (!prompt) {
        return api.sendMessage("Please provide a prompt to generate an image.", event.threadID, event.messageID);
    }

    const apiUrl = `https://redwan-re-chude.onrender.com/api/flux?prompt=${encodeURIComponent(prompt)}&apikey=himugay`;

    try {
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");

        api.sendMessage(
            {
                body: `Here's your image generated with the prompt: ${prompt}`,
                attachment: imageBuffer
            },
            event.threadID,
            event.messageID
        );
    } catch (error) {
        api.sendMessage("Error generating image. Please try again later.", event.threadID, event.messageID);
    }
};
