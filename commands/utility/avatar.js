module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.a = 'avatar';
    out.peasants.avi = 'avatar';
    out.peasants.avatar = (message, content, lang) => {
        let user = message.mentions.users.first() || message.author;
        message.channel.send({
            embed: {
                color: OpalBot.color,
                title: i18n.msg('title', 'avatar', lang),
                image: {
                    url: user.displayAvatarURL
                },
                description: i18n.msg('description', 'avatar', user.username, lang).replace(user.username.slice(0, -1) + "s's", user.username + "'")
            }
        }).catch(OpalBot.util.log);
    };

    return out;
};