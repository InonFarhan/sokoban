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

const GAMER_IMG = '&#128119'
const WALL_IMG = '&#128682'
const BOX_IMG = '&#128230'
const TARGET_IMG = '&#128306'
const BOX_COMPLETE_IMG = '&#128477'
const CLOCK_IMG = '&#128343'
const GOLD_IMG = '&#128176'
const GLUE_IMG = '&#127852'

var gWalkCount
var gUserScore
var gBoard
var gBoxComplete
var gGamerPos
var gBoxesCount = 4
var gLevel = 0
var gGame

var isPlay
var isCounted
var isVictory
var isGreen
var isRed

function initGame() {
    var counter = 0
    isPlay = true
    isCounted = true
    isVictory = false
    isGreen = false
    isRed = false
    gWalkCount = 0
    gGamerPos = { i: 1, j: 6 }
    gUserScore = 100
    gBoxComplete = 0
    document.querySelector('span').innerText = gUserScore
    document.querySelector('.win').style.opacity = 0
    gBoard = buildBoard()
    while (counter !== gLevel) {
        counter++
        addBoxes(gBoard)
        addTargets(gBoard)
    }
    renderBoard(gBoard)
    gGame = setInterval(addElements, 10000, gBoard)
}

function nextLevel() {
    clearInterval(gGame)
    isPlay = false
    gLevel += 2
    gBoxesCount += 2
    initGame()
}

function restart() {
    clearInterval(gGame)
    isPlay = false
    gBoxesCount = 4
    gLevel = 0
    initGame()
}

function addBoxes(board) {
    var currCell = findEmptyCell(board)
    addElement(board, currCell, BOX, BOX_IMG)
}

function addTargets(board) {
    var currCell = findEmptyCell(board)
    addElement(board, currCell, TARGET, TARGET_IMG)
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

function buildBoard() {
    var board = createMat(10, 10)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                type: FLOOR,
                gameElement: null
            }
        }
    }
    for (var I = 0; I < board.length; I++) {
        board[0][I].type = WALL
        board[board.length - 1][I].type = WALL
        board[I][board[0].length - 1].type = WALL
        board[I][0].type = WALL
    }

    board[2][1].type = WALL
    board[2][2].type = WALL
    board[3][2].type = WALL
    board[3][3].type = WALL
    board[4][2].type = WALL

    board[5][4].gameElement = TARGET
    board[5][8].gameElement = TARGET
    board[6][3].gameElement = TARGET
    board[6][2].gameElement = TARGET

    board[6][4].gameElement = BOX
    board[6][6].gameElement = BOX
    board[5][3].gameElement = BOX
    board[3][6].gameElement = BOX

    board[1][6].gameElement = GAMER

    return board
}

function moveTo(i, j) {
    var nextCell
    var currCell
    var targetCell
    var iAbsDiff = Math.abs(i - gGamerPos.i)
    var jAbsDiff = Math.abs(j - gGamerPos.j)

    if (!isPlay) return
    WALK_SOUND.play()
    document.querySelector('.' + getClassName(gGamerPos)).style.backgroundColor = 'rgb(212, 166, 80)'

    if (iAbsDiff === 2 && jAbsDiff === 0 || jAbsDiff === 2 && iAbsDiff === 0 || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        targetCell = gBoard[i][j]

        if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

            if (targetCell.type === WALL || targetCell.gameElement === TARGET || targetCell.gameElement === BOX_COMPLETE) return

            if (i - gGamerPos.i === 1) {
                nextCell = gBoard[i + 1][j]
                currCell = { i: i + 1, j }
            } else if (gGamerPos.i - i === 1) {
                nextCell = gBoard[i - 1][j]
                currCell = { i: i - 1, j }
            } else if (j - gGamerPos.j === 1) {
                nextCell = gBoard[i][j + 1]
                currCell = { i, j: j + 1 }
            } else if (gGamerPos.j - j === 1) {
                nextCell = gBoard[i][j - 1]
                currCell = { i, j: j - 1 }
            }
            if (targetCell.gameElement === BOX) {
                if (nextCell.type === WALL || nextCell.gameElement === BOX || nextCell.gameElement === GOLD || nextCell.gameElement === GLUE || nextCell.gameElement === CLOCK || nextCell.gameElement === BOX_COMPLETE) return

                if (nextCell.gameElement === null) {
                    nextCell.gameElement = BOX
                    renderCell(currCell, BOX_IMG)

                } else if (nextCell.gameElement === TARGET) {
                    addElement(gBoard, currCell, BOX_COMPLETE, BOX_COMPLETE_IMG)
                    COMPLETE_SOUND.play()
                    gBoxComplete++
                }
            } else if (targetCell.gameElement === CLOCK) meetClock()
            else if (targetCell.gameElement === GOLD) meetGold()
            else if (targetCell.gameElement === GLUE) meetGlue()
            renderCell(gGamerPos, '')

            gGamerPos.i = i
            gGamerPos.j = j
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
            renderCell(gGamerPos, GAMER_IMG)

        } else if (iAbsDiff === 2 && jAbsDiff === 0 || jAbsDiff === 2 && iAbsDiff === 0) {

            if (targetCell.gameElement === null || targetCell.gameElement === TARGET) {

                if (i - gGamerPos.i === 2) {
                    nextCell = gBoard[i - 1][j]
                    currCell = { i: i - 1, j }
                } else if (gGamerPos.i - i === 2) {
                    nextCell = gBoard[i + 1][j]
                    currCell = { i: i + 1, j }
                } else if (j - gGamerPos.j === 2) {
                    nextCell = gBoard[i][j - 1]
                    currCell = { i, j: j - 1 }
                } else if (gGamerPos.j - j === 2) {
                    nextCell = gBoard[i][j + 1]
                    currCell = { i, j: j + 1 }
                }

                if (nextCell.gameElement === null) return
                if (nextCell.gameElement === BOX) {
                    if (targetCell.gameElement === GOLD || nextCell.gameElement === GLUE || nextCell.gameElement === CLOCK) return

                    if (targetCell.gameElement === null) {
                        targetCell.gameElement = BOX
                        renderCell({ i, j }, BOX_IMG)
                    } else if (targetCell.gameElement === TARGET) {
                        addElement(gBoard, { i, j }, BOX_COMPLETE, BOX_COMPLETE_IMG)
                        gBoxComplete++
                    }
                }
                renderCell(gGamerPos, '')
                gGamerPos.i = currCell.i
                gGamerPos.j = currCell.j
                gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
                renderCell(gGamerPos, GAMER_IMG)

            }
        }
    }
    if (!isCounted) gWalkCount++
    if (isGreen) document.querySelector('.' + getClassName(gGamerPos)).style.backgroundColor = 'yellowgreen'
    else if (isRed) document.querySelector('.' + getClassName(gGamerPos)).style.backgroundColor = 'red'
    if (isCounted) gUserScore--
    if (gWalkCount === 10) {
        isCounted = true
        gWalkCount = 0
        isGreen = false
    }
    document.querySelector('span').innerText = gUserScore
    if (checkIfVictory()) gameOver()
}

function meetClock() {
    isCounted = false
    isGreen = true
}

function meetGlue() {
    GLUE_SOUND.play()
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
    document.querySelector('.win').innerText = 'You lose...'
    isPlay = false
    clearInterval(gGame)
    if (!isVictory) LOSE_SOUND.play()
    if (isVictory) {
        document.querySelector('.win').innerText = 'You win!'
        WIN_SOUND.play()
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
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].type !== WALL && board[i][j].gameElement !== GAMER && board[i][j].gameElement !== TARGET && board[i][j].gameElement !== BOX_COMPLETE && board[i][j].gameElement !== BOX && board[i][j].gameElement !== GLUE && board[i][j].gameElement !== GOLD && board[i][j].gameElement !== CLOCK && i !== 1 && i !== board.length - 2 && j !== 1 && j !== board[i].length - 2) emptyCells.push({ i, j })
        }
    }
    return emptyCells[getRandomInt(0, emptyCells.length)]
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

// function moveTo(i, j) {
//     if (isPlay) {
//         userScore--
//         var nextCell
//         var iAbsDiff = Math.abs(i - gGamerPos.i)
//         var jAbsDiff = Math.abs(j - gGamerPos.j)

//         if (iAbsDiff === 2 && jAbsDiff === 0 || jAbsDiff === 2 && iAbsDiff === 0) {
//             if (i - gGamerPos.i === 2) {
//                 nextCell = gBoard[i][j]
//                 if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                 else if (nextCell.gameElement === TARGET && gBoard[i - 1][j].gameElement === BOX) {

//                     gBoard[i - 1][j].gameElement === GAMER
//                     renderCell({ i: i - 1, j }, GAMER_IMG)

//                     nextCell.gameElement === BOX_COMPLETE
//                     renderCell({ i, j }, BOX_COMPLETE_IMG)

//                     gBoard[i - 1][j].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i - 1
//                     gGamerPos.j = j

//                     gBoxComplete++
// } else if (nextCell.gameElement === null && gBoard[i - 1][j].gameElement === BOX) {

//     nextCell.gameElement = BOX
//     renderCell({ i, j }, BOX_IMG)

//     gBoard[i - 1][j].gameElement === GAMER
//     renderCell({ i: i - 1, j }, GAMER_IMG)

//     gBoard[i - 1][j].gameElement = GAMER
//     renderCell(gGamerPos, '')
//     gGamerPos.i = i - 1
//     gGamerPos.j = j
// }
//             } else if (gGamerPos.i - i === 2) {
//                 nextCell = gBoard[i][j]
//                 if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                 else if (nextCell.gameElement === TARGET && gBoard[i + 1][j].gameElement === BOX) {

//                     gBoard[i + 1][j].gameElement === GAMER
//                     renderCell({ i: i + 1, j }, GAMER_IMG)

//                     nextCell.gameElement === BOX_COMPLETE
//                     renderCell({ i, j }, BOX_COMPLETE_IMG)

//                     gBoard[i - 1][j].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i + 1
//                     gGamerPos.j = j

//                     gBoxComplete++
//                 } else if (nextCell.gameElement === null && gBoard[i + 1][j].gameElement === BOX) {
//                     nextCell.gameElement = BOX
//                     renderCell({ i, j }, BOX_IMG)

//                     gBoard[i + 1][j].gameElement === GAMER
//                     renderCell({ i: i + 1, j }, GAMER_IMG)

//                     gBoard[i + 1][j].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i + 1
//                     gGamerPos.j = j
//                 }
//             }
//             else if (j - gGamerPos.j === 2) {
//                 nextCell = gBoard[i][j]
//                 if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                 else if (nextCell.gameElement === TARGET && gBoard[i][j - 1].gameElement === BOX) {

//                     gBoard[i][j - 1].gameElement === GAMER
//                     renderCell({ i, j: j - 1 }, GAMER_IMG)

//                     nextCell.gameElement === BOX_COMPLETE
//                     renderCell({ i, j }, BOX_COMPLETE_IMG)

//                     gBoard[i][j - 1].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i
//                     gGamerPos.j = j - 1

//                     gBoxComplete++
//                 }
//                 else if (nextCell.gameElement === null && gBoard[i][j - 1].gameElement === BOX) {

//                     nextCell.gameElement = BOX
//                     renderCell({ i, j }, BOX_IMG)

//                     gBoard[i][j - 1].gameElement === GAMER
//                     renderCell({ i, j: j - 1 }, GAMER_IMG)

//                     gBoard[i][j - 1].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i
//                     gGamerPos.j = j - 1
//                 }
//             } else if (gGamerPos.j - j === 2) {
//                 nextCell = gBoard[i][j]
//                 if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                 else if (nextCell.gameElement === TARGET && gBoard[i][j + 1].gameElement === BOX) {

//                     gBoard[i][j - 1].gameElement === GAMER
//                     renderCell({ i, j: j + 1 }, GAMER_IMG)

//                     nextCell.gameElement === BOX_COMPLETE
//                     renderCell({ i, j }, BOX_COMPLETE_IMG)

//                     gBoard[i][j + 1].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i
//                     gGamerPos.j = j + 1

//                     gBoxComplete++
//                 }
//                 else if (nextCell.gameElement === null && gBoard[i][j + 1].gameElement === BOX) {

//                     nextCell.gameElement = BOX
//                     renderCell({ i, j }, BOX_IMG)

//                     gBoard[i][j - 1].gameElement === GAMER
//                     renderCell({ i, j: j + 1 }, GAMER_IMG)

//                     gBoard[i][j + 1].gameElement = GAMER
//                     renderCell(gGamerPos, '')
//                     gGamerPos.i = i
//                     gGamerPos.j = j + 1
//                 }
//             }
//         } else if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

//             var targetCell = gBoard[i][j]
//             if (targetCell.type === WALL) return
//             else if (targetCell.gameElement === TARGET) return
//             else if (targetCell.gameElement === BOX_COMPLETE) return

//             gBoard[gGamerPos.i][gGamerPos.j].type = FLOOR

//             if (targetCell.gameElement === BOX) {
//                 targetCell.gameElement === GAMER

//                 if (i - gGamerPos.i === 1) {
//                     nextCell = gBoard[i + 1][j]
//                     if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                     else if (nextCell.gameElement === TARGET) {
//                         nextCell.gameElement === BOX_COMPLETE
//                         renderCell({ i: i + 1, j }, BOX_COMPLETE_IMG)
//                         gBoxComplete++
//                     }
//                     else {
//                         nextCell.gameElement = BOX
//                         renderCell({ i: i + 1, j }, BOX_IMG)
//                     }
//                 } else if (gGamerPos.i - i === 1) {
//                     nextCell = gBoard[i - 1][j]
//                     if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                     else if (nextCell.gameElement === TARGET) {
//                         nextCell.gameElement === BOX_COMPLETE
//                         renderCell({ i: i - 1, j }, BOX_COMPLETE_IMG)
//                         gBoxComplete++
//                     }
//                     else {
//                         nextCell.gameElement = BOX
//                         renderCell({ i: i - 1, j }, BOX_IMG)
//                     }
//                 } else if (j - gGamerPos.j === 1) {
//                     nextCell = gBoard[i][j + 1]
//                     if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                     else if (nextCell.gameElement === TARGET) {
//                         nextCell.gameElement === BOX_COMPLETE
//                         renderCell({ i, j: j + 1 }, BOX_COMPLETE_IMG)
//                         gBoxComplete++
//                     }
//                     else {
//                         nextCell.gameElement = BOX
//                         renderCell({ i, j: j + 1 }, BOX_IMG)
//                     }
//                 } else if (gGamerPos.j - j === 1) {
//                     nextCell = gBoard[i][j - 1]
//                     if (nextCell.type === WALL || nextCell.gameElement === BOX) return
//                     else if (nextCell.gameElement === TARGET) {
//                         nextCell.gameElement === BOX_COMPLETE
//                         renderCell({ i, j: j - 1 }, BOX_COMPLETE_IMG)
//                         gBoxComplete++
//                     }
//                     else {
//                         nextCell.gameElement = BOX
//                         renderCell({ i, j: j - 1 }, BOX_IMG)
//                     }
//                 }

//             }
//             renderCell(gGamerPos, '')

//             gGamerPos.i = i
//             gGamerPos.j = j
//             gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
//             renderCell(gGamerPos, GAMER_IMG)
//         }
//     }
//     document.querySelector('span').innerText = userScore
//     if (checkIfVictory()) gameOver()
// }
