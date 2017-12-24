const Chess = require('../.classes/akinator.js');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.aki = 'akinator';
    out.peasants.akinator = async function(message, content, lang) {
        this.sessions = this.sessions || [];
        let id = message.author.id,
        mode = 'start',
        close = i18n.msg('quit', 'akinator', lang).split('|');
        if (close.includes(content)) mode = 'close';
        if (mode == 'close') {
            if (this.sessions[id]) {
                delete this.sessions[id];
                OpalBot.unprefixed.remove({
                    type: 'akinator',
                    user: message.author.id,
                    channel: message.channel.id
                });
                message.channel.send(i18n.msg('session-closed', 'akinator', lang));
            } else {
                message.channel.send(i18n.msg('no-session-open', 'akinator', lang));
            }
            return;
        }
        if (this.sessions[id]) {
            message.channel.send(i18n.msg('session-open', 'akinator', lang));
            return;
        }
        let ask = async (obj) => {
            return new Promise((res, rej) => {
                let blocked = OpalBot.unprefixed.push({
                    type: 'akinator',
                    caseinsensitive: true,
                    callback: (message, index) => res({message: message, index: index}),
                    timeout: 300000,
                    ontimeout: () => {
                        rej('timeout');
                    },
                    ...obj
                });
                if (blocked === true) {
                    rej('blocked');
                }
            });
        },
        akinator = this.sessions[id] = new Akinator(),
        q = (await akinator.init(lang, id)).step_information,
        step = 0,
        responses = i18n.msg('responses', 'akinator', lang).split('/').concat([1,2,3,4,5]),
        defeated = false;
        while (step++ < 75) {
            // This long bodge is to prevent conflicting akinator sessions
            let blocked = OpalBot.unprefixed.push({
                triggers: responses,
                user: id,
                channel: message.channel.id
            });
            if (blocked === true) {
                message.channel.send(i18n.msg('blocked', 'akinator', lang));
                return;
            }
            OpalBot.unprefixed.remove({
                user: id,
                channel: message.channel.id
            });
            // End bodge
            if (step != 1) {
                responses = responses.filter(str => str != i18n.msg('back', 'akinator', lang) && isNaN(str)).concat([i18n.msg('back', 'akinator'), 1, 2, 3, 4, 5, 6]);
            } else {
                responses = responses.filter(trigger => ![i18n.msg('back', 'akinator', lang), 6].includes(trigger));
            }
            message.channel.send(i18n.msg('question', 'akinator', Number(q.step) + 1, q.question, lang) + '\n[' + responses.filter(str => isNaN(str)).join('/') + ']');
            let res;
            try {
                res = await ask({
                    triggers: responses,
                    user: id,
                    channel: message.channel.id
                });
            } catch(e) {
                if (e == 'blocked') {
                    message.channel.send(i18n.msg('blocked', 'akinator', lang));
                } else if (e == 'timeout') {
                    message.channel.send(i18n.msg('timed-out', 'akinator', `<@${id}>`, lang));
                    delete this.sessions[id];
                }
                return;
            }
            let index = res.index,
            answer = isNaN(responses[index]) ? index : responses[index] - 1;
            res = await akinator.ans(q.step, answer);
            if (answer == 5) {
                step -= 2;
            }
            q = res;
            if (res.progression > 97 || step % 25 == 0) {
                let guess,
                yesno;
                try {
                    guess = (await akinator.guess(q.step)).elements[0].element;
                    yesno = i18n.msg('yesno', 'akinator', lang);
                } catch(e) {
                    message.channel.send(i18n.msg('unknown-error', 'akinator', lang));
                    return;
                }
                message.channel.send({embed: {
                    title: i18n.msg('title', 'akinator', guess.name, parseInt(guess.proba * 100, 10), lang),
                    description: guess.description,
                    color: OpalBot.color,
                    footer: {
                        text: '[' + yesno + ']'
                    },
                    image: {
                        url: guess.absolute_picture_path
                    }
                }});
                let correct = await ask({
                    triggers: yesno.split('/'),
                    user: id,
                    channel: message.channel.id
                });
                if (correct.index == 1) {
                    try {
                        await akinator.exclude(q.step);
                    } catch(e) {
                        message.channel.send(i18n.msg('unknown-error', 'akinator', lang));
                    }
                    if (step == 75) {
                        defeated = true;
                        break;
                    }
                    message.channel.send(i18n.msg('continue', 'akinator', lang) + ' [' + yesno + ']');
                    let keep_going = await ask({
                        triggers: yesno.split('/'),
                        user: id,
                        channel: message.channel.id
                    });
                    if (keep_going.index == 0) {
                        continue;
                    } else {
                        defeated = true;
                    }
                }
                break;
            }
        }
        message.channel.send(i18n.msg(defeated ? 'defeated' : 'victory', 'akinator', lang));
        delete this.sessions[id];
    };

    return out;
};