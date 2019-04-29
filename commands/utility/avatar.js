module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.a = 'avatar';
    out.peasants.avi = 'avatar';
    out.peasants.avatar = (message, content, lang) => {
        let user = message.mentions.users.first();
        if (!user) {
            let id = content.match(/\d{8,}/);
            if (id) {
                user = OpalBot.client.users.get(id);
            }
            if (!user) {
                user = message.author;
            }
        }
        message.channel.send({
            embed: {
                color: OpalBot.color,
                title: i18n.msg('title', 'avatar', lang),
                image: {
                    url: user.displayAvatarURL
                },
                description: i18n.msg(
                    user.id == OpalBot.client.user.id
                        ? 'own-description'
                        : 'description',
                    'avatar',
                    user.username,
                    lang
                ).replace(user.username.slice(0, -1) + "s's", user.username + "'")
            }
        }).catch(OpalBot.util.log);
    };

    return out;
};