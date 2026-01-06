export type Point = [number, number];
export type TypedUintArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor; // | BigUint64ArrayConstructor;
export type TypedUintArray = InstanceType<TypedUintArrayConstructor>;
export const MessageTypes = {
    SolveBoard: 1,
    AbortSolve: 2,

    ShowBoard: -1,
    SolveError: -2,
} as const;
export const SolverType = {
    Backtracking: "1",
    LocalSearch: "2",
    DLX: "3",
} as const;
export type SolverValue = typeof SolverType[keyof typeof SolverType]
export const RuleType = {
  RowColumn: 1 << 0,
  Box: 1 << 1,
  // keep shift amount in sync with html element values
  Knightsmove: 1 << 2,
  Kingsmove: 1 << 3,
  Orthoplus: 1 << 4,
  // TODO: if extensible rules becomes a thing, maybe use bigint for 32 or more rules
} as const;
export type RuleValue = typeof RuleType[keyof typeof RuleType];
export const MessageKeys = {
    Type: "t",
    Data: "d",
} as const;
export type MessageToWorker = {
    type: typeof MessageTypes.SolveBoard,
    data: {boxSize: number, board: ArrayBuffer, rules: number, method: SolverValue},
} | {
    type: typeof MessageTypes.AbortSolve,
    data: never,
}

export type MessageFromWorker = {
    type: typeof MessageTypes.ShowBoard,
    data: {edgeSize: number, board: ArrayBuffer, solveMs: number},
} | {
    type: typeof MessageTypes.SolveError,
    data: unknown,
}

/** point in 2d array -> index in 1d array */
export function pointToIndex(i: number, j: number, edgeSize: number): number {
    return (i * edgeSize) + j;
}
  
/** index in 1d array -> point in 2d array */
export function indexToPoint(i: number, edgeSize: number): Point {
    return [Math.floor(i / edgeSize), i % edgeSize];
}

export function minSizeArray(boxSize: number, check: (question: string) => boolean): TypedUintArrayConstructor {
  if (boxSize < 16) {
    // can technically represent values up to 16^2, but one number is needed to represent empty squares
    // similar logic applies to below squares
    return Uint8Array;
  }
  if (check("This Sudoku is likely too big to solve in a reasonable amount of time. Are you sure that you'd like to continue?")) {
    if (boxSize < 256) {
      return Uint16Array;
    } else if (boxSize < 65536) {
      return Uint32Array;
    // } else if (size < 4294967296) {
    //   return BigUint64Array;
    } else {
      throw new RangeError(`This Sudoku (box size ${boxSize}) is too big too solve!`)
    }
  } else {
    throw new Error("Sudoku solving stopped by user.")
  }
}

// maybe use object if ever trying bigint compatibility
export const maxValueOfTypedArray = [ , 255, 65535, , 4294967295] as const;