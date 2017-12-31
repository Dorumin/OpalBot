module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.game = 'setgame';
    out.operator.setpresence = 'setgame';
    out.operator.setgame = (message, content, lang) => {
        let match = content.match(/(?:https?:\/\/)?(?:[\w-]+\.)?twitch.tv\/(\w+)/),
        twitch = undefined,
        types = i18n.msg('types', 'setgame', lang).split('|'),
        type = 0;
        if (match) {
            content = content.slice(0, match.index) + content.slice(match.index + match[0].length);
            twitch = 'http://twitch.tv/' + match[1];
            type = 1;
        }
        for (let i in types) {
            if (content.toLowerCase().startsWith(types[i].toLowerCase())) {
                type = Number(i);
                content = content.slice(types[i].length).trim();
                break;
            }
        }
        OpalBot.client.user.setPresence({
            game: {
                name: content,
                url: twitch,
                type: type
            }
        });
    };

    return out;
};