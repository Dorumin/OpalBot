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

module.exports = TicTacToe;