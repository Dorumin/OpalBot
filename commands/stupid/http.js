module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.http = (message, content, lang) => {
        if (isNaN(content)) {
            return message.react('⚠');
        }
        message.channel.send(`https://http.cats/${content}.jpg`);
    };

    return out;
};
