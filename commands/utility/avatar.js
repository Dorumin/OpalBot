const { Attachment } = require('discord.js');

const getExtension = (avatar) => {
    return avatar.startsWith('a_') ? 'gif' : 'png';
};

const getAvatar = (user) => {
    const avatar = user.avatar,
    ext = getExtension(avatar);

    return new Attachment(`https://cdn.discordapp.com/avatars/${user.id}/${avatar}.${ext}?size=2048`, `avatar.${ext}`);
};

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
                user = OpalBot.client.users.get(id[0]);
            }
            if (!user) {
                user = message.author;
            }
        }

        const msg = i18n.msg(
            user.id == OpalBot.client.user.id
                ? 'own-description'
                : 'description',
            'avatar',
            user.username,
            lang
        ).replace(user.username.slice(0, -1) + "s's", user.username + "'");

        message.channel.send(msg, {
            file: getAvatar(user)
        }).catch(OpalBot.util.log);
    };

    return out;
};
