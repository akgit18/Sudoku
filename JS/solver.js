//solves a 2-d Sudoku array (backtracking method)
function solve1() {
  let board = getBoard();
  if (!isLegalAll(board)) {
    throw new Error("Inputted board not valid.");
  }
  if (sq = nextEmptySpace(board)) {
    solved = solveHelper(board, sq[0], sq[1]);
    if (solved) {
      return solved;
    } else {
      throw new Error("Unsolvable board.");
    }
  }
}

//recursive helper for solve1
var permaBoard;
function solveHelper(prevBoard, i, j) {
  let solved = false;
  for (let guess = 1; guess < (_size**2 + 1); guess++) {
    prevBoard[i][j] = guess;
    if (isLegalSpace(prevBoard, i, j)) {
      if (sq = nextEmptySpace(prevBoard)) {
        solved = solveHelper(prevBoard, sq[0], sq[1]);
        if (solved) {
          return true;
        }
      } else {
        permaBoard = prevBoard;
        return true;
      }
    }
  }
  prevBoard[i][j] = 0;
  return false;
}

//puts board into array format
function getBoard() {
  var table = document.getElementById('board');
  var board = [];
  for (i = 0; i < (_size ** 2); i++) {
    let tr = table.rows[i];
    let boardrow = [];
    for (j = 0; j < (_size ** 2); j++) {
      let cell = tr.cells[j].children[0].value;
      if (cell > 0) {
        boardrow.push(Number(cell));
      } else {
        boardrow.push(0);
      }
    }
    board.push(boardrow);
  }
  return board;
}

//is the whole board legal?
function isLegalAll(board) {
  for (i = 0; i < (_size * _size); i++) {
    for (j = 0; j < (_size * _size); j++) {
      if (!isLegalSpace(board, i, j)) {
        return false;
      }
    }
  }
  return true;
}

//is the number on i, j legal?
function isLegalSpace(board, i, j) {
  let val = board[i][j];
  if (val > 0) {
    for (k = 0; k < (_size * _size); k++) {
      if (((val == board[k][j]) && k != i) || ((val == board[i][k])) && k != j) {
        return false;
      }
    }
    iFloor = Math.floor(i/_size) * _size;
    jFloor = Math.floor(j/_size) * _size;
    for (m = 0; m < _size; m++) {
      for (n = 0; n < _size; n++) {
        if ((m + iFloor != i) || (n + jFloor != j)) {
          if (board[m + iFloor][n + jFloor] == board[i][j]) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

//finds the next empty square, and returns its coordinates
//returns false if no such space exists
function nextEmptySpace(board) {
  for (i = 0; i < (_size ** 2); i++) {
    for (j = 0; j < (_size ** 2); j++) {
      if (!board[i][j]) {
        return [i, j];
      }
    }
  }
  return false;
}

//solves the board (table), then puts the board (array) into the HTML table
function sudokize() {
  let solved;
  try {
    solve1();
    var table = document.getElementById('board');
    for (i = 0; i < (_size ** 2); i++) {
      let tr = table.rows[i];
      for (j = 0; j < (_size ** 2); j++) {
        let cell = tr.cells[j].children[0];
        cell.value = permaBoard[i][j];
      }
    }
  } catch(e) {
    alert(e);
    console.log(e);
  }
}
