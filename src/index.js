import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={'square' + (props.highlight ? ' highlight' : '')}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                highlight={this.props.winSquares && this.props.winSquares.includes(i)}
            />
        );
    }

    render() {
        let squares = [];
        for (let i = 0; i < 3; ++i) {
            let row = [];
            for (let j = 0; j < 3; ++j) {row.push(this.renderSquare(i*3 + j));}
            squares.push(<div key={i} className="board-row"> {row} </div>);
        }

        return <div>{squares}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{squares: Array(9).fill(null)}],
            stepNumber: 0,
            xIsNext: true,
            isAscending: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                lastMove: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    handleSorting() {
        this.setState({isAscending : !this.state.isAscending});
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const win = calculateWinner(current.squares);
        const winner = win.winner;

        let moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + getColRow(step.lastMove):
                'Go to start';
            return (
                <li key={move}>
                    <button
                        className={move === this.state.stepNumber ? 'current-move' : ''}
                        onClick={() => this.jumpTo(move)}
                    >
                        {desc}
                    </button>
                </li>
            )
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if (win.isDraw) {
                status = 'This is a Draw';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }

        const isAscending = this.state.isAscending;
        if (!isAscending) { moves.reverse(); }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winSquares = {win.line}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.handleSorting()}>{'Reverse sorting'}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i],
                isDraw: false,
            };
        }
    }

    let isDraw = true;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            isDraw = false;
            break;
        }
    }
    return {
        winner: null,
        line: null,
        isDraw: isDraw,
    };
}

function getColRow(i) {
    const col = 1 + i % 3;
    const row = 1 + Math.floor(i / 3);
    return ' - (' + col + ', ' + row + ')';
}