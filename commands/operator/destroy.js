module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.destroy = (message, content, lang) => {
        message.channel.send('k');
        OpalBot.client.destroy().then(() => {
            OpalBot.server.close();
        });
    };

    return out;
};