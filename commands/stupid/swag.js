module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    // out.peasants.me = 'swag';
    out.peasants.swagger = 'swag';
    out.peasants.swag = (message, content, lang) => {
        message.channel.send(':point_up_2: The user above me has some serious swag.').catch(OpalBot.util.log);
    };

    return out;
};
