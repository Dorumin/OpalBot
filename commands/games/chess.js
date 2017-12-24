const Chess = require('../.classes/chess.js');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.ch = 'chess';
    out.peasants.chess = async (message, content, lang) => {
        let sessions = OpalBot.storage.chess = OpalBot.storage.chess || {},
        id = message.author.id,
        chan_id = message.channel.id,
        invite = sessions['invite-' + id],
        pending = sessions['pending-' + chan_id],
        invited = message.mentions.users.first(),
        name = message.author.username;
        if (invite) {
            // Do nothing. Really! This is to skip all the other "else if"s
        } else if (pending && pending[0] == id || invited && invited.id == id) {
            message.reply(i18n.msg('forever-alone', 'chess', lang));
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
                    message.channel.send(i18n.msg('timeout', 'chess', lang)).catch(OpalBot.util.log);
                }, 60000)
            ];
            if (invited) {
                message.channel.send(i18n.msg('invited', 'chess', invited.username, lang)).catch(OpalBot.util.log);
            } else {
                message.channel.send(i18n.msg('waiting', 'chess', lang)).catch(OpalBot.util.log);
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
        let chess = sessions[id] = sessions[host_id] = new Chess(),
        turn = Math.round(Math.random()), // 0 or 1
        players = [host_id, id],
        names = [host_name, name],
        white = names[(turn + 1) % 2],
        black = names[turn],
        skip = false,
        d = new Date(),
        pad = str => ('0' + str).slice(-2),
        year = d.getUTCFullYear(),
        month = d.getUTCMonth() + 1,
        date = d.getUTCDate();
        chess.header('Date', `${pad(year)}.${pad(month)}.${pad(date)}`, 'White', white, 'Black', black);
        while (!chess.game_over()) {
            turn = (turn + 1) % 2;
            let history = chess.history({ verbose: true }),
            last_move = history[history.length - 1],
            bot_message,
            message,
            index;
            try {
                if (!skip) {
                    bot_message = await message.channel.send({
                        embed: {
                            title: i18n.msg('title', 'chess', white, black, lang),
                            description: last_move ? i18n.msg(last_move.color, 'chess', lang) + ' ' + chess.ascii_key(last_move.piece) + ' ' + last_move.from + last_move.to : '',
                            image: {
                                url: chess.get_board_url()
                            },
                            color: OpalBot.color,
                            footer: {
                                text: i18n.msg(chess.in_check() ? 'turn-in-check' : 'turn', 'chess', names[turn], lang)
                            }
                        }
                    }).catch(OpalBot.util.log);
                } else {
                    skip = false;
                }
                if (players[turn] == OpalBot.client.user.id) {
                    message = {
                        content: chess.get_best_move(3),
                        channel: message.channel,
                        author: OpalBot.client.user
                    };
                } else {
                    let res = await OpalBot.unprefixed.expect({
                        type: 'chess',
                        channel: chan_id,
                        timeout: 1800000
                    });
                    message = res.message;
                    index = res.index;
                }
            } catch(e) {
                OpalBot.util.log(e);
                if (e == 'blocked') {
                    message.channel.send(i18n.msg('blocked', 'chess', lang)).catch(OpalBot.util.log);
                    delete sessions[id];
                    delete sessions[host_id]
                    return;
                } else { // Timeout
                    console.log(e);
                    chess.timeout = true;
                    break;
                }
            }
            if (i18n.msg('resign', 'chess', lang).split('|').includes(message.content.toLowerCase())) {
                message.channel.send(i18n.msg('resign-prompt', 'chess', lang) + ' [' + i18n.msg('yesno', 'chess', lang) + ']').catch(OpalBot.util.log);
                try {
                    let res = await OpalBot.unprefixed.expect({
                        type: 'chess',
                        triggers: i18n.msg('yesno', 'chess', lang).split('/'),
                        user: message.author.id,
                        channel: chan_id
                    });
                    message = res.message;
                    index = res.index;
                    if (index == 1) {
                        if (bot_message.deletable) {
                            bot_message.delete();
                        }
                        turn = (turn + 1) % 2;
                        continue;
                    }
                    chess.resigned = true;
                    if (players[players.indexOf(message.author.id)] == turn) {
                        turn = (turn + 1) % 2;
                    }
                    break;
                } catch(e) {
                    if (bot_message.deletable) {
                        bot_message.delete();
                    }
                    turn = (turn + 1) % 2;
                    continue;
                }
            }
            if (i18n.msg('takeback', 'chess', lang).split('|').includes(message.content.toLowerCase())) {
                let i = players.indexOf(message.author.id),
                other = players[(i + 1) % 2],
                other_name = names[(i + 1) % 2];
                message.channel.send(i18n.msg('takeback-prompt', 'chess', other_name, lang) + ' [' + i18n.msg('yesno', 'chess', lang) + ']').catch(OpalBot.util.log);
                try {
                    let res = await OpalBot.unprefixed.expect({
                        type: 'chess',
                        triggers: i18n.msg('yesno', 'chess', lang).split('/'),
                        user: other,
                        channel: chan_id,
                        timeout: 30000
                    });
                    message = res.message;
                    index = res.index;
                    if (index == 1) {
                        message.delete().catch(OpalBot.util.log);
                        bot_message.delete().catch(OpalBot.util.log);
                        message.channel.send(i18n.msg('takeback-rejected', 'chess', lang)).catch(OpalBot.util.log);
                        turn = (turn + 1) % 2;
                        continue;
                    }
                    chess.undo();
                    if (players[i] == players[turn]) {
                        chess.undo();
                        turn = (turn + 1) % 2;
                    }
                    continue;
                } catch(e) {
                    if (bot_message.deletable) {
                        bot_message.delete().catch(OpalBot.util.log);
                    }
                    turn = (turn + 1) % 2;
                    continue;
                }
            }            
            if (message.content.toLowerCase() == i18n.msg('moves', 'chess', lang)) {
                message.channel.send(i18n.msg('moves-response', 'chess', '`' + chess.moves().join('` `') + '`', lang)).catch(OpalBot.util.log);
                turn = (turn + 1) % 2;
                skip = true;
                continue;
            }
            if (message.author && message.author.id != players[turn]) {
                turn = (turn + 1) % 2;
                skip = true;
                continue;
            }
            let play = chess.move(message.content.replace(/\s+/g, ''), {sloppy: true});
            if (!play) {
                turn = (turn + 1) % 2; // Invalid move; repeat it
                skip = true;
                continue;
            }
            if (bot_message.deletable) {
                bot_message.delete();
            }
            if (message.deletable) {
                message.delete();
            }
        }
        let msg;
        if (chess.timeout) {
            msg = 'expired';
            turn = (turn + 1) % 2;
            chess.header('Result', white == names[turn] ? '1-0' : '0-1');
        } else if (chess.resigned) {
            msg = 'resigned';
            turn = (turn + 1) % 2;
            chess.header('Result', white == names[turn] ? '1-0' : '0-1');
        } else if (chess.in_checkmate()) {
            msg = 'winner';
            chess.header('Result', white == names[turn] ? '1-0' : '0-1');
        } else if (chess.in_stalemate()) {
            msg = 'stalemate';
            chess.header('Result', '½-½')
        } else if (chess.in_threefold_repetition()) {
            msg = 'threefold-repetition';
            chess.header('Result', '½-½')
        } else {
            msg = 'draw';
            chess.header('Result', '½-½')
        }
        message.channel.send({
            embed: {
                title: i18n.msg('title', 'chess', white, black, lang),
                image: {
                    url: chess.get_board_url()
                },
                color: OpalBot.color,
                footer: {
                    text: i18n.msg(msg, 'chess', names[turn], names[(turn + 1) % 2], lang)
                }
            }
        }).catch(OpalBot.util.log);
        message.channel.send('```' + chess.pgn({ max_width: 72 }).slice(0, -4) + '```').catch(OpalBot.util.log);
        delete sessions[id];
        delete sessions[host_id]
    };

    return out;
};