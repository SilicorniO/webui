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

export class AxisRect {
    start: number = 0
    end: number = 0

    public clean() {
        this.start = 0
        this.end = 0
    }
}
