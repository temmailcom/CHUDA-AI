const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pendingApproval",
    aliases: ["approve"],
    version: "3.0",
    author: "ChatGPT",
    countDown: 5,
    role: 1,
    shortDescription: "Manage pending group approvals with advanced options.",
    longDescription: "Advanced management of pending group join requests with automatic approval/rejection, custom notifications, and more.",
    category: "admin",
    guide: "{pn} approve <accept|reject|select|auto> [userIDs|filters] - Manage pending approvals with advanced features."
  },

  onStart: async function ({ api, event, args }) {
    const action = args[0];
    const threadID = event.threadID;

    try {
      // Retrieve thread information to get pending approvals
      const threadInfo = await api.getThreadInfo(threadID);
      const pendingUsers = threadInfo.approvalRequests;

      if (!pendingUsers || pendingUsers.length === 0) {
        return api.sendMessage("There are no pending approvals.", threadID);
      }

      // Automatic Approval/Reject Logic
      if (action === "auto") {
        const criteria = args[1]; // e.g., "keyword", "no-pic", etc.
        const approved = [];
        const rejected = [];

        for (const user of pendingUsers) {
          if (meetsCriteria(user, criteria)) {
            await api.approveJoinRequest(threadID, user.userID);
            approved.push(user.name);
            sendCustomMessage(api, threadID, user.userID, "approved");
          } else {
            await api.removeUserFromGroup(user.userID, threadID);
            rejected.push(user.name);
            sendCustomMessage(api, threadID, user.userID, "rejected");
          }
        }

        return api.sendMessage(`Auto-approval completed.\n\nApproved: ${approved.join(", ")}\nRejected: ${rejected.join(", ")}`, threadID);
      }

      // Selective Approval/Reject
      if (action === "select") {
        const userIDs = args.slice(1);
        if (userIDs.length === 0) {
          return api.sendMessage("Please provide the user IDs to approve/reject.", threadID);
        }

        const confirmMessage = `Are you sure you want to ${args[1]} the following users?\n\n${userIDs.join(", ")}`;
        return api.sendMessage(confirmMessage, threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'select',
            userIDs,
            action: args[1]
          });
        });
      }

      // Bulk Approvals/Rejects with Filters
      if (action === "bulk") {
        const filter = args[1]; // e.g., "has-pic", "keyword", etc.
        const actionType = args[2]; // "approve" or "reject"
        const filteredUsers = filterUsers(pendingUsers, filter);
        const userIDs = filteredUsers.map(user => user.userID);

        return performBulkAction(api, threadID, userIDs, actionType);
      }

    } catch (error) {
      console.error(`Failed to execute command: ${error.message}`);
      api.sendMessage(`❌ | An error occurred: ${error.message}`, threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { type, userIDs, action } = Reply;
    const threadID = event.threadID;

    if (type === "select") {
      try {
        const approved = [];
        const rejected = [];

        for (const userID of userIDs) {
          if (action === "approve") {
            await api.approveJoinRequest(threadID, userID);
            approved.push(userID);
            sendCustomMessage(api, threadID, userID, "approved");
          } else if (action === "reject") {
            await api.removeUserFromGroup(userID, threadID);
            rejected.push(userID);
            sendCustomMessage(api, threadID, userID, "rejected");
          }
        }

        return api.sendMessage(`Selected action completed.\n\nApproved: ${approved.join(", ")}\nRejected: ${rejected.join(", ")}`, threadID);
      } catch (error) {
        console.error(`Failed to execute action: ${error.message}`);
        api.sendMessage(`❌ | An error occurred: ${error.message}`, threadID);
      }
    }
  }
};

// Helper Functions

function meetsCriteria(user, criteria) {
  // Define your criteria logic here
  if (criteria === "no-pic") {
    return !user.profilePic;
  }
  if (criteria === "keyword") {
    return user.name.toLowerCase().includes("specific-keyword");
  }
  return false;
}

function filterUsers(users, filter) {
  // Implement your filter logic here
  return users.filter(user => {
    if (filter === "has-pic") {
      return !!user.profilePic;
    }
    if (filter === "keyword") {
      return user.name.toLowerCase().includes("specific-keyword");
    }
    return false;
  });
}

async function performBulkAction(api, threadID, userIDs, actionType) {
  const approved = [];
  const rejected = [];

  for (const userID of userIDs) {
    if (actionType === "approve") {
      await api.approveJoinRequest(threadID, userID);
      approved.push(userID);
      sendCustomMessage(api, threadID, userID, "approved");
    } else if (actionType === "reject") {
      await api.removeUserFromGroup(userID, threadID);
      rejected.push(userID);
      sendCustomMessage(api, threadID, userID, "rejected");
    }
  }

  return api.sendMessage(`Bulk action completed.\n\nApproved: ${approved.join(", ")}\nRejected: ${rejected.join(", ")}`, threadID);
}

function sendCustomMessage(api, threadID, userID, status) {
  const message = status === "approved" ? "Welcome to the group!" : "Sorry, your join request was rejected.";
  api.sendMessage({ body: message }, threadID);
}
