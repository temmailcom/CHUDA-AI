module.exports = {
    config: {
        name: "redwan",
        version: "1.0",
        author: "xemonbae", //** original author fb I'd : https://m.me/MR.AYAN.2X **//
        countDown: 5,
        role: 0,
        shortDescription: "No Prefix",
        longDescription: "No Prefix",
        category: "reply",
    },
onStart: async function(){}, 
onChat: async function({
    event,
    message,
    getLang
}) {
    if (event.body && event.body.toLowerCase() == "redwan") return message.reply("ALMIGHTY LORD YHWACH IS BUSY PLEASE WAIT 👑");
}
}; 
