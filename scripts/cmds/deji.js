const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "imagegen",
    aliases: ["flux", "flux-dev", "nsfw", "reality", "sdxl"],
    author: "Redwan",
    version: "1.4",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using various APIs.",
    longDescription: "Generates an image using the provided prompt with different APIs including Flux, Flux-Dev, NSFW, Reality, and SDXL.",
    category: "fun",
    guide: "{p}imagegen <flux|flux-dev|nsfw|reality|sdxl> <prompt>\n\nExample: {p}imagegen sdxl A beautiful sunset"
  },
  onStart: async function ({ message, args, api, event }) {
    const command = args[0];
    const prompt = args.slice(1).join(" ");

    // Available generators
    const availableGenerators = {
      flux: "Generates images using the flux_1_schnell model.",
      "flux-dev": "Generates images using the flux_1_dev model.",
      nsfw: "Generates NSFW images.",
      reality: "Generates images using the flux_80s_cyberpunk model.",
      sdxl: "Generates images using the SDXL model."
    };

    // Show available generators if no command is provided or if `help` is requested
    if (!command || command === "help") {
      const generatorList = Object.keys(availableGenerators)
        .map(cmd => `${cmd}: ${availableGenerators[cmd]}`)
        .join("\n");
      return api.sendMessage(`Available generators:\n${generatorList}`, event.threadID);
    }

    // Validate command and prompt
    if (!Object.keys(availableGenerators).includes(command)) {
      return api.sendMessage("❌ | Invalid command. Use `imagegen help` to see available generators.", event.threadID);
    }

    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    api.sendMessage("Please wait, we're making your picture...", event.threadID, event.messageID);

    // Determine API URL
    let apiUrl;
    if (command === "flux") {
      apiUrl = `https://violet-ray-red.onrender.com/flux_1_schnell?prompt=${encodeURIComponent(prompt)}`;
    } else if (command === "flux-dev") {
      apiUrl = `https://violet-ray-red.onrender.com/flux_1_dev?prompt=${encodeURIComponent(prompt)}`;
    } else if (command === "nsfw") {
      apiUrl = `https://redwans-nsfw.onrender.com/api/nsfw?prompt=${encodeURIComponent(prompt)}&apikey=redwan`;
    } else if (command === "reality") {
      apiUrl = `https://redwans-reality.onrender.com/api/flux_80s_cyberpunk?prompt=${encodeURIComponent(prompt)}&apikey=redwan`;
    } else if (command === "sdxl") {
      apiUrl = `https://redwans-free-sdxl.onrender.com/api/sdxl?prompt=${encodeURIComponent(prompt)}`;
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
