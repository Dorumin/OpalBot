const request = require('request'),
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
                return ':blue_circle:';
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

module.exports = Connect4;
