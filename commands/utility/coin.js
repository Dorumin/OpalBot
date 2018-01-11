module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.coinflip = 'coin';
    out.peasants.flip = 'coin';
    out.peasants.coin = (message, content, lang) => {
        let r = Math.random(),
        result = Math.round(r) == 1;
        if (r > .99 || r < .01) {
            message.channel.send(i18n.msg('flipped', 'coin', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
            message.channel.send(i18n.msg('sideways', 'coin', lang)).catch(OpalBot.util.log);
        } else {
            message.channel.send(i18n.msg(result ? 'heads' : 'tails', 'coin', `<@${message.author.id}>`, lang)).catch(OpalBot.util.log);
        }
    };

    return out;
};