const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  config: {
    name: "pending",
    version: "1.0",
    author: "Redwan",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: ""
    },
    category: "Goat-alAuthor"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not an invalid number",
      cancelSuccess: "Refused %1 thread!",
      approveSuccess: "Approved successfully %1 threads!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending: "»「PENDING」«❮ The whole number of threads to approve is: %1 thread ❯\n\n%2",
      returnListClean: "「PENDING」There is no thread in the pending list",
      imageCreated: "Pending threads image created!"
    }
  },

  createPendingImage: async function (list) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const imgURL = 'https://i.ibb.co/hy5wQMJ/image.jpg';
    const imagePath = path.join(__dirname, 'pending_threads.png');

    try {
      // Load and draw the base image
      const image = await loadImage(imgURL);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Set text styles
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';

      let y = 30; // Starting y position
      ctx.fillText("Pending Threads List:", 20, y);
      y += 30;

      // Add list of pending threads
      for (const [index, thread] of list.entries()) {
        ctx.fillText(`${index + 1}. ${thread.name} (ID: ${thread.threadID})`, 20, y);
        y += 30;
      }

      // Save the image to a file
      const out = fs.createWriteStream(imagePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      return new Promise((resolve, reject) => {
        out.on('finish', () => {
          console.log('The image was created.');
          resolve(imagePath);
        });
        out.on('error', reject);
      });
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },

  onReply: async function({ api, event, Reply, getLang, commandName, prefix }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    var count = 0;

    if (isNaN(body) && body.indexOf("c") == 0 || body.indexOf("cancel") == 0) {
      const index = (body.slice(1, body.length)).split(/\s+/);
      for (const singleIndex of index) {
        console.log(singleIndex);
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
        count += 1;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        api.sendMessage(`•THIS GC HAS BEEN APPROVED BY REDWAN • ENJOY `, Reply.pending[singleIndex - 1].threadID);
        count += 1;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;

    var msg = "", index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) { 
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID) 
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list) msg += `${index++}/ ${single.name}(${single.threadID})\n`;

    if (list.length != 0) {
      try {
        // Create image with pending threads list
        const imagePath = await this.createPendingImage(list);
        api.sendMessage({
          body: getLang("returnListPending", list.length, msg),
          attachment: fs.createReadStream(imagePath)
        }, threadID, (err, info) => {
          if (err) {
            console.error('Error sending message:', err);
            return;
          }
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        }, messageID);
      } catch (error) {
        console.error('Error creating or sending image:', error);
        return api.sendMessage('Error creating or sending image.', threadID, messageID);
      }
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};
