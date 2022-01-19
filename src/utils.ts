// helpers

export type Cast<A, B> = A extends B ? A : B;

// range

export type FullRange<
  To extends number,
  S extends number[] = []
> = S["length"] extends To
  ? [...S, S["length"]]
  : FullRange<To, [...S, S["length"]]>;

type _Range<
  To extends number,
  From extends number = 1,
  S extends number[] = FullRange<To>
> = S extends [From, ...infer _]
  ? S
  : S extends [infer _, ...infer T]
  ? T extends number[]
    ? _Range<To, From, T>
    : never
  : never;

export type Range<To extends number, From extends number = 1> = _Range<
  To,
  From
>;

// write to array/matrix

export type Before<
  T extends unknown[],
  P extends number,
  S extends unknown[] = []
> = S["length"] extends P ? S : Before<T, P, [...S, T[S["length"]]]>;

export type After<T extends unknown[], P extends number> = T extends [
  ...Before<T, P>,
  infer _,
  ...infer Rest
]
  ? Rest
  : [];

export type Put<T extends unknown[], P extends number, N extends unknown> = [
  ...Before<T, P>,
  N,
  ...After<T, P>
];

export type Put2D<
  T extends unknown[][],
  Y extends number,
  X extends number,
  N extends unknown
> = T[Y][X] extends " " ? Put<T, Y, Put<T[Y], X, N>> : T;

// arithmetics

export type Count<N extends number, S extends 0[] = []> = S["length"] extends N
  ? S
  : Count<N, [...S, 0]>;
export type Inc<N extends number> = [...Count<N>, 0]["length"];
export type Dec<N extends number> = Count<N> extends [infer _, ...infer T]
  ? T["length"]
  : 0;
export type Add<A extends number, B extends number> = B extends 0
  ? A
  : Add<Cast<Inc<A>, number>, Dec<B>>;

export type SqrtTable = [0, 1, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 4];
export type Sqrt<T> = T extends number ? SqrtTable[T] : 0;

// array methods

export type Values<T> = number extends keyof T ? T[number] : never;

export type Uniq<T extends unknown[], S extends unknown[] = []> = T extends [
  infer Head,
  ...infer Tail
]
  ? Head extends Values<S>
    ? Uniq<Tail, S>
    : Uniq<Tail, [...S, Head]>
  : S;

export type Reject<T extends unknown[], E> = T extends [
  infer Head,
  ...infer Tail
]
  ? Head extends E
    ? Reject<Tail, E>
    : [Head, ...Reject<Tail, E>]
  : [];

export type Flatten<T extends unknown[]> = T extends [infer Head, ...infer Tail]
  ? Head extends [infer _0, ...infer _1]
    ? [...Head, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : [];

// matrix methods

export type MatrixCol<T, C> = T extends [infer Head, ...infer Tail]
  ? [
      Cast<Head, unknown[]>[Cast<C, number>],
      ...MatrixCol<Cast<Tail, unknown[][]>, C>
    ]
  : [];

export type MatrixCols<T, FC extends number, TC extends number> = FC extends TC
  ? []
  : [MatrixCol<T, FC>, ...MatrixCols<T, Cast<Inc<FC>, number>, TC>];

export type SubMatrix<
  T,
  Y extends number,
  X extends number,
  R extends number,
  C extends number
> = MatrixCols<MatrixCols<T, Y, Add<Y, R>>, X, Add<X, C>>;

export type FlatSubMatrix<
  T,
  Y extends number,
  X extends number,
  R extends number,
  C extends number
> = Flatten<SubMatrix<T, Y, X, R, C>>;

// render methods

export type Join<T> = T extends [infer Head, ...infer Tail]
  ? `${Cast<Head, string>}${Join<Tail>}`
  : "";

export type BoxLine<T extends string, C extends string> = `${C}${T}${C}`;

export type IntersectStr<
  T extends string,
  C extends string,
  N extends number,
  I extends number = 0
> = T extends `${infer Head}${infer Tail}`
  ? I extends N
    ? `${C}${Head}${IntersectStr<Tail, C, N, 1>}`
    : `${Head}${IntersectStr<Tail, C, N, Cast<Inc<I>, number>>}`
  : "";

export type IntersectArr<
  T extends unknown[],
  C extends any,
  N extends number,
  I extends number = 0
> = T extends [infer Head, ...infer Tail]
  ? I extends N
    ? [C, Head, ...IntersectArr<Tail, C, N, 1>]
    : [Head, ...IntersectArr<Tail, C, N, Cast<Inc<I>, number>>]
  : [];

export type Repeat<
  C extends string,
  N extends number,
  S extends string = ""
> = N extends 0 ? S : Repeat<C, Dec<N>, `${C}${S}`>;

export type Render<T, N> = T extends [infer Head, ...infer Tail]
  ? { [K in Cast<Head, string>]: Render<Cast<Tail, string[]>, N> }
  : N;

export type BoxRender<B, T, N> = Render<[B], Render<T, Render<[B], N>>>;

export type GridRender<
  T extends unknown[][],
  V extends string,
  H extends string,
  N,
  L extends number = T["length"],
  S extends number = Sqrt<L>,
  A extends number = Cast<Inc<Add<L, S>>, number>,
  B = Repeat<H, A>
> = BoxRender<
  B,
  IntersectArr<
    {
      [K in keyof T]: BoxLine<IntersectStr<Join<T[K]>, V, S>, V>;
    },
    Repeat<H, A>,
    S
  >,
  N
>;
