module.exports = (OpalBot) => {
    OpalBot.ready = new Promise(res => {
        OpalBot.client.on('ready', res);
    });
};