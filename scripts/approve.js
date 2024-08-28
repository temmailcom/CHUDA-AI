const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "approve",
    version: "2.2",
    author: "HIMU",
    role: 2, // Admin only
  },

  onStart: async function ({ api, args, event, threadsData, getLang }) {
    if (args.length < 1) {
      return api.sendMessage({
        body: "❌ | Missing arguments.\nUsage: {pn} [approve|reject|list] <threadID> <reason>\nExample: {pn} approve 1234567890 Welcome to the group!",
        attachment: [],
      }, event.threadID);
    }

    const action = args[0].toLowerCase();

    if (action === "list") {
      return listPendingGroups(api, event, threadsData, getLang);
    }

    if (args.length < 2) {
      return api.sendMessage({
        body: "❌ | Missing threadID or reason.\nUsage: {pn} [approve|reject] <threadID> <reason>\nExample: {pn} approve 1234567890 Welcome to the group!",
        attachment: [],
      }, event.threadID);
    }

    const threadID = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    if (action !== "approve" && action !== "reject") {
      return api.sendMessage({
        body: "❌ | Invalid action. Use `approve`, `reject`, or `list`.\nExample: {pn} approve 1234567890 Welcome to the group!",
        attachment: [],
      }, event.threadID);
    }

    try {
      // Log command usage
      logCommandUsage(event.senderID, action, threadID, reason);

      // Get all threads with pending status
      const pendingThreads = await threadsData.getAll(); // Adjust this method based on your actual implementation
      const thread = pendingThreads.find(t => t.threadID === threadID);

      if (!thread) {
        return api.sendMessage({
          body: "❌ | Thread not found in pending approval list.\nPlease check the thread ID and try again.",
          attachment: [],
        }, event.threadID);
      }

      // Request confirmation from user
      const confirmationMessage = {
        body: `Are you sure you want to ${action} this thread?\nThread ID: ${threadID}\nReason: ${reason}`,
        quickReplies: [
          { content_type: "text", title: "Yes", payload: `confirm_${action}_${threadID}` },
          { content_type: "text", title: "No", payload: `cancel_${action}_${threadID}` }
        ]
      };
      api.sendMessage(confirmationMessage, event.threadID);
      
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage({
        body: "❌ | An error occurred. Please try again later.\nError details: " + error.message,
        attachment: [],
      }, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, threadsData, getLang }) {
    const [action, threadID] = Reply.payload.split('_').slice(1);

    if (event.body === "Yes") {
      try {
        if (action === "approve") {
          await api.approveThread(threadID);
          api.sendMessage({
            body: `✅ | Thread ${threadID} has been approved!\nReason: ${Reply.reason}`,
            attachment: [],
          }, event.threadID);
        } else if (action === "reject") {
          await api.rejectThread(threadID);
          api.sendMessage({
            body: `❌ | Thread ${threadID} has been rejected.\nReason: ${Reply.reason}`,
            attachment: [],
          }, event.threadID);
        }

        // Log approval/rejection
        logApprovalRejection(event.senderID, action, threadID);

      } catch (error) {
        console.error("Error:", error);
        api.sendMessage({
          body: "❌ | An error occurred while processing your request. Please try again later.\nError details: " + error.message,
          attachment: [],
        }, event.threadID);
      }
    } else {
      api.sendMessage({
        body: "❌ | Action cancelled.",
        attachment: [],
      }, event.threadID);
    }
  }
};

// Function to list pending groups
async function listPendingGroups(api, event, threadsData, getLang) {
  try {
    const pendingThreads = await threadsData.getAll(); // Adjust based on your implementation
    const pendingCount = pendingThreads.length;

    const listMessage = pendingCount > 0
      ? `There are ${pendingCount} groups pending approval.`
      : "There are no groups pending approval.";

    api.sendMessage({
      body: listMessage,
      attachment: [],
    }, event.threadID);

  } catch (error) {
    console.error("Error:", error);
    api.sendMessage({
      body: "❌ | An error occurred while listing pending groups. Please try again later.\nError details: " + error.message,
      attachment: [],
    }, event.threadID);
  }
}

// Function to log command usage
function logCommandUsage(userID, action, threadID, reason) {
  const logMessage = `User ${userID} issued ${action} command on thread ${threadID} with reason: ${reason}`;
  fs.appendFileSync(path.join(__dirname, 'logs', 'commandUsage.log'), `${new Date().toISOString()} - ${logMessage}\n`);
}

// Function to log approval/rejection
function logApprovalRejection(userID, action, threadID) {
  const logMessage = `User ${userID} ${action}d thread ${threadID}`;
  fs.appendFileSync(path.join(__dirname, 'logs', 'approvalRejection.log'), `${new Date().toISOString()} - ${logMessage}\n`);
            }
