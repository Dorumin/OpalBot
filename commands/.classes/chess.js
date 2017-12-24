const BasicChess = require('./chess-base.js').Chess;

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
            return piece.color === this.player_to_move ? absoluteValue : -absoluteValue;
        };

        this.get_best_move = (depth) => {
            return minimaxRoot(depth, this, true);
        };
    }
}

module.exports = Chess;