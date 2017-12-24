const TicTacToe = require('../.classes/tictactoe.js');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.ttt = 'tictactoe';
    out.peasants.tictactoe = async (message, content, lang) => {
        OpalBot.storage.tictactoe = OpalBot.storage.tictactoe || {};
        let id = message.author.id,
        chan_id = message.channel.id,
        sessions = OpalBot.storage.tictactoe,
        pending = sessions['pending-' + chan_id],
        invited = message.mentions.users.first();
        if (pending && pending[0] == id || invited && invited.id == id) {
            message.reply(i18n.msg('forever-alone', 'tictactoe', lang));
            return;
        } else if (invited && invited.id == OpalBot.client.user.id) {
            message.channel.send(i18n.msg('no-ai', 'tictactoe', lang)).catch(OpalBot.util.log);
            return;
        } else if (pending && pending[3] && pending[3] != id) {
            return; // You're not invited. You're uninvited.
        } else if (sessions[id]) {
            return; // I don't think a specific error message should really be used here. The game is too dynamic for you to forget you're in a game
        } else if (!pending) {
            sessions['pending-' + chan_id] = [id, message.author.username, setTimeout(() => { // Creating a new session
                delete sessions['pending-' + chan_id];
                message.channel.send(i18n.msg('timeout', 'tictactoe', lang)).catch(OpalBot.util.log);
            }, 60000)];
            if (invited) {
                sessions['pending-' + chan_id].push(message.mentions.users.first().id);
                message.channel.send(i18n.msg('invited', 'tictactoe', message.mentions.users.first().username, lang)).catch(OpalBot.util.log);
                return;
            }
            message.channel.send(i18n.msg('waiting', 'tictactoe', lang)).catch(OpalBot.util.log);
            return;
        }
        let host = pending,
        host_id = host[0];
        clearTimeout(host[2]);
        delete sessions['pending-' + chan_id];
        let session = sessions[id] = sessions[host_id] = new TicTacToe(host[0], id, host[1], message.author.username),
        turn = Math.round(Math.random()), // get a random number from 0 to 1
        players = session.players,
        names = session.player_names;
        while (!session.is_draw()) {
            turn = (turn + 1) % 2;
            let bot_message,
            index;
            try {
                bot_message = await message.channel.send({
                    embed: {
                        title: i18n.msg('title', 'tictactoe', names[0], names[1], lang),
                        description: session.render(),
                        color: OpalBot.color,
                        footer: {
                            text: i18n.msg('turn', 'tictactoe', names[turn], lang)
                        }
                    }
                }).catch(OpalBot.util.log);
                let res = await OpalBot.unprefixed.expect({
                    type: 'tictactoe',
                    triggers: session.moves(),
                    user: players[turn],
                    channel: message.channel.id
                });
                index = res.index;
                message = res.message;
            } catch(e) {
                if (e == 'blocked') {
                    message.channel.send(i18n.msg('blocked', 'tictactoe', lang)).catch(OpalBot.util.log);
                    delete sessions[id];
                    delete sessions[host_id]
                    return;
                } else { // Timeout
                    session.winner = session.player_to_move == 'x' ? 'ot' : 'xt';
                    break;
                }
            }
            if (bot_message.deletable) {
                bot_message.delete();
            }
            if (message.deletable) {
                message.delete();
            }
            let move = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(session.moves()[index]),
            consequence = session.move(session.player_to_move, move + 1);
            if (['x', 'o'].includes(consequence) || consequence === true) break; // Somebody won, somehow. Isn't TicTacToe like super easy to draw?
        }
        if (!session.winner) {
            message.channel.send({
                embed: {
                    title: i18n.msg('title', 'tictactoe', names[0], names[1], lang),
                    description: session.render(),
                    color: OpalBot.color,
                    footer: {
                        text: i18n.msg('draw', 'tictactoe', lang)
                    }
                }
            }).catch(OpalBot.util.log);
        } else {
            if (session.winner.charAt(1) == 't') {
                turn = turn == 1 ? 0 : 1;
            }
            message.channel.send({
                embed: {
                    title: i18n.msg('title', 'tictactoe', names[0], names[1], lang),
                    description: 
                        (session.winner.charAt(1) == 't' ? i18n.msg('expired', 'tictactoe', lang) + '\n\n' : '') + session.render(),
                    color: OpalBot.color,
                    footer: {
                        text: i18n.msg('winner', 'tictactoe', names[turn], lang)
                    }
                }
            }).catch(OpalBot.util.log);
        }
        delete sessions[id];
        delete sessions[host_id];
    };

    return out;
};