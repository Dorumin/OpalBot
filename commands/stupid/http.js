const got = require('got');

module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.http = async (message, content, lang) => {
        if (!parseInt(content)) {
            return message.react('⚠');
        }
        
        const status = await got(`https://http.cat/${content}.jpg`, {
            method: 'HEAD',
            throwHttpErrors: false
        });
        if (status.statusCode === 404) {
            return message.react('⚠');
        }

        message.channel.send(`https://http.cat/${content}.jpg`);
    };

    return out;
};
