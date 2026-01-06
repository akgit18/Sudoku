import { pointToIndex, RuleType, RuleValue, TypedUintArray } from "../common/common";

/** @returns whether the rule is satisfied */
export type Rule = (board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number) => boolean

function rowcolumn(board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number): boolean {
  for (let k = 0; k < edgeSize; ++k) {
    const sameColIndex = pointToIndex(k, j, edgeSize);
    const sameRowIndex = pointToIndex(i, k, edgeSize);
    if (((val == board[sameColIndex]) && k != i) || ((val == board[sameRowIndex])) && k != j) {
      return false;
    }
  }
  return true;
}

function boxrule(board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number): boolean {
  const boxSize = Math.sqrt(edgeSize)
  const iFloor = Math.floor(i/boxSize) * boxSize;
  const jFloor = Math.floor(j/boxSize) * boxSize;
  for (let m = 0; m < boxSize; ++m) {
    for (let n = 0; n < boxSize; ++n) {
      if ((m + iFloor != i) || (n + jFloor != j)) {
        const index = pointToIndex(m + iFloor, n + jFloor, edgeSize);
        if (board[index] == val) {
          return false;
        }
      }
    }
  }
  return true;
}

function knightsmove(board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number): boolean {
    const dx = [-2, -2, -1, -1, 1, 1, 2, 2];
    const dy = [-1, 1, -2, 2, -2, 2, -1, 1];
    for (let k = 0; k < 8; k++) {
        const x = i + dx[k];
        const y = j + dy[k];
        if (0 <= x && x < edgeSize && 0 <= y && y < edgeSize) {
            const index = pointToIndex(x, y, edgeSize);
            if (val == board[index]) {
                return false;
            }
        }
    }
    return true;
}

function kingsmove(board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number): boolean {
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    for (let k = 0; k < 8; k++) {
        const x = i + dx[k];
        const y = j + dy[k];
        if (0 <= x && x < edgeSize && 0 <= y && y < edgeSize) {
            const index = pointToIndex(x, y, edgeSize);
            if (val == board[index]) {
                return false;
            }
        }
    }
    return true;
}

function orthoplus(board: Readonly<TypedUintArray>, i: number, j: number, edgeSize: number, val: number): boolean {
    const dx = [-1, 0, 0, 1];
    const dy = [0, -1, 1, 0];
    for (let k = 0; k < 4; ++k) {
        const x = i + dx[k];
        const y = j + dy[k];
        if (0 <= x && x < edgeSize && 0 <= y && y < edgeSize) {
            const index = pointToIndex(x, y, edgeSize);
            if ((val + 1 == board[index]) || (val - 1 == board[index])) {
                return false;
            }
        }
    }
    return true;
}

export const allRules: [RuleValue, Rule][] = [
  [RuleType.RowColumn, rowcolumn],
  [RuleType.Box, boxrule],
  [RuleType.Knightsmove, knightsmove], 
  [RuleType.Kingsmove, kingsmove],
  [RuleType.Orthoplus, orthoplus],
];