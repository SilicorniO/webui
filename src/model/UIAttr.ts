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

export interface UIAttrCleanOptions {
    size?: boolean
    position?: boolean
    margin?: boolean
    padding?: boolean
    scroll?: boolean
    center?: boolean
}

export default class UIAttr {
    startStart: UIViewId = ""
    startEnd: UIViewId = ""
    endEnd: UIViewId = ""
    endStart: UIViewId = ""
    size: UI_SIZE = UI_SIZE.SIZE_CONTENT
    sizeValue: number = 0
    percentPos: number = 0
    scroll: boolean = false
    center: boolean = false
    marginStart: string = ""
    marginEnd: string = ""
    paddingStart: string = ""
    paddingEnd: string = ""

    public getRef(ref: UI_REF) {
        switch (ref) {
            case UI_REF.START_START:
                return this.startStart
            case UI_REF.START_END:
                return this.startEnd
            case UI_REF.END_END:
                return this.endEnd
            case UI_REF.END_START:
                return this.endStart
            default:
                return ""
        }
    }

    public setRef(ref: UI_REF, id: string) {
        switch (ref) {
            case UI_REF.START_START:
                this.startStart = id
                return
            case UI_REF.START_END:
                this.startEnd = id
                return
            case UI_REF.END_END:
                this.endEnd = id
                return
            case UI_REF.END_START:
                this.endStart = id
                return
            default:
                return
        }
    }

    public setSize(value: string) {
        if (value == UI_SIZE.SIZE_CONTENT) {
            this.size = value
            this.sizeValue = 0
        } else if (String(value).indexOf("%") != -1) {
            const indexPercent = value.indexOf("%")
            this.sizeValue = parseFloat(value.substring(0, indexPercent))
            if (indexPercent < value.length - 1) {
                this.percentPos = parseInt(value.substring(indexPercent + 1, value.length), 10)
            }
            this.size = UI_SIZE.PERCENTAGE
        } else {
            this.sizeValue = parseInt(value, 10)
            this.size = UI_SIZE.SCREEN
        }
    }

    public setMargin(margin: string) {
        this.marginStart = margin
        this.marginEnd = margin
    }

    public setPadding(padding: string) {
        this.paddingStart = padding
        this.paddingEnd = padding
    }

    public clean(options?: UIAttrCleanOptions) {
        if (options == null || options.position != false) {
            this.startStart = ""
            this.startEnd = ""
            this.endEnd = ""
            this.endStart = ""
        }
        if (options == null || options.size != false) {
            this.size = UI_SIZE.SIZE_CONTENT
            this.sizeValue = 0
            this.percentPos = 0
        }
        if (options == null || options.scroll != false) {
            this.scroll = false
        }
        if (options == null || options.center != false) {
            this.center = false
        }
        if (options == null || options.margin != false) {
            this.marginStart = ""
            this.marginEnd = ""
        }
        if (options == null || options.position != false) {
            this.paddingStart = ""
            this.paddingEnd = ""
        }
    }

    public clone(): UIAttr {
        const attr = new UIAttr()

        attr.startStart = this.startStart
        attr.startEnd = this.startEnd
        attr.endEnd = this.endEnd
        attr.endStart = this.endStart
        attr.size = this.size
        attr.sizeValue = this.sizeValue
        attr.percentPos = this.percentPos
        attr.scroll = this.scroll
        attr.center = this.center
        attr.marginStart = this.marginStart
        attr.marginEnd = this.marginEnd
        attr.paddingStart = this.paddingStart
        attr.paddingEnd = this.paddingEnd

        return attr
    }
}
