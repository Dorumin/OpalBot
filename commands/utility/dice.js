module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.d = 'dice';
    out.peasants.dice = (message, content, lang) => {
        let [
            sides = 6,
            dice = 1
        ] = (content.match(/\d+/g) || []).map(Number);
        if (sides > Number.MAX_SAFE_INTEGER) {
            message.reply(i18n.msg('too-big', 'dice', lang)).catch(OpalBot.util.log);
        }
        if (sides == 0 || dice == 0) {
            message.reply(i18n.msg('non-zero', 'dice', lang)).catch(OpalBot.util.log);
        } else if (dice == 1) {
            let result = Math.ceil(Math.random() * sides);
            message.channel.send(i18n.msg('result', 'dice', `<@${message.author.id}>`, result, lang)).catch(OpalBot.util.log);
        } else {
            if (dice > 1000) {
                message.reply(i18n.msg('too-long', 'dice', lang)).catch(OpalBot.util.log); // Skip the whole loop ordeal
                return;
            }
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