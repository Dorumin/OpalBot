module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.operator = {};
    out.operator.game = 'setgame';
    out.operator.setgame = (message, content, lang) => {
        let match = content.match(/(?:https?:\/\/)?(?:[\w-]+\.)?twitch.tv\/(\w+)/),
        twitch = null;
        if (match) {
            content = content.slice(0, match.index) + content.slice(match.index + match[0].length);
            twitch = 'http://twitch.tv/' + match[1];
        }
        OpalBot.client.user.setGame(content, twitch);
    };

    return out;
};