const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sdfw",
    aliases: [],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using the NSFW API.",
    longDescription: "Generates an image using the provided prompt with the NSFW API.",
    category: "fun",
    guide: "{p}sdfw <prompt>"
  },
  onStart: async function ({ message, args, api, event }) {
    
    const obfuscatedAuthor = String.fromCharCode(82, 101, 100, 119, 97, 110);
    if (this.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    api.sendMessage("Please wait, we're making your picture...", event.threadID, event.messageID);

    try {
      const apiUrl = `https://redwans-nsfw.onrender.com/api/nsfw?prompt=${encodeURIComponent(prompt)}&apikey=redwan`;
      console.log(`Requesting URL: ${apiUrl}`); 

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      console.log("API response received"); 

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const imagePath = path.join(cacheDir, `${Date.now()}_sdfw_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));
      console.log(`Image saved at: ${imagePath}`); 

      const imageStream = fs.createReadStream(imagePath);
      api.sendMessage({
        body: `Here is your generated image for the prompt: "${prompt}"`,
        attachment: imageStream
      }, event.threadID);
      console.log("Image sent");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response ? error.response.data : error.message;
      api.sendMessage(`❌ | An error occurred: ${errorMessage}`, event.threadID);
    }
  }
};
