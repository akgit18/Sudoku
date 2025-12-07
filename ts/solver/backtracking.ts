import { pointToIndex, TypedUintArray } from "../common/common";
import { isLegalSpace, nextEmptySpace } from "./legality";

// export function backtracking(boardRef: number[][], i: number, j: number, edgeSize: number): boolean {
//     for (let guess = 1; guess < (edgeSize + 1); ++guess) {
//       boardRef[i][j] = guess;
//       if (isLegalSpace(boardRef, i, j, edgeSize)) {
//         const sq = nextEmptySpace(boardRef, edgeSize);
//         if (sq) {
//           const solved = backtracking(boardRef, sq[0], sq[1], edgeSize);
//           if (solved) {
//             return true;
//           }
//         } else {
//           return true;
//         }
//       }
//     }
//     boardRef[i][j] = -1;
//     return false;
// }

export function backtracking(boardRef: TypedUintArray, i: number, j: number, edgeSize: number): boolean {
    const index = pointToIndex(i, j, edgeSize);
    for (let guess = 1; guess < (edgeSize + 1); ++guess) {
        boardRef[index] = guess;
        if (isLegalSpace(boardRef, i, j, edgeSize)) {
            const sq = nextEmptySpace(boardRef, edgeSize);
            if (sq) {
                const solved = backtracking(boardRef, sq[0], sq[1], edgeSize);
                if (solved) {
                    return true;
                }
            } else {
                return true;
            }
        }
    }
    boardRef[index] = -1;
    return false;
}