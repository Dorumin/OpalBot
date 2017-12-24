module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.coinflip = 'coin';
    out.peasants.flip = 'coin';
    out.peasants.coin = (message, content, lang) => {
        let result = Math.round(Math.random()) == 1;
        message.channel.send(i18n.msg(result ? 'heads' : 'tails', 'flip', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
    };

    return out;
};