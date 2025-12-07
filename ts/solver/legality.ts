import {rules} from './rules';
import type {Point, TypedUintArray} from '../common/common';
import {maxValueOfTypedArray, pointToIndex} from '../common/common';

//is the whole board legal?
export function isLegalAll(board: Readonly<TypedUintArray>, edgeSize: number, sqList: undefined | number[][] = undefined) {
    if (!sqList) {
      for (let i = 0; i < edgeSize; i++) {
        for (let j = 0; j < edgeSize; j++) {
          if (!isLegalSpace(board, i, j, edgeSize)) {
            return false;
          }
        }
      }
    } else {
      for (const sq of sqList) {
        if (!isLegalSpace(board, sq[0], sq[1], edgeSize)) {
          return false;
        }
      }
    }
    return true;
  }
  
//is the number on i, j legal?
export function isLegalSpace(board: TypedUintArray, i: number, j: number, edgeSize: number) {
    const index = pointToIndex(i, j, edgeSize);
    const val = board[index];
    if (val !== maxValueOfTypedArray[board.BYTES_PER_ELEMENT]) {
      if (val > edgeSize) {
        throw new Error(`Value ${val} on row ${i+1}, column ${j+1} too large.`);
      }
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
      for (const rule of rules) {
        if (!rule(board, i, j, edgeSize, val)) {
          return false;
        }
      }
    }
    return true;
  }

//finds the next empty square, and returns its coordinates
//returns undefined if no such space exists
export function nextEmptySpace(board: Readonly<TypedUintArray>, edgeSize: number): Point | undefined {
    for (let i = 0; i < edgeSize; i++) {
        for (let j = 0; j < edgeSize; j++) {
            const index = pointToIndex(i, j, edgeSize);
            if (board[index] === maxValueOfTypedArray[board.BYTES_PER_ELEMENT]) {
                return [i, j];
            }
        }
    }
    return undefined;
}

// #region violations

//number of rules violated by a particular space
export function numViolationsSpace(board: Readonly<TypedUintArray>, edgeSize: number, i: number, j: number, val: number) {
    let viols = 0;
    if (val !== maxValueOfTypedArray[board.BYTES_PER_ELEMENT]) {
      if (val > edgeSize) {
        throw new Error(`Value ${val} on row ${i+1}, column ${j+1} too large.`)
      }
      for (const index of possiblyConflictingIndices(i, j, edgeSize)) {
        if (val == board[index]) {
          viols++;
        }
      }
    }
    return viols;
}
  
export function minViolatingOption(board: Readonly<TypedUintArray>, edgeSize: number, i: number, j: number) {
    let bestNum = 1;
    let numViols = Infinity;
    for (let k = 1; k <= edgeSize; k++) {
        const index = pointToIndex(i, j, edgeSize);
        const pointVal = board[index]
        let val = numViolationsSpace(board, i, j, k, pointVal);
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

/** squares in the same box as a square at i, j */
function boxSq(i: number, j: number, edgeSize: number) {
    const boxSize = Math.sqrt(edgeSize)
    const squares: Set<Point> = new Set();
    const iFloor = Math.floor(i/boxSize) * boxSize;
    const jFloor = Math.floor(j/boxSize) * boxSize;
    for (let m = 0; m < boxSize; ++m) {
      for (let n = 0; n < boxSize; ++n) {
        if ((m + iFloor != i) || (n + jFloor != j)) {
          squares.add([m + iFloor, n + jFloor])
        }
      }
    }
    return squares;
}
  
/** squares in the same row/column as a square at i, j */
function rowcolumnSq(i: number, j: number, edgeSize: number) {
    const squares: Set<Point> = new Set();
    for (let k = 0; k < edgeSize; ++k) {
      if (k != i) {
        squares.add([k, j])
      }
      if (k != j) {
        squares.add([i, k])
      }
    }
    return squares;
}

/** edge size -> index -> possibly conflicting index */
const conflictingIndicesMap = new Map<number, Map<number, Set<number>>>();
function possiblyConflictingIndices(i: number, j: number, edgeSize: number): Set<number> {
  if (!conflictingIndicesMap.has(edgeSize)) {
    conflictingIndicesMap.set(edgeSize, new Map<number, Set<number>>())
  }
  const pointIndex = pointToIndex(i, j, edgeSize);
  const cached = conflictingIndicesMap.get(edgeSize)?.get(pointIndex);
  if (cached) {
    return cached;
  }
  const s1 = boxSq(i, j, edgeSize);
  const s2 = rowcolumnSq(i, j, edgeSize);
  // set.union is still a bit new
  const result = new Set<number>();
  for (const p of s1) {
    const index = pointToIndex(p[0], p[1], edgeSize);
    result.add(index);
  }
  for (const p of s2) {
    const index = pointToIndex(p[0], p[1], edgeSize);
    result.add(index);
  }
  conflictingIndicesMap.get(edgeSize)?.set(pointIndex, result);
  return result;
}
// #endregion