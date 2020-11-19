'use strict'

var gBoard
var gTimeInterval
var gGame
var gLevel = { size: 4, mines: 2 };
var gLifes;

function init(cell) {
    if (!cell) {
        gLifes = 3;
        renderLifes()
        gGame = {
            isOn: true,
            shownCount: 0,
            markedCount: 0,
            secsPassed: 0
        }
        gBoard = buildBoard()
        renderBoard('.board-container')
    } else {
        gBoard = buildBoard(cell)
    }
}

function buildBoard(cell) {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isVisited: false
            }
        }
    }
    if (cell) {
        createMines(board, cell)
        setMinesNegsCount(board)
    }
    return board
}

function createMines(board, cell) {
    var counter = 0
    var i, j;
    while (counter < gLevel.mines) {
        i = getRandomIntInclusive(0, gLevel.size - 1)
        j = getRandomIntInclusive(0, gLevel.size - 1)
        if (!board[i][j].isMine && i !== cell.i && j !== cell.j) {
            board[i][j].isMine = true
            counter++
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue
            var minesNum = countMines(board, i, j)
            board[i][j].minesAroundCount = minesNum;
        }
    }
}

function countMines(board, i, j) {
    var count = 0;
    for (var a = i - 1; a <= i + 1; a++) {
        if (a < 0 || a > board.length - 1) continue
        for (var b = j - 1; b <= j + 1; b++) {
            if (b < 0 || b > board.length - 1) continue
            if (board[a][b].isMine) count++;
        }
    }
    return count
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked) return
    if (gGame.shownCount === 0) init({ i, j })

    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++
    }

    if (gBoard[i][j].isMine) {
        elCell.innerText = '💣';
        if (gLifes > 0) {
            gLifes--
            renderLifes()
        } else {
            gameOver()
        }
    } else {
        renderCell(i, j)
        if (checkGameOver()) gameOver(true)
    }
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(i, j)
    }
    if (!gTimeInterval) {
        setTimer()
    }
}

function renderLifes() {
    for (var i = 0; i < 3; i++) {
        document.querySelector(`#life-${i + 1}`).innerText = i < gLifes ? '❤️' : ''
    }
}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault();
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++
        elCell.innerText = '🤔'
        if (!gTimeInterval) setTimer()
        if (checkGameOver()) gameOver(true)
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--
        elCell.innerText = ''
    }
}

function setLevel(value) {
    switch (value) {
        case 'beginner':
            gLevel = { size: 4, mines: 2 };
            break
        case 'medium':
            gLevel = { size: 8, mines: 12 };
            break
        case 'expert':
            gLevel = { size: 12, mines: 30 };
            break
    }
    gGame.isOn = false;
    restart()
}

function setTimer() {
    document.querySelector('.timer').innerText = 1
    var startTime = Date.now();
    gTimeInterval = setInterval(function () {
        var passedTime = Date.now() - startTime + 1000;
        document.querySelector('.timer').innerText = (passedTime / 1000).toFixed(0);
        gGame.secsPassed = (passedTime / 1000).toFixed(0)
    }, 1000);
}

function checkGameOver() {
    var square = gLevel.size * gLevel.size;
    if (gGame.markedCount === gLevel.mines && gGame.shownCount === square - gLevel.mines) return true
}

function gameOver(victory) {
    showAllMines()
    document.querySelector('.popup h2').innerText = victory ? 'You Won!' : 'Game Over!'
    document.querySelector('button').innerText = victory ? '😎' : '🤯';
    document.querySelector('.popup').hidden = false;
    gGame.isOn = false;
    clearInterval(gTimeInterval)
}

function showAllMines() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine) {
                document.querySelector(`#cell-${i}-${j}`).innerText = '💣'
            }
        }
    }
}

function restart() {
    document.querySelector('.timer').innerText = 0
    document.querySelector('.popup').hidden = true;
    document.querySelector('button').innerText = '😃';
    clearInterval(gTimeInterval)
    gTimeInterval = null;
    gGame.isOn = false;
    init();
}

function expandShown(i, j) {
    if (gBoard[i][j].isMine || gBoard[i][j].isVisited) return
    gBoard[i][j].isVisited = true;
    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true;
        gGame.shownCount++
        renderCell(i, j)
    }
    if (gBoard[i][j].minesAroundCount !== 0) return

    for (var a = i - 1; a <= i + 1; a++) {
        if (a < 0 || a > gBoard.length - 1) continue
        for (var b = j - 1; b <= j + 1; b++) {
            if (b < 0 || b > gBoard.length - 1) continue
            if (a === i && b === j) continue
            expandShown(a, b)
        }
    }
    return true
}

function renderCell(i, j) {
    gBoard[i][j].isShown = true;
    gGame.isShown++
    var selector = `#cell-${i}-${j}`
    if (gBoard[i][j].minesAroundCount > 0) {
        document.querySelector(selector).innerText = gBoard[i][j].minesAroundCount
    } else {
        document.querySelector(selector).innerText = ''
    }
    document.querySelector(selector).style.backgroundColor = 'rgb(209, 185, 141)'
}