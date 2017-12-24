module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.d = 'dice';
    out.peasants.dice = (message, content, lang) => {
        if (!content || isNaN(content.charAt(0))) {
            content = '6';
        }
        let params = content.match(/\d+/g);
        if (params.length == 1) {
            params.unshift(1);
        }
        let [
            dice,
            sides
        ] = params;
        if (sides == 0 || dice == 0) {
            message.reply(i18n.msg('non-zero', 'dice', lang)).catch(OpalBot.util.log);
        } else if (dice == 1) {
            let result = Math.ceil(Math.random() * sides);
            message.channel.send(i18n.msg('result', 'dice', `<@${message.author.id}>`, result, lang)).catch(OpalBot.util.log);
        } else {
            let results = [],
            sum = 0;
            while (dice--) {
                let r = Math.ceil(Math.random() * sides);
                results.push(r);
                sum += r;
            }
            let msg = i18n.msg('results', 'dice', lang) + '```js\n' + results.join(', ') + '```' + i18n.msg('sum', 'dice', sum, lang);
            message.reply(msg).catch(() => {
                message.reply(i18n.msg('too-long', 'dice', lang)).catch(OpalBot.util.log);
            });
        }
    };

    return out;
};