import type {MessageFromWorker, MessageToWorker, SolverValue, TypedUintArray} from "../common/common";
import {MessageTypes, minSizeArray} from "../common/common";

if (!self.Worker) {
  throw new Error("Browser does not support web workers. Please use a more modern browser.");
}
const workerUrl = new URL("../solver/solver.min.mjs", import.meta.url);
const worker = new Worker(workerUrl, {type: "module"});

let boxSizeGlobal = 3;
const boardElement = document.getElementById("board") as HTMLDivElement;

function setInputElementAttributes(cell: HTMLInputElement, oddInputStyle: boolean, cellSize: number): void {
  // closure compiler doesn't know about inputMode, I guess
  cell["inputMode"] = "numeric";
  cell.size = cellSize;
  cell.maxLength = cellSize;
  cell.autocomplete = "off";
  if (oddInputStyle) {
    cell.classList.add("col1");
  } else {
    cell.classList.add("col2");
  }
}

function createBoard() {
  let oddInputStyle = false;
  boardElement.style.setProperty('--edgeSize', (boxSizeGlobal**2).toString(10));
  const cells: HTMLInputElement[] = [];
  for (let i = 0; i < boxSizeGlobal**2; i++) {
    if (i%boxSizeGlobal == 0) {
      oddInputStyle = !oddInputStyle;
    }
    for (let j = 0; j < boxSizeGlobal**2; j++) {
      if ((j > 0 || boxSizeGlobal%2 == 0) && j%boxSizeGlobal == 0) {
        oddInputStyle = !oddInputStyle;
      }
      const cell = document.createElement('input');
      const cellSize = Math.ceil(Math.log10((boxSizeGlobal ** 2) + 1));
      setInputElementAttributes(cell, oddInputStyle, cellSize);
      cells.push(cell);
    }
  }
  boardElement.replaceChildren(...cells);
}

function boardClear() {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
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
    createBoard();
  } else {
    selector.value = boxSizeGlobal.toString(10);
  }
}

// const worker = new Worker('../solver/solver.js')
function getBoardAsArrayBuffer(boxSize: number): ArrayBuffer {
  const arrayConstructor = minSizeArray(boxSize, confirm);
  const edgeSize = boxSize ** 2;
  const boardElement = document.getElementById('board') as HTMLDivElement;
  const bufferSize = arrayConstructor.BYTES_PER_ELEMENT * (edgeSize ** 2);
  const buffer = new ArrayBuffer(bufferSize);
  const view: TypedUintArray = new arrayConstructor(buffer, 0, edgeSize ** 2);
  for (let i = 0; i < edgeSize ** 2; ++i) {
    const cell = boardElement.children[i] as HTMLInputElement;
    const val = parseInt(cell.value, 10);
    if (val > 0) {
      view[i] = val;
    } else {
      view[i] = -1;
    }
  }
  return buffer;
}

function putBoard(board: ArrayBuffer, edgeSize: number) {
  const boxSize = Math.sqrt(edgeSize);
  const arrayConstructor = minSizeArray(boxSize, () => true);
  const bufferSize = arrayConstructor.BYTES_PER_ELEMENT * (edgeSize ** 2);
  const boardView = new arrayConstructor(board, 0, edgeSize ** 2);
  for (let i = 0; i < edgeSize ** 2; ++i) {
    const cell = boardElement.children[i] as HTMLInputElement;
    cell.value = boardView[i]?.toString() ?? '';
  }
}

function getRulesAsBits(): number {
  const ruleInputs = document.getElementsByClassName('lcb') as HTMLCollectionOf<HTMLInputElement>;
  let ruleFlags = 0b11; // RowColumn & Box
  for (const rule of ruleInputs) {
    if (rule.checked) {
      const shiftDist = parseInt(rule.value, 10);
      ruleFlags |= 1 << shiftDist;
    }
  }
  return ruleFlags;
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

function toggleRule(label: HTMLLabelElement, checkbox: HTMLInputElement) {
  if (checkbox.checked) {
    label.className="col2";
  } else {
    label.className="lb1";
  }
}

function solveBoard() {
  const board = getBoardAsArrayBuffer(boxSizeGlobal);
  const rules = getRulesAsBits();
  const method = (document.getElementById('method') as HTMLSelectElement).value as SolverValue;
  const message: MessageToWorker = {type: MessageTypes.SolveBoard, data: {boxSize: boxSizeGlobal, board, rules, method}}
  worker.postMessage(message, [board])
}

export const onLoadPromise = new Promise((resolve) => document.body.onload = resolve);
// setup board + onclick/onchange functions
onLoadPromise.then(() => {
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
  worker.onerror = (event: ErrorEvent) => {
    console.error("worker error:", event);
  }
  worker.onmessageerror = (event: MessageEvent) => {
    console.error("message error for:", event);
  }

  const sz = document.getElementById('Size') as HTMLSelectElement;
  sz.onchange = () => reSize(sz, sz.value);
  const theme = document.getElementById('theme') as HTMLSelectElement;
  theme.onchange = () => document.documentElement.setAttribute('data-theme', theme.value)
  for (const toggleable of (document.getElementsByClassName('lb1') as HTMLCollectionOf<HTMLLabelElement>)) {
    toggleable.onchange = () => toggleRule(toggleable, toggleable.children[0] as HTMLInputElement);
  }
});