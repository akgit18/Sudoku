const rules = [rowcolumn, boxrule]; //active rules
//var ruleViols = [rowcolumnboxViols] //violation counters

//solves a 2-d Sudoku array (backtracking method)
function backtracking() {
  let board = getBoard();
  if (!isLegalAll(board)) {
    throw new Error("Inputted board not valid.");
  }
  const sq = nextEmptySpace(board);
  if (sq) {
    let solved = solveHelper(board, sq[0], sq[1]);
    if (solved) {
      return solved;
    } else {
      throw new Error("Unsolvable board.");
    }
  }
}

//recursive helper for backtracking
let permaBoard;
function solveHelper(prevBoard, i, j) {
  let solved = false;
  for (let guess = 1; guess < (_size**2 + 1); ++guess) {
    prevBoard[i][j] = guess;
    if (isLegalSpace(prevBoard, i, j)) {
      const sq = nextEmptySpace(prevBoard);
      if (sq) {
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
  prevBoard[i][j] = -1;
  return false;
}

//puts board into array format
function getBoard() {
  var table = document.getElementById('board');
  var board = [];
  for (let i = 0; i < (_size ** 2); i++) {
    let tr = table.rows[i];
    let boardrow = [];
    for (let j = 0; j < (_size ** 2); j++) {
      let cell = tr.cells[j].children[0].value;
      if (cell > 0) {
        boardrow.push(Number(cell));
      } else {
        boardrow.push(-1);
      }
    }
    board.push(boardrow);
  }
  return board;
}

//is the whole board legal?
function isLegalAll(board, sqList = null) {
  if (!sqList) {
    for (let i = 0; i < (_size * _size); i++) {
      for (let j = 0; j < (_size * _size); j++) {
        if (!isLegalSpace(board, i, j)) {
          return false;
        }
      }
    }
  } else {
    for (const sq of sqList) {
      if (!isLegalSpace(board, sq[0], sq[1])) {
        return false;
      }
    }
  }
  return true;
}

//is the number on i, j legal?
function isLegalSpace(board, i, j) {
  let val = board[i][j];
  if (val > _size**2) {
    throw new Error(`Value ${val} on row ${i+1}, column ${j+1} too large.`)
  }
  if (val > 0) {
    /*for (k = 0; k < (_size * _size); k++) {
      if (((val == board[k][j]) && k != i) || ((val == board[i][k])) && k != j) {
        return false;
      }
    }
    let iFloor = Math.floor(i/_size) * _size;
    let jFloor = Math.floor(j/_size) * _size;
    for (m = 0; m < _size; m++) {
      for (n = 0; n < _size; n++) {
        if ((m + iFloor != i) || (n + jFloor != j)) {
          if (board[m + iFloor][n + jFloor] == board[i][j]) {
            return false;
          }
        }
      }
    }*/
    for (const r of rules) {
      if (!r(board, i, j, val)) {
        return false;
      }
    }
  }
  return true;
}

//basic rules
function rowcolumn(board, i, j, val) {
  for (let k = 0; k < (_size * _size); k++) {
    if (((val == board[k][j]) && k != i) || ((val == board[i][k])) && k != j) {
      return false;
    }
  }
  return true;
}

function boxrule(board, i, j, val) {
  let iFloor = Math.floor(i/_size) * _size;
  let jFloor = Math.floor(j/_size) * _size;
  for (let m = 0; m < _size; m++) {
    for (let n = 0; n < _size; n++) {
      if ((m + iFloor != i) || (n + jFloor != j)) {
        if (board[m + iFloor][n + jFloor] == board[i][j]) {
          return false;
        }
      }
    }
  }
  return true;
}

//additional rules
function knightsmove(board, i, j, val) {
  let dx = [-2, -2, -1, -1, 1, 1, 2, 2];
  let dy = [-1, 1, -2, 2, -2, 2, -1, 1];
  for (let k = 0; k < 8; k++) {
    let x = i + dx[k];
    let y = j + dy[k];
    if (0 <= x && x < _size**2 && 0 <= y && y < _size**2) {
      if (val == board[x][y]) {
        return false;
      }
    }
  }
  return true;
}

function kingsmove(board, i, j, val) {
  let dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  let dy = [-1, 0, 1, -1, 1, -1, 0, 1];
  for (let k = 0; k < 8; k++) {
    let x = i + dx[k];
    let y = j + dy[k];
    if (0 <= x && x < _size**2 && 0 <= y && y < _size**2) {
      if (val == board[x][y]) {
        return false;
      }
    }
  }
  return true;
}

function orthoplus(board, i, j, val) {
  let dx = [-1, 0, 0, 1];
  let dy = [0, -1, 1, 0];
  for (let k = 0; k < 4; k++) {
    let x = i + dx[k];
    let y = j + dy[k];
    if (0 <= x && x < _size**2 && 0 <= y && y < _size**2) {
      if ((val + 1 == board[x][y]) || (val - 1 == board[x][y])) {
        return false;
      }
    }
  }
  return true;
}

function toggleRule(label, checkbox) {
  let tog, val = checkbox.value;
  if (checkbox.checked) {
    label.className="col2";
    tog = (r) => {rules.push(r)};
  } else {
    label.className="lb1";
    tog = (r) => {rules.splice(rules.indexOf(r), 1)};
  }
  switch (val) {
    case "1":
      tog(knightsmove)
      break;
    case "2":
      tog(kingsmove)
      break;
    case "3":
      tog(orthoplus)
      break;
    default:
      alert("Uh-oh! Something broke!");
  }
}

//finds the next empty square, and returns its coordinates
//returns false if no such space exists
function nextEmptySpace(board) {
  for (let i = 0; i < (_size ** 2); i++) {
    for (let j = 0; j < (_size ** 2); j++) {
      if (board[i][j] < 1) {
        return [i, j];
      }
    }
  }
  return false;
}

//solves the board (table), then puts the board (array) into the HTML table
let solver = () => backtracking()
function sudokize() {
  try {
    //tic = Date.now();
    solver();
    //toc = Date.now() - tic;
    //console.log(`solve time: ${toc} ms`)
    putBoard()
  } catch(e) {
    alert(e);
    console.log(e);
  }
}

function putBoard(board = permaBoard) {
  for (let i = 0; i < (_size ** 2); i++) {
    let tr = table.rows[i];
    for (let j = 0; j < (_size ** 2); j++) {
      let cell = tr.cells[j].children[0];
      cell.value = board[i][j];
    }
  }
}

function useSolver(s) {
  switch (s) {
    case "backtracking": solver = backtracking;
    break;
    case "localSearch": solver = localSearch;
    break;
    case "DLX":;
    break;
    default: alert(`${s} is not a supported solving method!`)
  }
}

//solves a 2-d Sudoku array (local search method)
function solve2() {
  setTimeout(() => localSearch(), 10000);
}
//not guaranteed to work
function localSearch() {
  //error checking
  let board = getBoard();
  if (!isLegalAll(board)) {
    throw new Error("Inputted board not valid.");
  }
  //let oBoard = getBoard();
  //let numVboard = [];
  // setTimeout(function(){
  //   if (confirm("It has been 10 seconds since starting. Local search may be unable to solve this. Would you like to abort?")) {
  //     throw new Error("Solve aborted.");
  //   } else {
  //     alert("There is no guarantee that this method will solve. It may run forever.")
  //   }
  // }, 10000);
  //randomly fill board
  let sq;
  let newSqList = [];
  while (sq = nextEmptySpace(board)) {
    board[sq[0]][sq[1]] = minViolatingOption(board, sq[0], sq[1]);
    newSqList.push(sq);
  }
  //find random violating square
  let numViols;
  let maxNumIts = 1000*(2**_size);
  for (let numIts = 0; numIts < maxNumIts; numIts++) {
    numViols = 0;
    putBoard(board)
    let rsq = newSqList[Math.floor(Math.random() * newSqList.length)];
    if (numViols = numViolationsSpace(board, rsq[0], rsq[1])){
      board[rsq[0]][rsq[1]] = minViolatingOption(board, rsq[0], rsq[1]);
    }
    if(isLegalAll(board, newSqList)) {
      permaBoard = board;
      return;
    }
  }
  throw new Error(`${maxNumIts} iterations exceeded without finding a solution.`);
}

//number of rules violated by a particular space
function numViolationsSpace(board, i, j, val = board[i][j]) {
  if (val > _size**2) {
    throw new Error(`Value ${val} on row ${i+1}, column ${j+1} too large.`)
  }
  let viols = 0;
  if (val > 0) {
    for (const sq of defaultMap.get(100*i + j)) {
      if (val == board[sq[0]][sq[1]]) {
        viols++;
      }
    }
  }
  return viols;
}

function minViolatingOption(board, i, j) {
  const maxval = _size**2;
  let bestNum = 1;
  let numViols = Infinity;
  for (let k = 1; k <= maxval; k++) {
    let val = numViolationsSpace(board, i, j, k);
    if (val < numViols) {
      numViols = val;
      bestNum = k;
    }
  }
  return bestNum;
}

//number of numViolations
/*
function rowcolumnViols(board, i, j, val) {
  let sum = 0;
  for (let k = 0; k < (_size * _size); k++) {
    if (((val == board[k][j]) && k != i) || (((val == board[i][k])) && k != j)) {
      sum++;
    }
  }
  return sum;
}

function boxruleViols(board, i, j, val) {
  let sum = 0;
  let iFloor = Math.floor(i/_size) * _size;
  let jFloor = Math.floor(j/_size) * _size;
  for (let m = 0; m < _size; m++) {
    for (let n = 0; n < _size; n++) {
      if ((m + iFloor != i) || (n + jFloor != j)) {
        if (board[m + iFloor][n + jFloor] == board[i][j]) {
          sum++;
        }
      }
    }
  }
  return sum;
}*/

//functions that return a list of possibly
//conflicting squares for a square at i, j
function boxSq(i, j) {
  let sqList = [];
  let iFloor = Math.floor(i/_size) * _size;
  let jFloor = Math.floor(j/_size) * _size;
  for (let m = 0; m < _size; m++) {
    for (let n = 0; n < _size; n++) {
      if ((m + iFloor != i) || (n + jFloor != j)) {
        sqList.push([m + iFloor, n + jFloor])
      }
    }
  }
  return sqList;
}

function rowcolumnSq(i, j) {

  let sqList = [];
  for (let k = 0; k < (_size**2); k++) {
    if (k != i) {
      sqList.push([k, j])
    }
    if (k != j) {
      sqList.push([i, k])
    }
  }
  return sqList;
}

//organizes the square lists into a set
function setify(i, j) {
  let l1 = boxSq(i, j);
  let l2 = rowcolumnSq(i, j);
  return new Set(l1.concat(l2));
}
