const axios = require("axios");
const { getStreamFromURL } = global.utils;

async function getStreamAndSize(url, path = "") {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    headers: {
      Range: "bytes=0-",
    },
  });
  if (path) response.data.path = path;
  const totalLength = response.headers["content-length"];
  const contentDisposition = response.headers["content-disposition"];
  let match = contentDisposition.match(/filename\*\=UTF-8''(.+)/);

  let title;
  if (match && match[1]) {
    title = decodeURIComponent(match[1]);
  } else {
    match = contentDisposition.match(/filename="(.+?)"/);
    title = match ? match[1] : "Unknown";
  }

  return {
    title,
    stream: response.data,
    size: totalLength,
  };
}

module.exports = {
  config: {
    name: "ytb",
    version: "1.17",
    author: "tas33n",
    countDown: 5,
    role: 0,
    description: {
      en: "Download video, audio from YouTube",
    },
    category: "media",
    guide: {
      en:
        "   {pn} [video|-v] [<video name>|<video link>]: use to download video from youtube." +
        "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from youtube" +
        "\n   Example:" +
        "\n    {pn} -v Fallen Kingdom" +
        "\n    {pn} -a Fallen Kingdom",
    },
  },

  langs: {
    en: {
      error: "❌ An error occurred: %1",
      noResult: "⭕ No search results match the keyword %1",
      choose:
        "%1Reply to the message with a number to choose or any content to cancel",
      video: "video",
      audio: "audio",
      downloading: '⬇️ Downloading %1 "%2"',
      noVideo: "⭕ Sorry, no video was found with a size less than 83MB",
      noAudio: "⭕ Sorry, no audio was found with a size less than 26MB",
      info: "💠 Title: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Video duration: %4\n👀 View count: %5\n👍 Like count: %6\n🆙 Upload date: %7\n🔠 ID: %8\n🔗 Link: %9",
    },
  },

  onStart: async function ({ args, message, event, commandName, getLang }) {
    let type;
    switch (args[0]) {
      case "-v":
      case "video":
        type = "video";
        break;
      case "-a":
      case "audio":
        type = "audio";
        break;
      default:
        return message.SyntaxError();
    }

    const checkurl =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const urlYtb = checkurl.test(args[1]);

    if (urlYtb) {
      handle({ type, url: args[1], message, event, getLang });
      return;
    }

    let keyWord = args.slice(1).join(" ");
    keyWord = keyWord.includes("?feature=share")
      ? keyWord.replace("?feature=share", "")
      : keyWord;
    const maxResults = 6;

    let result;
    try {
      result = (await search(keyWord)).slice(0, maxResults);
    } catch (err) {
      return message.reply(getLang("error", err.message));
    }
    if (result.length == 0) return message.reply(getLang("noResult", keyWord));
    let msg = "";
    let i = 1;
    const thumbnails = [];

    for (const info of result) {
      thumbnails.push(getStreamFromURL(info.thumbnail));
      msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${
        info.channel.name
      }\n\n`;
    }

    message.reply(
      {
        body: getLang("choose", msg),
        attachment: await Promise.all(thumbnails),
      },
      (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          result,
          type,
        });
      }
    );
  },

  onReply: async ({ event, api, Reply, message, getLang }) => {
    const { result, type } = Reply;
    const choice = event.body;
    if (!isNaN(choice) && choice <= 6) {
      const infoChoice = result[choice - 1];
      const url = `https://www.youtube.com/watch?v=${infoChoice.id}`;
      api.unsendMessage(Reply.messageID);
      await handle({ type, url, api, message, getLang });
    } else api.unsendMessage(Reply.messageID);
  },
};

async function handle({ type, url, api, message, getLang }) {
  try {
    const msgSend = message.reply("Downloading....");
    const cobaltResponse = await axios.post(
      "https://api.cobalt.tools/api/json",
      {
        url: url,
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        filenamePattern: "basic",
        isAudioOnly: type === "audio",
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (cobaltResponse.data.status !== "stream") {
      return await api.editMessage(
        getLang(
          "error",
          "Cobalt API returned an unexpected status.",
          msgSend.messageID
        )
      );
    }

    const streamUrl = cobaltResponse.data.url;
    const { title, stream, size } = await getStreamAndSize(streamUrl);
    const MAX_SIZE = type === "video" ? 83 * 1024 * 1024 : 26 * 1024 * 1024;
    if (size > MAX_SIZE) {
      return await api.editMessage(
        getLang(type === "video" ? "noVideo" : "noAudio"),
        msgSend.messageID
      );
    }

    message.reply(
      {
        body: title,
        attachment: await getStreamFromURL(
          streamUrl,
          `ytb_videoAudioStream.${type === "video" ? "mp4" : "mp3"}`
        ),
      },
      async (err) => {
        if (err) return message.reply(getLang("error", err.message));
        message.unsend(msgSend.messageID);
      }
    );
  } catch (error) {
    console.error("Error:", error);
    message.unsend(msgSend.messageID);
    return message.reply(getLang("error", error.message));
  }
}

async function search(keyWord) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      keyWord
    )}`;
    const res = await axios.get(url);
    const getJson = JSON.parse(
      res.data.split("ytInitialData = ")[1].split(";</script>")[0]
    );
    const videos =
      getJson.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents[0].itemSectionRenderer.contents;
    const results = [];
    for (const video of videos)
      if (video.videoRenderer?.lengthText?.simpleText)
        results.push({
          id: video.videoRenderer.videoId,
          title: video.videoRenderer.title.runs[0].text,
          thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
          time: video.videoRenderer.lengthText.simpleText,
          channel: {
            id: video.videoRenderer.ownerText.runs[0].navigationEndpoint
              .browseEndpoint.browseId,
            name: video.videoRenderer.ownerText.runs[0].text,
            thumbnail:
              video.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails
                .pop()
                .url.replace(/s[0-9]+\-c/g, "-c"),
          },
        });
    return results;
  } catch (e) {
    const error = new Error("Cannot search video");
    error.code = "SEARCH_VIDEO_ERROR";
    throw error;
  }
}
