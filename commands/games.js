// You know that saying, "don't reinvent the wheel"?
const BasicChess = require('../plugins/chess.js').Chess,
request = require('request'),
req = (obj, POST) => {
    return new Promise((res, rej) => {
        (POST ? request.post : request)(obj, (e, r, body) => {
            if (e || r.statusCode == '404') {
                rej(e);
                return;
            }
            res({res: r, body: body});
        });
    });
};
req.post = (obj) => req(obj, true);

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
                col_sum += m[l][y];
            }
            y = 3;
            if (col_sum == 3) {
                while (y--) {
                    this.matrix[l][y] += '2';
                }
                return 'x';
            } else if (col_sum == -3) {
                while (y--) {
                    this.matrix[l][y] += '2';
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
            j = 3;
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

class Connect4 {
    constructor(p1, p2, n1, n2) {
        this.columns = new Array(7).fill(undefined).map(() => []);
        this.players = [p1, p2];
        this.player_names = [n1, n2];
        this.player_to_move = 'blue';
        this.winner = null;
        this.history = '';
    }

    end_turn() {
        this.player_to_move = this.player_to_move == 'blue' ? 'red' : 'blue';
    }

    moves() {
        return this.moves_with_x().filter(move => move != 'x');
    }

    moves_with_x() {
        return new Array(7).fill(undefined).map((n, i) => {
            if (this.columns[i].length == 6) {
                return 'x';
            } else {
                return String(i + 1);
            }
        });
    }

    emotify(char) {
        switch (char) {
            case 1:
            case '1':
                return ':one:';
            case 2:
            case '2':
                return ':two:';
            case 3:
            case '3':
                return ':three:';
            case 4:
            case '4':
                return ':four:';
            case 5:
            case '5':
                return ':five:';
            case 6:
            case '6':
                return ':six:';
            case 7:
            case '7':
                return ':seven:';
            case 'x': 
                return ':regional_indicator_x:';
            case 'blue': 
                return ':large_blue_circle:';
            case 'blue2':
                return ':large_blue_diamond:';
            case 'red':
                return ':red_circle:';
            case 'red2':
                return ':hearts:';
            default:
                return ':black_circle:';
        }
    }

    move(col) {
        if (typeof col != 'number') {
            throw new Error('col parameter must be an int');
        }
        if (col < 1 || col > 7) {
            throw new Error('col parameter must be a number between 1 and 7');
        }
        if (this.columns[col - 1].length == 6) { // Column is full
            return null;
        }
        this.columns[col - 1].push(this.player_to_move);
        this.end_turn();
        var v = this.verify();
        if (v == 'red' || v == 'blue') {
            this.winner = v;
        }
        this.history += col;
        return v;
    }

    verify() {
        var x = 7, m = this.columns;

        while (x--) { // Iterate over all columns

            var col = m[x],
            y = col.length;

            while (y--) { // Iterate over all discs inside a column

                var disc = col[y],
                count = 0,
                pointers = [];

                // Check for vertical lines of 4
                for (var i = 0; i < 4; i++) {
                    if (y < 3) break;
                    if (col[y - i] == disc) {
                        count++;
                        pointers.push([x, y - i]);
                        if (count == 4) {
                            pointers.forEach(arr => {
                                this.columns[arr[0]][arr[1]] += '2';
                            });
                            return disc;
                        }
                    } else {
                        count = 0;
                        pointers = [];
                        break;
                    }
                }

                // Check for horizontal ones
                for (var i = 0; i < 4; i++) {
                    if (x < 3) break;
                    if (m[x - i][y] == disc) {
                        count++;
                        pointers.push([x - i, y]);
                        if (count == 4) {
                            pointers.forEach(arr => {
                                this.columns[arr[0]][arr[1]] += '2';
                            });
                            return disc;
                        }
                    } else {
                        count = 0;
                        pointers = [];
                        break;
                    }
                }

                // Check for diagonal ones
                for (var i = 0; i < 4; i++) {
                    if (x < 3) break;
                    if (m[x - i][y - i] == disc) {
                        count++;
                        pointers.push([x - i, y - i]);
                        if (count == 4) {
                            pointers.forEach(arr => {
                                this.columns[arr[0]][arr[1]] += '2';
                            });
                            return disc;
                        }
                    } else {
                        count = 0;
                        pointers = [];
                        break;
                    }
                }

                
                for (var i = 0; i < 4; i++) {
                    if (x < 3) break;
                    if (m[x - i][y + i] == disc) {
                        count++;
                        pointers.push([x - i, y + i]);
                        if (count == 4) {
                            pointers.forEach(arr => {
                                this.columns[arr[0]][arr[1]] += '2';
                            });
                            return disc;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        
        return this.is_draw();
    }

    is_draw() {
        var i = this.columns.length;
        while (i--) {
            if (this.columns[i].length != 6) {
                return false;
            }
        }

        return true;
    }

    get_best_move() {
        return new Promise(async (res, rej) => {
            try {
                var {body} = await req('http://connect4.gamesolver.org/solve?pos=' + this.history),
                scores = JSON.parse(body).score,
                best = scores.filter(n => n != 100).sort((a, b) => b - a)[0];
                res(scores.indexOf(best) + 1);
            } catch(e) {
                rej(e);
            }
        });
    }

    render() {
        var str = '',
        i = 6;
        while (i--) {
            for (var j = 0; j < 7; j++) {
                str += this.emotify(this.columns[j][i]);
            }
            str += '\n';
        }
        str += this.moves_with_x().map(this.emotify).join('');
        return str;
    }
}

/*class Battleship {

    constructor(p1, p2, n1, n2) {
        this.matrix = new Array(10).fill(undefined).map(() => new Array(10).fill(null));
        this.players = [p1, p2];
        this.player_names = [n1, n2];
        this.player_to_move = 'blue';
        this.winner = null;

        var matrix = new Array(10).fill(undefined).map(() => new Array(10).fill(null)),
        new_matrix = () => matrix.slice().map(arr => arr.slice());

        this.history = [new_matrix(), new_matrix()];
        this.boards  = [new_matrix(), new_matrix()];
        this.placed = [[], []];

        this.sizes = {
            1: 2,
            2: 3,
            3: 3,
            4: 4,
            5: 5
        };
    }

    place(type, coordinates, dir) {
        if (type < 1 || type > 5) {
            throw new TypeError('type must be an int between 1 and 5');
        }
        if (typeof coordinates != 'string') {
            throw new TypeError('coordinates must be a string');
        }
        if (typeof dir != 'boolean') {
            throw new TypeError('dir must be a boolean');
        }
        
    }
}*/

class Chess extends BasicChess {

    constructor() {
        super(); // Super!

        this.get_board_url = () => {
            var board = [].concat(...this.board()), // get a 64-length array with all the positions
            p = '';
            board.forEach(obj => {
                if (!obj) {
                    p += '-';
                } else if (obj.color == 'w') {
                    p += obj.type.toUpperCase();
                } else {
                    p += obj.type;
                }
            });
            var url = `http://www.jinchess.com/chessboard/?p=${p}&ps=merida&cm=o`;
            if (!this.game_over()) {
                url += '&tm=' + this.turn();
            }
            return url;
        }

        this.ascii_key = (char) => {
            switch(char) {
                case 'p': return '♟';
                case 'r': return '♜';
                case 'n': return '♞';
                case 'b': return '♝';
                case 'q': return '♛';
                case 'k': return '♚';
            }
        };

        var minimaxRoot = (depth, game, isMaximisingPlayer) => {
            var newGameMoves = game.moves();
            var bestMove = -9999;
            var bestMoveFound;
        
            for (var i = 0; i < newGameMoves.length; i++) {
                var newGameMove = newGameMoves[i]
                game.move(newGameMove);
                var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
                game.undo();
                if (value >= bestMove) {
                    bestMove = value;
                    bestMoveFound = newGameMove;
                }
            }
            return bestMoveFound;
        };
        
        var minimax = (depth, game, alpha, beta, isMaximisingPlayer) => {
            positionCount++;
            if (depth === 0) {
                return -evaluateBoard(game.board());
            }
        
            var newGameMoves = game.moves();
        
            if (isMaximisingPlayer) {
                var bestMove = -9999;
                for (var i = 0; i < newGameMoves.length; i++) {
                    game.move(newGameMoves[i]);
                    bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
                    game.undo();
                    alpha = Math.max(alpha, bestMove);
                    if (beta <= alpha) {
                        return bestMove;
                    }
                }
                return bestMove;
            } else {
                var bestMove = 9999;
                for (var i = 0; i < newGameMoves.length; i++) {
                    game.move(newGameMoves[i]);
                    bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
                    game.undo();
                    beta = Math.min(beta, bestMove);
                    if (beta <= alpha) {
                        return bestMove;
                    }
                }
                return bestMove;
            }
        };
        
        var evaluateBoard = (board) => {
            var totalEvaluation = 0;
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
                }
            }
            return totalEvaluation;
        };
        
        var reverseArray = (array) => {
            return array.slice().reverse();
        };
        
        var pawnEvalWhite = [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
            [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
            [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
            [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
            [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
            [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        ];
        
        var pawnEvalBlack = reverseArray(pawnEvalWhite);
        
        var knightEval = [
            [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
            [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
            [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
            [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
            [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
            [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
            [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
            [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
        ];
        
        var bishopEvalWhite = [
            [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
            [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
            [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
            [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
            [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
            [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
            [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
            [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
        ];
        
        var bishopEvalBlack = reverseArray(bishopEvalWhite);
        
        var rookEvalWhite = [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
            [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
            [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
            [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
            [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
            [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
            [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
        ];
        
        var rookEvalBlack = reverseArray(rookEvalWhite);
        
        var evalQueen = [
            [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
            [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
            [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
            [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
            [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
            [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
            [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
            [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
        ];
        
        var kingEvalWhite = [
        
            [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
            [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
            [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
            [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
            [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
        ];
        
        var kingEvalBlack = reverseArray(kingEvalWhite);
        
        var getPieceValue = (piece, x, y) => {
            if (piece === null) {
                return 0;
            }
            var getAbsoluteValue = (piece, isWhite, x, y) => {
                if (piece.type === 'p') {
                    return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
                } else if (piece.type === 'r') {
                    return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
                } else if (piece.type === 'n') {
                    return 30 + knightEval[y][x];
                } else if (piece.type === 'b') {
                    return 30 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
                } else if (piece.type === 'q') {
                    return 90 + evalQueen[y][x];
                } else if (piece.type === 'k') {
                    return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
                }
                throw "Unknown piece type: " + piece.type;
            };
        
            var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y);
            return piece.color === (this.player_to_move == 'w' ? 'b' : 'w') ? absoluteValue : -absoluteValue;
        };

        this.get_best_move = (depth) => {
            return minimaxRoot(depth, this, true);
        };
    }
}

// http://stackoverflow.com/questions/11919065#answer-11958496
function lev_dist(s, t) {
    var d = []; //2d matrix
    // Step 1
    var n = s.length;
    var m = t.length;
    if (n == 0) return m;
    if (m == 0) return n;
    s = s.toLowerCase();
    t = t.toLowerCase();
    if (s == t) return 0;
    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];
    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;
    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);
        // Step 4
        for (var j = 1; j <= m; j++) {
            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;
            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5
            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;
            if (b < mi) mi = b;
            if (c < mi) mi = c;
            d[i][j] = mi; // Step 6
            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    // Step 7
    return d[n][m];
};

module.exports.peasants = {};

module.exports.peasants.tictactoe = 'ttt';
module.exports.peasants.ttt = async (message, content, lang, i18n, OpalBot) => {
    OpalBot.storage.tictactoe = OpalBot.storage.tictactoe || {};
    var id = message.author.id,
    chan_id = message.channel.id,
    sessions = OpalBot.storage.tictactoe,
    pending = sessions['pending-' + chan_id],
    invited = message.mentions.users.first();
    if (pending && pending[0] == id) {
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
    var host = pending,
    host_id = host[0];
    clearTimeout(host[2]);
    delete sessions['pending-' + chan_id];
    var session = sessions[id] = sessions[host_id] = new TicTacToe(host[0], id, host[1], message.author.username),
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
        turn = (turn + 1) % 2;
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
            }).catch(OpalBot.util.log),
            {message, index} = await OpalBot.unprefixed.expect({
                type: 'tictactoe',
                triggers: session.moves(),
                user: players[turn],
                channel: message.channel.id
            });
        } catch(e) {
            if (e == 'blocked') {
                message.channel.send(i18n.msg('blocked', 'tictactoe', lang)).catch(OpalBot.util.log);
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
        var move = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(session.moves()[index]),
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

module.exports.peasants.c4 = 'connect4';
module.exports.peasants.connect4 = async (message, content, lang, i18n, OpalBot) => {
    var sessions = OpalBot.storage.connect4 = OpalBot.storage.connect4 || {},
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
        var key = invited ? 'invite-' + invited.id : 'pending-' + chan_id;
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
    var host = invite || pending,
    host_id = host[0],
    host_name = host[1];
    if (invite) {
        delete sessions['invite-' + id];
    } else {
        delete sessions['pending-' + chan_id];
    }
    clearTimeout(host[2]);
    var c4 = sessions[id] = sessions[host_id] = new Connect4(host_id, id, host_name, name),
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
        try {
            var bot_message = await message.channel.send({
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
                var best = await c4.get_best_move();
                var message = {
                    channel: message.channel,
                    content: best,
                    delete: () => {}
                };
                var index = c4.moves().indexOf(String(best));
            } else {
                var {message, index} = await OpalBot.unprefixed.expect({
                    type: 'connect4',
                    triggers: c4.moves(),
                    user: players[turn],
                    channel: message.channel.id,
                    timeout: 180000
                });
            }
        } catch(e) {
            if (e == 'blocked') {
                message.channel.send(i18n.msg('blocked', 'connect4', lang)).catch(OpalBot.util.log);
                return;
            } else { // Timeout
                c4.winner = c4.player_to_move == 'blue' ? 'redt' : 'bluet';
                break;
            }
        }
        if (bot_message.deletable) {
            bot_message.delete();
        }
        if (message.deletable) {
            message.delete()
        }
        var move = ['1', '2', '3', '4', '5', '6', '7'].indexOf(c4.moves()[index]),
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

module.exports.peasants.ch = 'chess';
module.exports.peasants.chess = async (message, content, lang, i18n, OpalBot) => {
    var sessions = OpalBot.storage.chess = OpalBot.storage.chess || {},
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
        var key = invited ? 'invite-' + invited.id : 'pending-' + chan_id;
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
    var host = invite || pending,
    host_id = host[0],
    host_name = host[1];
    if (invite) {
        delete sessions['invite-' + id];
    } else {
        delete sessions['pending-' + chan_id];
    }
    clearTimeout(host[2]);
    var chess = sessions[id] = sessions[host_id] = new Chess(),
    turn = id == OpalBot.client.user.id ? 1 : Math.round(Math.random()), // 0 or 1
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
        var history = chess.history({ verbose: true }),
        last_move = history[history.length - 1];
        try {
            if (!skip) {
                var bot_message = await message.channel.send({
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
                var message = {
                    content: chess.get_best_move(3),
                    channel: message.channel
                }
            } else {
                var {message, index} = await OpalBot.unprefixed.expect({
                    type: 'chess',
                    user: players[turn],
                    channel: chan_id,
                    timeout: 1800000
                });
            }
        } catch(e) {
            OpalBot.util.log(e);
            if (e == 'blocked') {
                message.channel.send(i18n.msg('blocked', 'chess', lang)).catch(OpalBot.util.log);
                return;
            } else { // Timeout
                chess.timeout = true;
                break;
            }
        }
        if (i18n.msg('resign', 'chess', lang).split('|').includes(message.content.toLowerCase())) {
            message.channel.send(i18n.msg('resign-prompt', 'chess', lang) + ' [' + i18n.msg('yesno', 'chess', lang) + ']').catch(OpalBot.util.log);
            try {
                var {message, index} = await OpalBot.unprefixed.expect({
                    type: 'chess',
                    triggers: i18n.msg('yesno', 'chess', lang).split('/'),
                    user: players[turn],
                    channel: chan_id
                });
                if (index == 1) {
                    if (bot_message.deletable) {
                        bot_message.delete();
                    }
                    turn = (turn + 1) % 2;
                    continue;
                }
                chess.resigned = true;
                break;
            } catch(e) {
                if (bot_message.deletable) {
                    bot_message.delete();
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
        var play = chess.move(message.content.replace(/\s+/g, ''), {sloppy: true});
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
    var msg;
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

module.exports.peasants.typestart = 'typingcontest';
module.exports.peasants.typecontest = 'typingcontest';
module.exports.peasants.typingspeed = 'typingcontest';
module.exports.peasants.typingstart = 'typingcontest';
module.exports.peasants.typingcontest = async (message, content, lang, i18n, OpalBot) => {
    var storage = OpalBot.storage.quotes = OpalBot.storage.quotes || {},
    quote = null,
    fancy_characters = {
        '“': '"',
        '”': '"',
        '‘': "'",
        '’': "'",
        '—': '-',
        '―': '-',
        '‒': '-',
        '–': '-'
    },
    reg = new RegExp( Object.keys(fancy_characters).join('|'), 'g' );
    if (storage[message.channel.id]) {
        message.channel.send(i18n.msg('multiple', 'typingcontest', lang)).catch(OpalBot.util.log);
        return;
    }
    storage[message.channel.id] = true;
    while (!quote) {
        var {body} = await req('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=40'),
        quotes = JSON.parse(body).map(obj => {
            obj.content = obj.content
                .replace(/&#\d+;/g, str => {
                    return String.fromCharCode(str.slice(2, -1));
                })
                .replace(/<[a-z-\s\/]+>/gi, '')
                .replace(reg, char => fancy_characters[char])
                .trim();
            return obj;
        }),
        i = quotes.length;
        while (i--) {
            if (quotes[i].content.length > 150  && quotes[i].content.length < 800 && quotes[i].content.indexOf('\n') == -1) {
                quote = quotes[i];
                break;
            }
        }
    }
    storage[quote.ID] = quote;
    message.channel.send(i18n.msg('duration', 'typingcontest', Math.ceil(quote.content.length / 3 + 3), lang)).catch(OpalBot.util.log);
    var countdown = await message.channel.send(i18n.msg('countdown', 'typingcontest', 3, lang)).catch(OpalBot.util.log),
    scores = [];
    setTimeout(() => {
        countdown.edit(i18n.msg('countdown', 'typingcontest', 2, lang)).catch(OpalBot.util.log)
    }, 1000);
    setTimeout(() => {
        countdown.edit(i18n.msg('countdown', 'typingcontest', 1, lang)).catch(OpalBot.util.log)
    }, 2000);
    setTimeout(() => {
        if (countdown.deletable) {
            countdown.delete().catch(OpalBot.util.log);
        }
    }, 3000);
    setTimeout(() => {
        OpalBot.unprefixed.remove({
            type: 'typingcontest',
            channel: message.channel.id
        });
    }, quote.content.length * 1000 / 3 + 3);
    await new Promise(res => {
        setTimeout(() => {
            res();
        }, 2000);
    });
    var start_timestamp = Date.now() + 3000,
    finished = {},
    i = 0;
    message.channel.send({
        embed: {
            title: i18n.msg('image-title', 'typingcontest', lang),
            color: OpalBot.color,
            image: {
                url: 'http://opalbot.herokuapp.com/quote_image?id=' + quote.ID // Change this if you're selfhosting
            }
        }
    }).catch(OpalBot.util.log);
    while (true) {
        try {
            var {message} = await OpalBot.unprefixed.expect({
                type: 'typingcontest',
                channel: message.channel.id,
                timeout: quote.content.length * 1000 / 3 + 10
            });
        } catch(e) {
            break;
        }
        if (finished[message.author.id]) continue;
        if (lev_dist(quote.content, message.content) < Math.max(20, quote.content.length / 20)) {
            finished[message.author.id] = true;
            scores.push([message.author, Date.now(), message.content]);
            message.channel
                .send(i18n.msg('finished', 'typingcontest', message.author.username, ((Date.now() - start_timestamp) / 1000).toFixed(1), lang))
                .catch(OpalBot.util.log);
        }
    }
    if (!scores.length) {
        message.channel.send(i18n.msg('snails', 'typingcontest', lang)).catch(OpalBot.util.log);
    } else {
        var players = '',
        wpm_scores = '',
        incorrect_words = '';
        scores.forEach((arr, idx) => {
            var monospace_char = String.fromCharCode(55349) + String.fromCharCode(idx + 57335),
            correct_words = 0,
            errors = 0,
            split = arr[2].split(' ').filter(Boolean),
            original = quote.content.split(' ').filter(Boolean),
            i = 0,
            cur_index = 0,
            max = Math.max(split.length, original.length);
            players += '\n#' + monospace_char + ' ' + arr[0].username;
            while (i < max) {
                if (original[cur_index] == split[i]) {
                    cur_index++;
                    correct_words++;
                } else {
                    errors++;
                    if (original[cur_index + 1] == split[i]) {
                        cur_index++;
                    } else if (original[cur_index - 1] == split[i]) {
                        cur_index--;
                    }
                    cur_index++;
                }
                i++;
            }
            var elapsed = arr[1] - start_timestamp,
            secs = (elapsed / 1000).toFixed(1),
            wpm = Math.ceil( correct_words * ( 60 / ( elapsed / 1000 ) ) );
            wpm_scores += `${i18n.msg('score-format', 'typingcontest', wpm, secs, lang)}\n`;
            incorrect_words += errors + '\n';
        });
        message.channel.send({
            embed: {
                title: i18n.msg('title', 'typingcontest', lang),
                description: quote.content + ' - **' + quote.title + '**',
                color: OpalBot.color,
                fields: [
                    {
                        name: i18n.msg('player', 'typingcontest', lang),
                        value: players,
                        inline: true
                    }, {
                        name: i18n.msg('score', 'typingcontest', lang),
                        value: wpm_scores,
                        inline: true
                    }, {
                        name: i18n.msg('errors', 'typingcontest', lang),
                        value: incorrect_words,
                        inline: true
                    }
                ]
            }
        }).catch(OpalBot.util.log);
    }
    delete storage[message.channel.id];
};
