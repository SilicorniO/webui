import { AXIS } from "./UIAxis"

export enum UI_VIEW_ID {
    NONE = "",
    SCREEN = "s",
    PARENT = "p",
    LAST = "l",
}

export type UIViewId = UI_VIEW_ID | string

export enum UI_REF {
    START_START,
    START_END,
    END_END,
    END_START,
}

export const UI_REF_LIST: UI_REF[] = [UI_REF.START_START, UI_REF.START_END, UI_REF.END_END, UI_REF.END_START]

export enum UI_SIZE {
    SIZE_CONTENT = "sc",
    SCREEN = "s",
    PERCENTAGE = "sp",
}

export interface UIAttr {
    [UI_REF.START_START]: UIViewId
    [UI_REF.START_END]: UIViewId
    [UI_REF.END_END]: UIViewId
    [UI_REF.END_START]: UIViewId
    size: UI_SIZE
    sizeValue: number
    percentPos: number
    scroll: boolean
    center: boolean
    marginStart: string
    marginEnd: string
    paddingStart: string
    paddingEnd: string
}

export interface UIAttrAxis {
    [AXIS.X]: UIAttr
    [AXIS.Y]: UIAttr
}
