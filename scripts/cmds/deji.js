const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "imagegen",
    aliases: ["deji1", "deji2"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using the Deji API.",
    longDescription: "Generates an image using the provided prompt with the Deji API.",
    category: "fun",
    guide: "{p}imagegen <deji1|deji2> <prompt>"
  },
  onStart: async function ({ message, args, api, event }) {
    const command = args[0];
    const prompt = args.slice(1).join(" ");

    // Validate command and prompt
    const validCommands = ["deji1", "deji2"];
    if (!validCommands.includes(command)) {
      return api.sendMessage("❌ | Invalid command. Use deji1 or deji2.", event.threadID);
    }

    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    api.sendMessage("Please wait, we're making your picture...", event.threadID, event.messageID);

    // Determine API URL
    let apiUrl;
    if (command === "deji1") {
      apiUrl = `https://violet-ray-red.onrender.com/flux_1_schnell?prompt=${encodeURIComponent(prompt)}`;
    } else if (command === "deji2") {
      apiUrl = `https://violet-ray-red.onrender.com/flux_1_dev?prompt=${encodeURIComponent(prompt)}`;
    }

    try {
      console.log(`Requesting URL: ${apiUrl}`);

      // Fetch image from API
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      console.log("API response received");

      // Prepare directory and file path for caching
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      // Ensure image path is valid
      const imagePath = path.join(cacheDir, `${Date.now()}_${command}_image.png`);
      if (typeof imagePath !== 'string') {
        throw new Error("Invalid image path");
      }

      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));
      console.log(`Image saved at: ${imagePath}`);

      // Send image to the user
      const imageStream = fs.createReadStream(imagePath);
      api.sendMessage({
        body: "Here is your generated image:",
        attachment: imageStream
      }, event.threadID);
      console.log("Image sent");
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID);
    }
  }
};
