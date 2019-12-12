export enum AXIS {
    X = "x",
    Y = "y",
}

export const AXIS_LIST: AXIS[] = [AXIS.X, AXIS.Y]

export interface UIAxisArray<T> {
    [AXIS.X]: T[]
    [AXIS.Y]: T[]
}

export interface UIAxis<T> {
    [AXIS.X]: T
    [AXIS.Y]: T
}
