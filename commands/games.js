class TicTacToe {
    constructor(p1, p2, n1, n2) {
        this.matrix = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.player_to_move = 'x';
        this.players = [p1, p2];
        this.player_names = [n1, n2];
        this.winner = null;
    }

    moves() {
        return [].concat.apply([], this.matrix).map((n, i) => {
            return n !== null ? null : String(i + 1)
        }).filter((n) => n !== null);
    }
    
    emotify(char) {
        switch(char) {
            case 1:
                return ':one:';
            case 2:
                return ':two:';
            case 3:
                return ':three:';
            case 4:
                return ':four:';
            case 5:
                return ':five:';
            case 6:
                return ':six:';
            case 7:
                return ':seven:';
            case 8:
                return ':eight:';
            case 9:
                return ':nine:';
            case 'x':
                return ':x:';
            case 'o':
                return ':o:';
            case 'x2':
                return ':negative_squared_cross_mark:';
            case 'o2':
                return ':o2:';
            default:
                return ':japanese_goblin:';
        }
    }
    
    move(xo, pos) {
        if (xo != 'x' && xo != 'o') {
            throw new Error('First parameter of TicTacToe.move must be either x or o');
        }
        if (this.player_to_move != xo) {
            return false;
        }
        if (!(pos >= 1 || pos <= 9)) {
            throw new Error('Second parameter of TicTacToe.move must be an int between 1 and 9');
        }
        var row_index = Math.floor((pos - 1) / 3),
        rel = (pos - 1) % 3,
        row = this.matrix[row_index],
        item = row[rel];
        if (item != null) 
            return false;
        row[rel] = xo;
        this.player_to_move = xo == 'x' ? 'o' : 'x';
        var v = this.verify();
        if (v == 'x' || v == 'o') {
            this.winner = v;
        }
        return v;
    }
    
    verify() { // Returns "x" or "o" if either have won, true if the game is a draw and false if the game must go on
        var m = this.matrix.map(function(row) {
            return row.map(function(item) {
                return item == 'x' ? 1 : (item == 'o' ? -1 : 0);
            });
        }),
        i = 3, j = 3, l = 3, y = 3;
        
        // Check rows
        while (i--) {
            var row_sum = 0;
            while (j--) {
                row_sum += m[i][j];
            }
            j = 3;
            if (row_sum == 3) {
                while (j--) {
                    this.matrix[i][j] += '2';
                }
                return 'x';
            } else if (row_sum == -3) {
                while (j--) {
                    this.matrix[i][j] += '2';
                }
                return 'o';
            }
        }
        
        // Check cols
        while (l--) {
            var col_sum = 0;
            while (y--) {
                col_sum += m[y][l];
            }
            y = 3;
            if (col_sum == 3) {
                while (y--) {
                    this.matrix[y][l] += '2';
                }
                return 'x';
            } else if (col_sum == -3) {
                while (y--) {
                    this.matrix[y][l] += '2';
                }
                return 'o';
            }
        }
        
        // Check diagonals
        var l_diag = m[0][0] + m[1][1] + m[2][2],
        r_diag = m[2][0] + m[1][1] + m[0][2]
        if (l_diag == 3) {
            m[0][0] = m[1][1] = m[2][2] = 'x2';
            return 'x';
        } else if (r_diag == 3) {
            m[2][0] = m[1][1] = m[0][2] = 'x2';
            return 'x';
        } else if (l_diag == -3) {
            m[0][0] = m[1][1] = m[2][2] = 'o2';
            return 'o';
        } else if (r_diag == -3) {
            m[2][0] = m[1][1] = m[0][2] = 'o2';
            return 'o';
        }
        
        return this.is_draw();
    }
    
    is_draw() {
        var i = 3, j = 3, m = this.matrix;
        while (i--) {
            while (j--) {
                if (m[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    render() {
        var matrix = this.matrix.map((cols, row) => {
            return cols.map((el, col) => {
                return this.emotify(el == null ? col + (row * 3) + 1 : el);
            }).join('┃');
        }).join('\n──────────\n');
        return matrix;
    }
}

module.exports.peasants = {};

module.exports.peasants.tictactoe = 'ttt';
module.exports.peasants.ttt = async function(message, content, lang, i18n, OpalBot) {
    this.sessions = this.sessions || {};
    var id = message.author.id,
    chan_id = message.channel.id,
    pending = this.sessions['pending-' + chan_id];
    if (pending && pending[0] == id) {
        message.reply(i18n.msg('forever-alone', 'tictactoe', lang));
        return;
    } else if (this.sessions[id]) {
        return; // I don't think a specific error message should really be used here. The game is too dynamic for you to forget you're in a game
    } else if (!pending) {
        this.sessions['pending-' + chan_id] = [id, message.author.username, setTimeout(() => { // Creating a new session
            delete this.sessions['pending-' + chan_id];
            message.channel.send(i18n.msg('timeout', 'tictactoe', lang));
        }, 60000)];
        message.channel.send(i18n.msg('waiting', 'tictactoe', lang));
        return;
    }
    var host = pending,
    host_id = host[0];
    clearTimeout(host[2]);
    delete this.sessions['pending-' + chan_id];
    var session = this.sessions[id] = this.sessions[host_id] = new TicTacToe(host[0], id, host[1], message.author.username),
    turn = Math.round(Math.random()), // get a random number from 0 to 1
    players = session.players,
    names = session.player_names,
    ask = (obj) => {
        return new Promise((res, rej) => {
            var blocked = OpalBot.unprefixed.push({
                type: 'tictactoe',
                caseinsensitive: true,
                callback: (message, index) => res({message: message, index: index}),
                timeout: 60000,
                ontimeout: () => {
                    rej('timeout');
                },
                ...obj
            });
            if (blocked === true) {
                rej('blocked');
            }
        });
    };
    while (!session.is_draw()) {
        turn = turn == 1 ? 0 : 1;
        try {
            var bot_message = await message.channel.send({
                embed: {
                    title: i18n.msg('title', 'tictactoe', names[0], names[1], lang),
                    description: session.render(),
                    color: OpalBot.color,
                    footer: {
                        text: i18n.msg('turn', 'tictactoe', names[turn], lang)
                    }
                }
            }),
            {message, index} = await OpalBot.unprefixed.expect({
                type: 'tictactoe',
                triggers: session.moves(),
                user: players[turn],
                channel: message.channel.id
            });
        } catch(e) {
            if (e == 'blocked') {
                message.channel.send(i18n.msg('blocked', 'tictactoe', lang));
                return;
            } else { // Timeout
                console.log(e);
                session.winner = session.player_to_move == 'x' ? 'ot' : 'xt';
                break;
            }
        }
        if (bot_message.deletable) {
            //bot_message.delete();
        }
        var move = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(session.moves()[index]),
        consequence = session.move(session.player_to_move, move + 1);
        if (['x', 'o'].includes(consequence)) break; // Somebody won, somehow. Isn't TicTacToe like super easy to draw?
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
        });
    } else {
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
        });
    }
    delete this.sessions[id];
    delete this.sessions[host_id];
};

module.exports.peasants.c4 = 'connect4';
module.exports.peasants.connect4 = function(message, content, lang, i18n, OpalBot) {
    this.sessions = this.sessions || {};
    var id = message.author.id,
    cols = new Array(7).fill(undefined).map(() => {
        return new Array(6).fill(null);
    });
};