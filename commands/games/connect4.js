const Connect4 = require('../.classes/connect4.js');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.c4 = 'connect4';
    out.peasants.connect4 = async (message, content, lang) => {
        let sessions = OpalBot.storage.connect4 = OpalBot.storage.connect4 || {},
        id = message.author.id,
        chan_id = message.channel.id,
        invite = sessions['invite-' + id],
        pending = sessions['pending-' + chan_id],
        invited = message.mentions.users.first(),
        name = message.author.username;
        if (invite) {
            // Do nothing. Really! This is to skip all the other "else if"s
        } else if (pending && pending[0] == id || invited && invited.id == id) {
            message.reply(i18n.msg('forever-alone', 'connect4', lang));
            return;
        } else if (invited && invited.id == OpalBot.client.user.id) {
            invite = [
                id,
                name,
                -1
            ];
            id = OpalBot.client.user.id;
            name = OpalBot.client.user.username;
        } else if (sessions[id]) {
            return; // You're already in a game. I won't try and give this a custom response since you can't possibly forget you're in a game in 60 seconds
        } else if (!pending) {
            let key = invited ? 'invite-' + invited.id : 'pending-' + chan_id;
            sessions[key] = [
                id,
                name,
                setTimeout(() => {
                    delete sessions[key];
                    message.channel.send(i18n.msg('timeout', 'connect4', lang)).catch(OpalBot.util.log);
                }, 60000)
            ];
            if (invited) {
                message.channel.send(i18n.msg('invited', 'connect4', invited.username, lang)).catch(OpalBot.util.log);
            } else {
                message.channel.send(i18n.msg('waiting', 'connect4', lang)).catch(OpalBot.util.log);
            }
            return;
        }
        let host = invite || pending,
        host_id = host[0],
        host_name = host[1];
        if (invite) {
            delete sessions['invite-' + id];
        } else {
            delete sessions['pending-' + chan_id];
        }
        clearTimeout(host[2]);
        let c4 = sessions[id] = sessions[host_id] = new Connect4(host_id, id, host_name, name),
        turn = Math.round(Math.random()), // 0 or 1
        players = c4.players,
        names = c4.player_names,
        blue = names[(turn + 1) % 2],
        red = names[turn];
        /*if (turn == 0) {
            players.push(players.shift());
            names.push(names.shift());
        }*/
        while (!c4.is_draw()) {
            turn = (turn + 1) % 2;
            let bot_message,
            message,
            index;
            try {
                bot_message = await message.channel.send({
                    embed: {
                        title: i18n.msg('title', 'connect4', blue, red, lang),
                        description: c4.render(),
                        color: OpalBot.color,
                        footer: {
                            text: i18n.msg('turn', 'connect4', names[turn], turn, lang)
                        }
                    }
                }).catch(OpalBot.util.log);
                if (players[turn] == OpalBot.client.user.id) {
                    let best = await c4.get_best_move(),
                    message = {
                        channel: message.channel,
                        content: best,
                        delete: () => {}
                    },
                    index = c4.moves().indexOf(String(best));
                } else {
                    let res = await OpalBot.unprefixed.expect({
                        type: 'connect4',
                        triggers: c4.moves(),
                        user: players[turn],
                        channel: message.channel.id,
                        timeout: 180000
                    });
                    message = res.message;
                    index = res.index;
                }
            } catch(e) {
                if (e == 'blocked') {
                    message.channel.send(i18n.msg('blocked', 'connect4', lang)).catch(OpalBot.util.log);
                    delete sessions[id];
                    delete sessions[host_id]
                    return;
                } else { // Timeout
                    console.log(e);
                    c4.winner = c4.player_to_move == 'blue' ? 'redt' : 'bluet';
                    break;
                }
            }
            if (bot_message.deletable) {
                bot_message.delete().catch(OpalBot.util.log);
            }
            if (message.deletable) {
                message.delete().catch(OpalBot.util.log);
            }
            let move = ['1', '2', '3', '4', '5', '6', '7'].indexOf(c4.moves()[index]),
            consequence = c4.move(move + 1);
            if (['blue', 'red'].includes(consequence) || consequence === true) break; // Somebody won, OR it's a draw
        }
        if (!c4.winner) {
            message.channel.send({
                embed: {
                    title: i18n.msg('title', 'connect4', blue, red, lang),
                    description: c4.render(),
                    color: OpalBot.color,
                    footer: {
                        text: i18n.msg('draw', 'connect4', lang)
                    }
                }
            }).catch(OpalBot.util.log);
        } else {
            if (c4.winner.slice(-1) == 't') {
                turn = turn == 1 ? 0 : 1;
            }
            message.channel.send({
                embed: {
                    title: i18n.msg('title', 'connect4', blue, red, lang),
                    description: 
                        (c4.winner.slice(-1) == 't' ? i18n.msg('expired', 'connect4', lang) + '\n\n' : '') + c4.render(),
                    color: OpalBot.color,
                    footer: {
                        text: i18n.msg('winner', 'connect4', names[turn], lang)
                    }
                }
            }).catch(OpalBot.util.log);
        }
        delete sessions[id];
        delete sessions[host_id];
    };

    return out;
};