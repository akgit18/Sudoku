import type {MessageFromWorker, TypedUintArray} from "../common/common";
import {MessageTypes, MessageToWorker, minSizeArray} from "../common/common";
import { backtracking } from "./backtracking";
import { isLegalAll, nextEmptySpace } from "./legality";
import { localSearch } from "./localsearch";
import { toggleRule } from "./rules";

// TODO: abort controller to abort solves
// const aborter = new AbortController();

if (self instanceof WorkerGlobalScope) {
  self.onmessage = (e: MessageEvent<MessageToWorker>) => {
    try {
      const data = e.data;
      switch (data.type) {
        case MessageTypes.SetSolverMethod:
          const solverMethod = data.data
          useSolver(solverMethod);
          break;
        case MessageTypes.ToggleRule:
          toggleRule(data.data);
          break;
        case MessageTypes.SolveBoard:
          const {board, boxSize} = data.data;
          attemptSolve(board, boxSize);
          break;
        case MessageTypes.AbortSolve:
          break;
        default:
          sendError(new TypeError(`Unknown message type: ${JSON.stringify(data)}`));
          break;
      }
    } catch (e) {
      sendError(e);
    }
  }
}

function sendError(error: unknown) {
  console.error(error);
  const message: MessageFromWorker = {
    type: MessageTypes.SolveError,
    data: error,
  }
  self.postMessage(message);
}

function sendBoard(boardRef: Readonly<ArrayBuffer>, edgeSize: number, solveMs: number) {
  // TODO: send board every X iterations?
  // const copy = boardRef.slice();
  const message: MessageFromWorker = {
    type: MessageTypes.ShowBoard,
    data: {board: boardRef, edgeSize, solveMs},
  }
  self.postMessage(message, [boardRef]);
}

//solves the board (table), then puts the board (array) into the HTML table
let solver = (board: TypedUintArray, i: number, j: number, edgeSize: number) => backtracking(board, i, j, edgeSize)
function attemptSolve(board: ArrayBuffer, boxSize: number) {
  const edgeSize = boxSize ** 2;
  const arrayConstructor = minSizeArray(boxSize, () => true);
  const boardView = new arrayConstructor(board, 0, edgeSize ** 2);
  if (!isLegalAll(boardView, edgeSize)) {
    throw new Error("Inputted board not valid.");
  }
  const sq = nextEmptySpace(boardView, edgeSize);
  if (sq) {
    const tic = Date.now();
    let solved = solver(boardView, sq[0], sq[1], edgeSize);
    const toc = Date.now() - tic;
    if (!solved) {
      throw new Error("Unsolvable board.");
    } else {
      sendBoard(boardView.buffer, edgeSize, toc);
    }
  } else {
    console.log('Board already legally filled. Doing nothing.');
  }
}

function useSolver(s: string) {
  switch (s) {
    case "1":
    case "backtracking":
      solver = backtracking;
      break;
    case "2":
    case "localSearch":
      solver = localSearch;
      break;
    case "3":
    case "DLX":
      break;
    default:
      throw new Error(`${s} is not a supported solving method!`);
  }
}
