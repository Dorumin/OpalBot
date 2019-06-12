const got = require('got');
module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.nekos = 'neko';
    out.peasants.catgirl = 'neko';
    out.peasants.catgirls = 'neko';
    out.peasants.neko = async (message, content, lang) => {
        try {
            const { body } = await got('https://nekos.life/api/v2/img/neko', { json: true });
            message.channel.send(body.url)
        } catch(e) {
            message.channel.send(e.response && e.response.body || e);
        }
    };

    return out;
};
