//Global Variables
let board = [];
let foundWinner = false
let heightLimit = 6
let defaultRowLimit = 7
let winCondition = 4
let twoPlayer = false
let rowWinCoords = []
let forwardSlashWinCoords = []
let backwardSlashWinCoords = []
let columnWinCoords = []
let potentialCompWinCoords = []
let potentialPlayerWinCoords = []

//Board 2darray creation
function makeBoard(columns) {
  for (let i = 0; i < columns; i++) {
    board.push([])
  }
}

//creates a div and appends to the board div
function createCell(xCoord, yCoord) {
  let htmlBoard = $('.board')
  let cell = $('<div>').addClass('cell').attr('id', `${xCoord}-${yCoord}`)
  htmlBoard.append(cell)
}

/*cells have an id of their location 
in the 2d array that translates to html*/
function getCell(xCoord, yCoord) {
  return $(`#${xCoord}-${yCoord}`)
}

//deletes current buttons and creates the buttons for play
function drawColumnButtons(rows) {
  const controlPanel = $('.controls').css({
    'width': 77 * rows
  })
  const controlButton = $('.controls button')
  for (let x = 0; x < controlButton.length; x++){
    controlButton.remove()
  }
  for(let x = 1; x <= rows; x++) {
    const button = $('<button>').addClass('column-button').attr('id', x)
    controlPanel.append(button)
  }
}

//removes the old gameboard and draws a new gameboard
function drawBoard(board, height) {
  heightLimit = height
  let htmlBoard = $('.board')
  let boardCells = $('.board .cell')
    for (let x = 0; x < boardCells.length; x++) {
        boardCells.remove()
    }
  htmlBoard.css({
    'display': 'grid',
    'grid-template-columns': `repeat(${board.length}, 1fr)`,
    'grid-template-rows': `repeat(${heightLimit}, 1fr)`,
    'height': `${heightLimit * 75 + (2 * heightLimit)}`,
    'width': `${board.length * 75 + (2 * heightLimit)}`,
  })
  for (let column = 0; column < heightLimit; column++) {
    for (let row = 0; row < board.length; row++){
      createCell(row, column)
      if (board[row][column] === 1) {
        getCell(row, column).css('background-color', 'red')
      } else if (board[row][column] === 2) {
        getCell(row, column).css('background-color', 'yellow')
      }
    }
  }
}

/*creates an array from the current board 
that contains the indexs of columns 
that aren't filled*/
function grabNonFilledColumns(board) {
  let nonFilledColumns = []
  board.forEach((value, index) => {
    if (value.length < heightLimit)
      nonFilledColumns.push(index)
  })
  return nonFilledColumns
}

//Places a chip on the board redraws the board also checks for a winner
function placeChip(player, column) {
  if (!board[column])
    return
  if (board[column].length >= heightLimit) {
    return console.log("Sorry this column is full")
  }
  if (!foundWinner) {
    resetWinnersArrays()
    let index = board[column].push(player)
    drawBoard(board, heightLimit)
    checkWinner(player, column, index, board)
    if(playerOneGo && player === 1){
      playerOneGo = false
    }
  } else {
    return console.log("WE ALREADY FOUND A WINNER STOP PLAYING")
  }
}

//Draws the winner in a cool fashion
function drawWinner(board, player) {
  let winningCoords;
  if (backwardSlashWinCoords.length === winCondition)
    winningCoords = backwardSlashWinCoords
  else if (rowWinCoords.length === winCondition)
    winningCoords = rowWinCoords
  else if (forwardSlashWinCoords.length === winCondition)
    winningCoords = forwardSlashWinCoords
  else if (columnWinCoords.length === winCondition)
    winningCoords = columnWinCoords

  for (let column = 0; column < heightLimit; column++) {
    for (let row = 0; row < board.length; row++){
      if (board[row][column] === 1) {
        getCell(row, column).css('background-color', 'grey')
      } else if (board[row][column] === 2) {
        getCell(row, column).css('background-color', 'grey')
      }
    }
  }
  for (let x = 0; x < winningCoords.length; x++) {
    let winningPair = winningCoords[x]
    if (player === 1)
      getCell(winningPair[0], winningPair[1]).css('background-color', 'red')
    else if (player === 2)
      getCell(winningPair[0], winningPair[1]).css('background-color', 'yellow')
  }
  const firstPlayer = $('#player-one').val()
  const secondPlayer = $('#player-two').val()
  if (player === 1) {
    if(firstPlayer)
      $('h2').text(`${firstPlayer} has won!`)
    else 
      $('h2').text(`You have won!`)
  } else if (player === 2) {
    if (twoPlayer)
      $('h2').text(`${secondPlayer} has won!`)
    else
      $('h2').text(`Computer has won!`)
  }
}

//checks if there is a tie on the board
function checkTie(board) {
  let boardFilled = false
  let occurances = 0
  board.forEach((value) => {
    value.length >= heightLimit ? occurances += 1 : occurances = 0
  })
  if (occurances === board.length) {
    boardFilled = true
  }
  return boardFilled
}

//checks for a winner or a tie using our 4 functions
function checkWinner(player, column, height, board) {
  let winner = "Congratulations player:" + player + " won!!"
  if ( checkAbove(player, column, height, board) 
    || checkRow(player, height, board) 
    || checkBackSlashDiagonal(player, column, height, board) 
    || checkForwardSlashDiagonal(player, column, height, board)) {
      drawWinner(board, player)
      return console.log(winner)
  } else if (checkTie(board)) {
    return $('h2').text(`It's a tie!`)
  }
}

//starts from the bottom of a column and counts how many chips in a row matched.
function checkAbove(player, column, height, board) {
  let matchingChips = 0
  let winner = false
  for (let index = 0; index < height; index++) {
    let currentChip = board[column][index]
    if (currentChip === player) {
      matchingChips++
      columnWinCoords.push([column, index])
    } else {

      //TODO: HARDER AI
      if(player === 2) {
        setCompsPossibleWin(column, index, matchingChips, "column")
      } else {
        setPlayersPossibleWin(column, index, matchingChips, "column")
      }

      matchingChips = 0
      columnWinCoords = []
    }
    if (matchingChips >= winCondition) {
      winner = true
      foundWinner = true
      return winner
    }
  }
  return winner
}

//checks in a backward slash counting the chips along that diagonal
function checkBackSlashDiagonal(player, column, height, board) {
  let matchingChips = 0
  height = height - 1
  for (let stackHeight = 0; stackHeight < heightLimit; stackHeight++) {
    let grabNextChip = column + height - stackHeight
    if (0 <= grabNextChip && grabNextChip < board.length) {
      let currentChip = board[grabNextChip][stackHeight]
      if (currentChip === player) {
        matchingChips++
        backwardSlashWinCoords.push([grabNextChip, stackHeight])
      } else {

        //TODO: HARDER AI
        if(player === 2) {
          setCompsPossibleWin(grabNextChip, stackHeight, matchingChips, "BSD")
        } else {
          setPlayersPossibleWin(grabNextChip, stackHeight, matchingChips, "BSD")
        }

        matchingChips = 0
        backwardSlashWinCoords = []
      }
      if (matchingChips >= winCondition) {
        winner = true
        foundWinner = true
        return winner
      }
    }
  }
  return false
}

function checkForwardSlashDiagonal(player, column, height, board) {
  let matchingChips = 0
  height = height - 1
  let length = (board.length - 1)
  for (let stackHeight = 0; stackHeight < heightLimit; stackHeight++) {
    let grabNextChip = column - height + stackHeight
    if (0 <= grabNextChip && grabNextChip <= length) {
      let currentChip = board[grabNextChip][stackHeight]
      if (currentChip === player) {
        matchingChips++
        forwardSlashWinCoords.push([grabNextChip, stackHeight])
      } else {

        //TODO: HARDER AI
        if(player === 2) {
          setCompsPossibleWin(grabNextChip, stackHeight, matchingChips, "FSD")
        } else {
          setPlayersPossibleWin(grabNextChip, stackHeight, matchingChips, "FSD")
        }

        matchingChips = 0
        forwardSlashWinCoords = []
      }
      if (matchingChips >= winCondition) {
        winner = true
        foundWinner = true
        return winner
      }
    }
  }
  return false
}

function checkRow(player, height, board) {
  const length = board.length
  let matchingChips = 0
  let winner = false
  height = height - 1
  for (let index = 0; index < length; index++) {
    let chipInRow = board[index][height]
    if (chipInRow === player) {
      matchingChips++
      rowWinCoords.push([index, height])
    } else {

      //TODO: HARDER AI WIP
      if(player === 2) {
        setCompsPossibleWin(index, height, matchingChips, "row")
      } else {
        setPlayersPossibleWin(index, height, matchingChips, "row")
      }

      matchingChips = 0
      rowWinCoords = []
    }
    if (matchingChips >= winCondition) {
      winner = true
      foundWinner = true
      return winner
    }
  }
  return winner
}


/*
Everything for Computer placement so far...
*/
function computerPlacesChip(board, difficulty) {
  if (foundWinner)
    return
  const nonFilledColumns = grabNonFilledColumns(board)
  let length = nonFilledColumns.length
  let random = Math.floor(Math.random() * length)
  if (difficulty === "easy") {
    if(findBestMove(getCompsPossibleWin(), getPlayersPossibleWin()) === -1)
      placeChip(2, nonFilledColumns[random])
    else
      placeChip(2, findBestMove(getCompsPossibleWin(), getPlayersPossibleWin()))
    clearCompsWinCoords()
    clearPlayerWinCoords()
  }
}

//global to resetTimeOuts for AI
let computerWaiting;
function computerThinking(board, difficulty, time) {
  computerWaiting = setTimeout(() =>  {
    computerPlacesChip(board, difficulty) 
    playerOneGo = true
  }
  , time)
}

function setCompsPossibleWin(row, column, currentInLine, typeOfWin) {
  if(!twoPlayer)
    potentialCompWinCoords.push([row, column, currentInLine, typeOfWin])
}

function getCompsPossibleWin() {
  return potentialCompWinCoords
}

function clearCompsWinCoords() {
  potentialCompWinCoords = []
}

function setPlayersPossibleWin(row, column, currentInLine, typeOfWin) {
  if (!twoPlayer)
    potentialPlayerWinCoords.push([row, column, currentInLine, typeOfWin])
}

function getPlayersPossibleWin() {
  return potentialPlayerWinCoords
}

function clearPlayerWinCoords() {
  potentialPlayerWinCoords = []
}

//TODO: This currently is broken but will still do a random drop and stop a row from left to right :p
function findBestMove(compsCoords, playersCoords) {
  let compTempHighest = 0
  let columnOfCompsHighest = 0
  let playerTempHighest = 0
  let columnOfPlayersHighest = 0
  const compsBestCoords = []
  const playersBestCoords = []
  compsCoords.forEach((value) => {
    if(value[2] > compTempHighest) {
      compTempHighest = value[2]
      columnOfCompsHighest = value[0]
      compsBestCoords.push([value[0], value[2], value[3]])
    }
  })
  playersCoords.forEach((value) => {
    if(value[2] > playerTempHighest) {
      playerTempHighest = value[2]
      columnOfPlayersHighest = value[0]
      playersBestCoords.push([value[0], value[2], value[3]])
    }
  })
  let compRandom = Math.floor(Math.random() * compsBestCoords.length)
  if(playerTempHighest === winCondition - 1) {
    return columnOfPlayersHighest
  } else if(compTempHighest > 2) {
    return compsBestCoords[compRandom][1]
  } else {
    return -1
  }
}

/*
Stuff reading from HTML buttons ect.
*/

function setSinglePlayer() {
  twoPlayer = false
  resetGameBoard()
  $('#player-two').css('display', 'none')
}
function setMultiPlayer() {
  twoPlayer = true
  resetGameBoard()
  clearTimeout(computerWaiting)
  $('#player-two').css('display', 'inline')
}
function resetGameBoard() {
  clearTimeout(computerWaiting)
  board = []
  resetWinnersArrays()
  playerOneGo = true
  foundWinner = false
  makeBoard(defaultRowLimit)
  drawBoard(board, heightLimit)
  $('h2').text('')
  whoGoesFirst(board, 'easy')
}

function resetWinnersArrays() {
  rowWinCoords = []
  forwardSlashWinCoords = []
  backwardSlashWinCoords = []
  columnWinCoords = []
}

function setNames() {
  const firstPlayer = $('#player-one').val()
  const secondPlayer = $('#player-two').val()
  if (twoPlayer) {
    $('h2').text(`${firstPlayer} VS ${secondPlayer}`)
  } else {
    $('h2').text(`${firstPlayer} VS Computer`)
  }
}

function grabDesiredGrid() {
  const rows = $('#width').val() * 1
  const height = $('#height').val() * 1
  if (rows && height) {
    customBoard(rows, height)
    heightLimit = height
    defaultRowLimit = rows
    resetGameBoard()
  }
}

function customBoard(row, height) {
  board = []
  makeBoard(row)
  drawBoard(board, height)
  drawColumnButtons(row)
  clickAbleButtons()
}

function setWinCondition() {
  const numOfChipsToWin = $('#win-condition').val()
  if (numOfChipsToWin) {
    winCondition = numOfChipsToWin * 1
    $('h1').text('Connect ' + winCondition)
    resetGameBoard()
  }
}

function whoGoesFirst(board, difficulty){
  let chance = Math.floor(Math.random() * 2)
  const firstPlayer = $('#player-one').val()
  const secondPlayer = $('#player-two').val()
  if(twoPlayer) {
    if (chance === 1) {
      playerOneGo = false
      if(secondPlayer) {
        alert(secondPlayer + " goes first")
      } else {
        alert("Player Two goes first")
      }
    }
  } else {
    if (chance === 1) {
      playerOneGo = false
      alert("Computer goes first")
      computerThinking(board, difficulty, 3000)
    }
  }
  if(firstPlayer && playerOneGo) {
    alert(firstPlayer + " goes first")
  } else if (playerOneGo) {
    alert("Player One goes first")
  }
}

function clickAbleButtons() {
  $('.column-button').click(function (){
    let column = ($(this).attr('id')) - 1
    if (playerOneGo) {
      placeChip(1, column)
      findBestMove(getCompsPossibleWin(), getPlayersPossibleWin())
      if (!twoPlayer && !playerOneGo) {
        computerThinking(board, 'easy', 1000)
      }
    } else if (twoPlayer) {
      placeChip(2, column)
      playerOneGo = true
    }
  })
}

let playerOneGo = true
makeBoard(defaultRowLimit)
drawBoard(board, heightLimit)
drawColumnButtons(defaultRowLimit)
whoGoesFirst(board, 'easy')
clickAbleButtons()

$('.set-grid').click(grabDesiredGrid)
$('.set-condition').click(setWinCondition)
$('.reset').click(resetGameBoard)

$('.set-names').click(setNames)

$('input[type=radio]').click(function () {
  let id = $(this).attr('id')
  if (id === 'singleplayer') {
      setSinglePlayer()
  } else if (id === 'multiplayer') {
      setMultiPlayer()
  }
})



