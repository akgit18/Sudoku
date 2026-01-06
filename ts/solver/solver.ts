import type {MessageFromWorker, SolverValue, TypedUintArray} from "../common/common";
import {MessageTypes, MessageToWorker, minSizeArray} from "../common/common";
import { backtracking } from "./backtracking";
import { isLegalAll, nextEmptySpace } from "./legality";
import { localSearch } from "./localsearch";
import { Rule, allRules } from "./rules";

// TODO: abort controller to abort solves
// const aborter = new AbortController();

if (self instanceof WorkerGlobalScope) {
  self.onmessage = (e: MessageEvent<MessageToWorker>) => {
    try {
      const data = e.data;
      switch (data.type) {
        case MessageTypes.SolveBoard:
          const {boxSize, board, rules, method} = data.data;
          attemptSolve(board, boxSize, rules, method);
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

type Solver = (board: TypedUintArray, i: number, j: number, edgeSize: number, rules: Rule[]) => boolean;

function attemptSolve(board: ArrayBuffer, boxSize: number, rules: number, method: SolverValue) {
  const solver = getSolver(method);
  const ruleFuncs = getActiveRules(rules);

  const edgeSize = boxSize ** 2;
  const arrayConstructor = minSizeArray(boxSize, () => true);
  const boardView = new arrayConstructor(board, 0, edgeSize ** 2);

  if (!isLegalAll(boardView, edgeSize, ruleFuncs, undefined)) {
    throw new Error("Inputted board not valid.");
  }
  const sq = nextEmptySpace(boardView, edgeSize);
  if (sq) {
    const tic = Date.now();
    let solved = solver(boardView, sq[0], sq[1], edgeSize, ruleFuncs);
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

function getSolver(s: SolverValue): Solver {
  switch (s) {
    case "1":
      return backtracking;
    case "2":
      return localSearch;
    case "3":
      throw new Error("DLX is not yet implemented.");
    default:
      throw new Error(`${s} is not a supported solving method!`);
  }
}

function getActiveRules(ruleFlags: number): Rule[] {
  const rules: Rule[] = [];
  for (const [flag, rule] of allRules) {
    if (ruleFlags & flag) {
      rules.push(rule);
    }
  }
  return rules;
}
