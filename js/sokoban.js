'use strict'
console.log('Sokoban')

const FLOOR = 'floor'
const WALL = 'wall'
const TARGET = 'target'
const BOX = 'box'
const GAMER = 'gamer'
const CLOCK = 'clock'
const GOLD = 'gold'
const GLUE = 'glue'
const BOX_COMPLETE = 'box complete'

const WIN_SOUND = new Audio('sound/win.mp3')
const LOSE_SOUND = new Audio('sound/lose.mp3')
const COMPLETE_SOUND = new Audio('sound/complete.wav')
const GLUE_SOUND = new Audio('sound/glue.wav')
const WALK_SOUND = new Audio('sound/walk.wav')
const LEVEL_COMPLETE = new Audio('sound/nextlevel.wav')

const GAMER_IMG = '&#128119'
const WALL_IMG = '&#128682'
const BOX_IMG = '&#128230'
const TARGET_IMG = '&#128306'
const BOX_COMPLETE_IMG = '&#128477'
const CLOCK_IMG = '&#128343'
const GOLD_IMG = '&#128176'
const GLUE_IMG = '&#127852'

var gWalkCount
var gUserScore = 100
var gBoard
var gBoxComplete
var gGamerPos
var gBoxesCount = 4
var gLevel = 0
var gGame
var gPrevBoards
var gSizeBoard = 11
var gSlctdOptnCount

var isPlay
var isCounted
var isVictory
var isGreen
var isRed
var isBoardChanged
var isUndo = false
var isSilent = false

function initGame() {
    isPlay = true
    isCounted = true
    isVictory = false
    isGreen = false
    isRed = false
    isBoardChanged = false
    gPrevBoards = []
    gWalkCount = 0
    gGamerPos = { i: 1, j: 6 }
    gBoxComplete = 0
    gSlctdOptnCount = 0
    changeText('.score span', gUserScore)
    changeText('.level span', 1)
    document.querySelector('.win').style.opacity = 0
    document.querySelector('.next').style.backgroundColor = 'black'
    document.querySelector('.restart').style.backgroundColor = 'black'
    gBoard = buildBoard(createMat(gSizeBoard, gSizeBoard))
    renderBoard(gBoard)
    setLevel()
    gGame = setInterval(addElements, 10000, gBoard)
}

function setLevel() {
    var counter = 0
    while (counter !== gBoxesCount) {
        counter++
        addTargets(gBoard)
        setTimeout(addBoxes, 50, gBoard)
    }
}

function boardSize(size) {
    gSlctdOptnCount++
    if (gSlctdOptnCount < 2 || !isPlay) return
    changeButtonColor('.restart', 'black')
    if (size === 's') {
        gSizeBoard = 11
        gUserScore = 100
    }
    else if (size === 'm') {
        gSizeBoard = 15
        gUserScore = 180
    }
    else if (size === 'xl') {
        gSizeBoard = 20
        gUserScore = 250
    }
    gSlctdOptnCount = 0
    clearInterval(gGame)
    isBoardChanged = true
    changeButtonColor('.restart', 'green')
}

function nextLevel() {
    if (!isPlay && !isVictory) return
    if (isBoardChanged) return
    if (gLevel !== 2 && isVictory) {
        gLevel++
        clearInterval(gGame)
        isPlay = false
        gBoxesCount += 2
        changeText('.level span', gLevel + 1)
        initGame()
    }
}

function restart() {
    clearInterval(gGame)
    isPlay = false
    gBoxesCount = 4
    gLevel = 0
    initGame()
}

function checkIfNegsAvail(callI, cellJ, element) {
    for (var i = callI - 1; i <= callI + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > gBoard.length - 1) continue
            if (gBoard[i][j].type === element || gBoard[i][j].gameElement === element) return false
        }
    }
    return true
}

function addBoxes(board) {
    var isFound = false
    while (!isFound) {
        var emptyCell = findEmptyCell(board)
        if (checkIfNegsAvail(emptyCell.i, emptyCell.j, WALL) && checkIfNegsAvail(emptyCell.i, emptyCell.j, BOX)) isFound = true
    }
    addElement(board, emptyCell, BOX, BOX_IMG)
}

function addTargets(board) {
    var isFound = false
    while (!isFound) {
        var emptyCell = findEmptyCell(board)
        if (checkIfNegsAvail(emptyCell.i, emptyCell.j, TARGET)) isFound = true
    }
    addElement(board, emptyCell, TARGET, TARGET_IMG)
}

function renderBoard(board) {
    var strHTML = ''
    strHTML += '<tr>'

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            var currCell = board[i][j]
            var cellClass1 = getClassName({ i: i, j: j })
            var cellClass2 = (currCell.type === FLOOR) ? 'floor' : 'wall'

            strHTML += `<td onclick="moveTo(${i}, ${j})" class="${cellClass1} ${cellClass2}" >`

            if (currCell.type === WALL) strHTML += WALL_IMG

            if (currCell.gameElement === BOX) strHTML += BOX_IMG
            else if (currCell.gameElement === GAMER) strHTML += GAMER_IMG
            else if (currCell.gameElement === TARGET) strHTML += TARGET_IMG
            else if (currCell.gameElement === BOX_COMPLETE) strHTML += BOX_COMPLETE_IMG

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function buildBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                type: FLOOR,
                gameElement: null
            }
        }
    }
    for (var i = 0; i < board.length; i++) {
        board[0][i].type = WALL
        board[board.length - 1][i].type = WALL
        board[i][board[0].length - 1].type = WALL
        board[i][0].type = WALL
    }

    board[5][1].type = WALL
    board[5][2].type = WALL
    board[5][3].type = WALL
    board[5][4].type = WALL
    board[6][4].type = WALL
    board[1][6].gameElement = GAMER

    return board
}

function moveTo(i, j) {
    var iAbsDiff = Math.abs(i - gGamerPos.i)
    var jAbsDiff = Math.abs(j - gGamerPos.j)
    var isDblMuve = false
    var targetCell = gBoard[i][j]
    var currCell
    var cell
    var nextCell
    var currCell
    var futureCell
    var nextGmrLocation
    var nextElmtLocation

    if (!isPlay) return
    if (targetCell.type === WALL || targetCell.gameElement === BOX_COMPLETE) return

    if (!isUndo) gPrevBoards.push(copyMat(gBoard))
    changeCellColor(gGamerPos, 'rgb(212, 166, 80)')

    if ((iAbsDiff === 2 && jAbsDiff === 0) ||
        (jAbsDiff === 2 && iAbsDiff === 0) ||
        (iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (!isSilent) WALK_SOUND.play()

        if (iAbsDiff === 2 || jAbsDiff === 2) isDblMuve = true
        if (i - gGamerPos.i === 1 || i - gGamerPos.i === 2) nextCell = isDblMuve ? { i: i - 1, j } : { i: i + 1, j }
        else if (i - gGamerPos.i === -1 || gGamerPos.i - i === 2) nextCell = isDblMuve ? { i: i + 1, j } : { i: i - 1, j }
        else if (j - gGamerPos.j === 1 || j - gGamerPos.j === 2) nextCell = isDblMuve ? { i, j: j - 1 } : { i, j: j + 1 }
        else if (j - gGamerPos.j === -1 || gGamerPos.j - j === 2) nextCell = isDblMuve ? { i, j: j + 1 } : { i, j: j - 1 }

        cell = gBoard[nextCell.i][nextCell.j]
        currCell = isDblMuve ? cell : targetCell
        futureCell = isDblMuve ? targetCell : cell
        nextElmtLocation = isDblMuve ? { i, j } : nextCell
        nextGmrLocation = isDblMuve ? nextCell : { i, j }

        if (!isDblMuve && targetCell.gameElement === TARGET) return
        if (currCell.gameElement === BOX) {
            if (futureCell.gameElement === BOX_COMPLETE || futureCell.type !== FLOOR || futureCell.gameElement === BOX) return
            if (futureCell.gameElement === null) {
                addElement(gBoard, nextElmtLocation, BOX, BOX_IMG)
            } else if (futureCell.gameElement === TARGET) {
                if (!isSilent) COMPLETE_SOUND.play()
                addElement(gBoard, nextElmtLocation, BOX_COMPLETE, BOX_COMPLETE_IMG)
                gBoxComplete++
            } else if (futureCell.gameElement === GLUE || futureCell.gameElement === GOLD || futureCell.gameElement === CLOCK) return
        }
        else if (currCell.gameElement === GLUE) meetGlue()
        else if (currCell.gameElement === GOLD) meetGold()
        else if (currCell.gameElement === CLOCK) meetClock()
        else if (isDblMuve && currCell.gameElement === null) return

        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')
        gGamerPos.i = isDblMuve ? nextCell.i : i
        gGamerPos.j = isDblMuve ? nextCell.j : j
        renderCell(nextGmrLocation, GAMER_IMG)
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

        if (isGreen) changeCellColor(gGamerPos, 'yellowgreen')
        else if (isRed) changeCellColor(gGamerPos, 'red')
        if (!isCounted) gWalkCount++
        if (isCounted) gUserScore--
        if (gWalkCount === 10) {
            isCounted = true
            gWalkCount = 0
            isGreen = false
        }
    }
    changeText('span', gUserScore)
    if (checkIfVictory()) gameOver()
}

function checkMove(nextCell, element) {
    if (nextCell.type === element || nextCell.gameElement === element) return false
    return true
}

function silent() {
    if (!isSilent) {
        isSilent = true
        document.querySelector('.silent').innerHTML = '&#128263'
    }
    else {
        isSilent = false
        document.querySelector('.silent').innerHTML = '&#128266'
    }
}

function undo() {
    if (isBoardChanged) return
    if (!gPrevBoards.length || !isPlay) {
        changeButtonColor('.undo', 'red')
    } else {
        isUndo = true
        gBoxComplete = 0
        gUserScore++
        changeText('span', gUserScore)
        changeButtonColor('.undo', 'green')
        var currBoard = gPrevBoards[gPrevBoards.length - 1]
        for (var i = 0; i < currBoard.length; i++) {
            for (var j = 0; j < currBoard[i].length; j++) {
                if (currBoard[i][j].gameElement === GAMER) gGamerPos = { i, j }
                else if (currBoard[i][j].gameElement === GLUE || currBoard[i][j].gameElement === GOLD || currBoard[i][j].gameElement === CLOCK) currBoard[i][j].gameElement === null
                else if (currBoard[i][j].gameElement === BOX_COMPLETE) gBoxComplete++
            }
        }
        gBoard = currBoard
        renderBoard(gBoard)
        gPrevBoards.splice(gPrevBoards.indexOf(currBoard), 1)
    }
    isUndo = false
    setTimeout(changeButtonColor, 500, '.undo', 'black')
}

function meetClock() {
    isCounted = false
    isGreen = true
}

function meetGlue() {
    if (!isSilent) GLUE_SOUND.play()
    isGreen = false
    gUserScore -= 5
    isPlay = false
    isRed = true
    setTimeout(() => {
        isPlay = true
        isRed = false
        document.querySelector('.' + getClassName(gGamerPos)).style.backgroundColor = 'rgb(212, 166, 80)'
    }, 5000)
}

function meetGold() {
    gUserScore += 100
    isGreen = true
}

function gameOver() {
    isPlay = false
    clearInterval(gGame)
    if (!isVictory) {
        if (!isSilent) LOSE_SOUND.play()
        document.querySelector('.win').innerText = 'You lose...'
        changeButtonColor('.restart', 'green')
        document.querySelector('.restart').style.transition = '1s'
    } else if (isVictory) {
        if (gLevel < 2) {
            if (!isSilent) setTimeout(() => { LEVEL_COMPLETE.play() }, 500)
            changeButtonColor('.next', 'green')
            document.querySelector('.next').style.transition = '1s'
            document.querySelector('.win').innerText = 'Good job!'
        } else if (gLevel === 2) {
            if (!isSilent) WIN_SOUND.play()
            changeButtonColor('.restart', 'green')
            document.querySelector('.next').style.transition = '1s'
            document.querySelector('.win').innerText = 'You win!'
        }
    }
    document.querySelector('.win').style.opacity = 1
}

function checkIfVictory() {
    if (gUserScore === 0) return true
    if (gBoxComplete === gBoxesCount) {
        isVictory = true
        return true
    }
    return false
}

function addElements(board) {
    addClock(board)
    addGold(board)
    addGlue(board)
}

function addClock(board) {
    var currCell = findEmptyCell(board)
    addElement(board, currCell, CLOCK, CLOCK_IMG)
    setTimeout(deleteElement, 5000, board, currCell, CLOCK)
}

function addGlue(board) {
    var currCell = findEmptyCell(board)
    addElement(board, currCell, GLUE, GLUE_IMG)
    setTimeout(deleteElement, 5000, board, currCell, GLUE)
}

function addGold(board) {
    var currCell = findEmptyCell(board)
    addElement(board, currCell, GOLD, GOLD_IMG)
    setTimeout(deleteElement, 5000, board, currCell, GOLD)
}

function addElement(board, cell, element, imgElement) {
    board[cell.i][cell.j].gameElement = element
    renderCell(cell, imgElement)
}

function deleteElement(board, cell, element) {
    if (board[cell.i][cell.j].gameElement === element) {
        board[cell.i][cell.j].gameElement = null
        renderCell(cell, null)
    }
}

function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    document.querySelector(cellSelector).innerHTML = value
}

function changeCellColor(location, color) {
    var cellSelector = '.' + getClassName(location)
    document.querySelector(cellSelector).style.backgroundColor = color
}

function changeButtonColor(button, color) {
    document.querySelector(button).style.backgroundColor = color
}

function changeText(location, newText) {
    document.querySelector(location).innerText = newText
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;
    }

}

function findEmptyCell(board) {
    var emptyCells = []
    for (var i = 1; i < board.length - 1; i++) {
        for (var j = 1; j < board[i].length - 1; j++) {
            if (board[i][j].type !== WALL && board[i][j].gameElement === null) emptyCells.push({ i, j })
        }
    }
    return emptyCells[getRandomInt(0, emptyCells.length)]
}

function copyMat(board) {
    var newMat = []
    for (var i = 0; i < board.length; i++) {
        newMat[i] = []
        for (var j = 0; j < board[i].length; j++) {
            newMat[i][j] = { ...board[i][j] }
        }
    }
    return newMat
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}
