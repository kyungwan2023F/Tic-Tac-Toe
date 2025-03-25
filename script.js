function GameBoard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }
    const getBoardArray = () => board;

    const dropToken = (row, column, player) => {
        if (board[row][column].getValue() === 0) {
            board[row][column].addToken(player);
            return true;
        }
        else {
            console.log('Invalid Move. Pick Again.');
            return false;
        }
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    const clearBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell());
            }
        }
    };
    return { getBoardArray, dropToken, printBoard, clearBoard };
}

function Cell() {
    let value = 0;

    // Accept a player's token to change the value of the cell
    const addToken = (player) => {
        value = player;
    };

    // Retrieve the current value of this cell through closure
    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

function GameController() {
    let turn_counter = 0;

    const board = GameBoard();

    const players = [
        {
            name: "Player One",
            token: 1
        },
        {
            name: "Player Two",
            token: 2
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]
        console.log(turn_counter);
    };

    const printNewRound = () => {
        board.printBoard();
    };

    const getActivePlayer = () => activePlayer;

    const resetPressed = () => {
        activePlayer = players[0];
        turn_counter = 0;
        return activePlayer;
    }

    const getBoard = () => board;

    const playRound = (row, column) => {
        console.log(`${getActivePlayer().name}'s turn.`);
        console.log(
            `Dropping ${getActivePlayer().name}'s token into row ${row} column ${column}...`
        );

        if (!board.dropToken(row, column, getActivePlayer().token)) {
            return "invalid";
        }

        turn_counter += 1;

        const currentWinner = checkWinner();
        if (currentWinner !== null) {
            return currentWinner;
        }
        
        // Check Tie
        if (turn_counter >= 9){
            return "tie";
        }

        printNewRound();
        switchPlayerTurn();

        return "continue";
    };

    const checkWinner = () => {
        const boardArray = board.getBoardArray();
        // Check Rows
        for (let i = 0; i < 3; i++) {
            if (boardArray[i][0].getValue() !== 0) {
                if (boardArray[i][0].getValue() === boardArray[i][1].getValue() && boardArray[i][1].getValue() === boardArray[i][2].getValue()) {
                    console.log(`${getActivePlayer().name} won! by Rows`);
                    const winner = getActivePlayer();
                    return winner;
                }
            }
        }

        // Check Columns
        for (let i = 0; i < 3; i++) {
            if (boardArray[0][i].getValue() !== 0) {
                if (boardArray[0][i].getValue() === boardArray[1][i].getValue() && boardArray[1][i].getValue() === boardArray[2][i].getValue()) {
                    console.log(`${getActivePlayer().name} won! by columns`);
                    const winner = getActivePlayer();
                    return winner;
                }
            }
        }

        // Check Diagonals
        if (boardArray[0][0].getValue() !== 0) {
            if (boardArray[0][0].getValue() == boardArray[1][1].getValue() && boardArray[1][1].getValue() === boardArray[2][2].getValue()) {
                console.log(`${getActivePlayer().name} won!`);
                const winner = getActivePlayer();
                return winner;
            }
        }
        if (boardArray[0][2].getValue() !== 0) {
            if (boardArray[0][2].getValue() == boardArray[1][1].getValue() && boardArray[1][1].getValue() === boardArray[2][0].getValue()) {
                console.log(`${getActivePlayer().name} won!`);
                const winner = getActivePlayer();
                return winner;
            }
        }

        return null;
    };

    const playGame = () => {
        while (!checkWinner()) {
            let input = prompt("Enter the coordinates of your move (e.g., 0, 0):");
            let [row, column] = input.split(",").map(item => item.trim());
            if (!playRound(row, column)) {
                let input = prompt("Enter the coordinates of your move (e.g., 0, 0):");
                let [newRow, newColumn] = input.split(",").map(item => item.trim());
                playRound(newRow, newColumn);
            }
        }
    };

    return {
        playRound,
        getActivePlayer,
        resetPressed,
        getBoard,
        playGame
    };
}

function screenController() {
    let playerOneScore = 0;
    let playerTwoScore = 0;
    const game = GameController();
    const board = document.querySelector(".board");
    const turn = document.querySelector(".turn");
    const againButton = document.querySelector(".play_again");
    const scoreOneDisplay = document.querySelector(".player1_score");
    const scoreTwoDisplay = document.querySelector(".player2_score");
    const reset_score_button = document.querySelector(".reset_score_button");
    let gameOver = false;

    const updateScreen = (winner = null) => {
        board.innerHTML = '';

        // Get the current state of the game board
        const boardArray = game.getBoard().getBoardArray();

        boardArray.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.textContent = cell.getValue() === 0 ? '' : (cell.getValue() === 1 ? 'X' : 'O');

                if (cell.getValue() === 1) {
                    cellElement.classList.add('x');
                }
                if (cell.getValue() === 2) cellElement.classList.add('o');

                if (!gameOver) {
                    // Add event listener to handle clicks
                    cellElement.addEventListener('click', () => {
                        handleCellClick(rowIndex, colIndex);
                    });
                }

                board.appendChild(cellElement);
            });
        });

        againButton.addEventListener('click', () => {
            game.getBoard().clearBoard();
            turn.textContent = `${game.resetPressed().name}'s turn`;
            gameOver = false;
            updateScreen();
        });

        reset_score_button.addEventListener('click', () => {
            game.getBoard().clearBoard();
            turn.textContent = `${game.resetPressed().name}'s turn`;
            playerOneScore = 0;
            playerTwoScore = 0;
            scoreOneDisplay.textContent = playerOneScore;
            scoreTwoDisplay.textContent = playerTwoScore;
            gameOver = false;
            updateScreen();
        });

        if (winner !== null) {
            turn.textContent = `${winner.name} wins!`;

            switch (winner.token) {
                case 1:
                    scoreOneDisplay.textContent = playerOneScore;
                    break;
                case 2:
                    scoreTwoDisplay.textContent = playerTwoScore;
                    break;  
            }
            return;
        }

        turn.textContent = `${game.getActivePlayer().name}'s turn`;
    };

    const handleCellClick = (row, column) => {
        const result = game.playRound(row, column);

        if (result === "invalid") {
            turn.textContent = `Invalid Move. Try Again`;
            return;
        }
        else if (result === "continue") {
            updateScreen();
            return;
        }
        else if (result === "tie") {
            updateScreen();
            turn.textContent = `Tie! Play Again!`;
            gameOver = true;
            return;
        }
        else {
            gameOver = true;
            if (result.token === 1){
                playerOneScore += 1;
            }
            else {
                playerTwoScore += 1;
            }
            updateScreen(result);
        }
    }

    return { updateScreen, handleCellClick };
}

const screen = screenController();

// Initialize UI
screen.updateScreen();





