import type {MessageFromWorker, MessageToWorker, RuleValue, TypedUintArray} from "../common/common";
import {pointToIndex, MessageTypes, minSizeArray} from "../common/common";

if (!self.Worker) {
  throw new Error("Browser does not support web workers. Please use a more modern browser.");
}
const workerUrl = new URL("../solver/solver.min.js", import.meta.url);
const worker = new Worker(workerUrl);

let boxSizeGlobal = 3;
const inpStringC1 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col1'>";
const inpStringC2 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col2'>";
const table = document.getElementById("board") as HTMLTableElement;
// const defaultMap = new Map();
//const t = document.getElementById("Theme");
//let theme = t.options[t.selectedIndex].value;
function getInputElement(oddInputStyle: boolean) {
  if (oddInputStyle) {
    return inpStringC1;
  } else {
    return inpStringC2;
  }
}

function createBoard() {
  let oddInputStyle = false;
  for (let i = 0; i < boxSizeGlobal**2; i++) {
    let row = table.insertRow(i);
    if (i%boxSizeGlobal == 0) {
      oddInputStyle = !oddInputStyle;
    }
    for (let j = 0; j < boxSizeGlobal**2; j++) {
      if ((j > 0 || boxSizeGlobal%2 == 0) && j%boxSizeGlobal == 0) {
        oddInputStyle = !oddInputStyle;
      }
      let cell = row.insertCell(j);
      cell.innerHTML = getInputElement(oddInputStyle);
    }
  }
}

function boardClear() {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    createBoard();
  }
}

/*
function reTheme(theme) {
  theme = t.options[t.selectedIndex].value;
  document.getElementById("themesheet").href = theme;
}*/

function reSize(selector: HTMLSelectElement, val: string) {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    boxSizeGlobal = parseInt(val, 10);
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    createBoard();
  } else {
    selector.value = boxSizeGlobal.toString(10);
  }
}

// const worker = new Worker('../solver/solver.js')
function getBoardAsArrayBuffer(boxSize: number): ArrayBuffer {
  const arrayConstructor = minSizeArray(boxSize, confirm);
  const edgeSize = boxSize ** 2;
  const table = document.getElementById('board') as HTMLTableElement;
  const bufferSize = arrayConstructor.BYTES_PER_ELEMENT * (edgeSize ** 2);
  const buffer = new ArrayBuffer(bufferSize);
  const view: TypedUintArray = new arrayConstructor(buffer, 0, edgeSize ** 2);
  for (let i = 0; i < edgeSize; i++) {
    const tr = table.rows[i];
    for (let j = 0; j < edgeSize; j++) {
      const cell = tr.cells[j].children[0] as HTMLInputElement;
      const val = parseInt(cell.value, 10);
      const index = pointToIndex(i, j, edgeSize)
      if (val > 0) {
        view[index] = val;
      } else {
        view[index] = -1;
      }
    }
  }
  return buffer;
}

function putBoard(board: ArrayBuffer, edgeSize: number) {
  const boxSize = Math.sqrt(edgeSize);
  const arrayConstructor = minSizeArray(boxSize, () => true);
  const bufferSize = arrayConstructor.BYTES_PER_ELEMENT * (edgeSize ** 2);
  const boardView = new arrayConstructor(board, 0, edgeSize ** 2);
  for (let i = 0; i < edgeSize; ++i) {
    let tr = table.rows[i];
    for (let j = 0; j < edgeSize; ++j) {
      let cell = tr.cells[j].children[0] as HTMLInputElement;
      const boardIndex = pointToIndex(i, j, edgeSize);
      cell.value = boardView[boardIndex]?.toString() ?? '';
    }
  }
}

// function generateBoard() {
//   const starterboard = [];
//   const row = [];
//   for (let j = 0; j < _size**2; j++) {
//     row.push(-1);
//   }
//   for (let i = 0; i < _size**2; i++) {
//     starterboard.push(row);
//   }
//   let rand = Math.floor(Math.random() * 9);
// }

// function shuffleRowBlocks(params) {
  
// }

function changeSolver(value: string) {
  const message: MessageToWorker = {type: MessageTypes.SetSolverMethod, data: value}
  worker.postMessage(message);
}

function toggleRule(label: HTMLLabelElement, checkbox: HTMLInputElement) {
  const val = checkbox.value as RuleValue;
  if (checkbox.checked) {
    label.className="col2";
  } else {
    label.className="lb1";
  }
  const message: MessageToWorker = {type: MessageTypes.ToggleRule, data: val}
  worker.postMessage(message)
}

function solveBoard() {
  const board = getBoardAsArrayBuffer(boxSizeGlobal);
  const message: MessageToWorker = {type: MessageTypes.SolveBoard, data: {boxSize: boxSizeGlobal, board: board}}
  worker.postMessage(message, [board])
}

// setup board + onclick/onchange functions
document.body.onload = () => {
  createBoard();
  (document.getElementById('cboard') as HTMLButtonElement).onclick = () => boardClear();
  (document.getElementById('sboard') as HTMLButtonElement).onclick = () => solveBoard();

  worker.onmessage = (ev: MessageEvent<MessageFromWorker>) => {
    const data = ev.data;
    switch (data.type) {
      case MessageTypes.ShowBoard:
        const {edgeSize, board, solveMs} = data.data
        putBoard(board, edgeSize);
        // TODO: display somewhere?
        console.log(`Solved in ${solveMs} milliseconds.`);
        break;
      case MessageTypes.SolveError:
        const error: unknown = data.data;
        if (error instanceof Error || typeof error === "string") {
          alert(error);
        }
        console.error(error);
        break;
      default:
        console.error(`Unsupported message from worker to main thread:`, data)
        break;
    }
  }

  const sz = document.getElementById('Size') as HTMLSelectElement;
  sz.onchange = () => reSize(sz, sz.value);
  const solver = document.getElementById('Solver') as HTMLSelectElement;
  solver.onchange = () => changeSolver(solver.value);
  for (const toggleable of (document.getElementsByClassName('lb1') as HTMLCollectionOf<HTMLLabelElement>)) {
    toggleable.onchange = () => toggleRule(toggleable, toggleable.children[0] as HTMLInputElement);
  }
}
