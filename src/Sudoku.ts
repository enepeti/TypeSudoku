import { stages } from "./stages";
import {
  Cast,
  Dec,
  Range,
  Put2D,
  Reject,
  Render,
  Uniq,
  Values,
  MatrixCol,
  Inc,
  Sqrt,
  FlatSubMatrix,
  Add,
  GridRender,
} from "./utils";

export type PossibleNumbers<Stage extends unknown[]> = Range<Stage["length"]>;

type IsUniqWoSpace<T extends unknown[]> = Reject<T, " "> extends Uniq<
  Reject<T, " ">
>
  ? true
  : false;

type CheckRows<T extends unknown[][]> = T extends [infer Head, ...infer Tail]
  ? IsUniqWoSpace<Cast<Head, unknown[]>> extends true
    ? CheckRows<Cast<Tail, unknown[][]>>
    : false
  : true;

type CheckCols<
  T extends unknown[][],
  N extends number = 0
> = N extends T["length"]
  ? true
  : IsUniqWoSpace<MatrixCol<T, N>> extends true
  ? CheckCols<T, Cast<Inc<N>, number>>
  : false;

type CheckSubs<
  T extends unknown[][],
  Y extends number = 0,
  X extends number = 0,
  L = T["length"],
  S extends number = Sqrt<L>,
  B = IsUniqWoSpace<Cast<FlatSubMatrix<T, Y, X, S, S>, unknown[]>>
> = Y extends L
  ? X extends L
    ? true
    : CheckSubs<T, 0, Add<X, S>, L, S>
  : X extends L
  ? CheckSubs<T, Add<Y, S>, 0, L, S>
  : B extends true
  ? CheckSubs<T, Add<Y, S>, Add<X, S>, L, S>
  : false;

type CheckAndPut2D<
  T extends unknown[][],
  Y extends number,
  X extends number,
  N extends unknown,
  P = Put2D<T, Y, X, N>
> = CheckRows<Cast<P, unknown[][]>> extends true
  ? CheckCols<Cast<P, unknown[][]>> extends true
    ? CheckSubs<Cast<P, unknown[][]>> extends true
      ? P
      : T
    : T
  : T;

type Command<
  T extends unknown[][],
  Args extends number[] = [],
  R = PossibleNumbers<T>
> = {
  [K in Cast<Values<R>, number>]: Args extends [infer Y, infer X]
    ? Command<
        Cast<
          CheckAndPut2D<T, Dec<Cast<Y, number>>, Dec<Cast<X, number>>, `${K}`>,
          unknown[][]
        >,
        []
      >
    : Command<T, [...Args, K]>;
} & {
  draw: GameRender<T>;
};

type GameRender<T extends any[]> = T extends unknown[][]
  ? GridRender<
      T,
      "|",
      "-",
      [
        Command<T>,
        Render<["GameClear", "WoW", "MuchFun"], null>
      ][" " extends T[number][number] ? 0 : 1]
    >
  : never;

export const TypeGame: { [K in keyof stages]: GameRender<stages[K]> } = null!;
