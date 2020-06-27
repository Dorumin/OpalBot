module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.http = (message, content, lang) => {
        if (!parseInt(content)) {
            return message.react('⚠');
        }
        message.channel.send(`https://http.cat/${content}.jpg`);
    };

    return out;
};
