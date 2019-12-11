import Log from "../utils/log/Log"
import UIUtils from "../utils/ui/UIUtils"
import UIHTMLElement from "./UIHTMLElement"
import UIConfiguration from "../UIConfiguration"

export enum UI_VISIBILITY {
    VISIBLE = "v",
    INVISIBLE = "i",
    GONE = "g",
}

export enum UI_VIEW_ID {
    NONE = "",
    SCREEN = "s",
    PARENT = "p",
    LAST = "l",
}

export type UIViewId = UI_VIEW_ID | string

export enum UI_SIZE {
    SIZE_CONTENT = "sc",
    SCREEN = "s",
    PERCENTAGE = "sp",
}

export enum UI_REF {
    START_START,
    START_END,
    END_END,
    END_START,
}

export const UI_REF_LIST: UI_REF[] = [UI_REF.START_START, UI_REF.START_END, UI_REF.END_END, UI_REF.END_START]

export interface ViewRef {
    [UI_REF.START_START]: UIViewId
    [UI_REF.START_END]: UIViewId
    [UI_REF.END_END]: UIViewId
    [UI_REF.END_START]: UIViewId
}

export enum AXIS {
    X = "x",
    Y = "y",
}

export const AXIS_LIST: AXIS[] = [AXIS.X, AXIS.Y]

export interface UIRefAxis {
    [AXIS.X]: ViewRef
    [AXIS.Y]: ViewRef
}

export interface UIAttr {
    size: string
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

export interface UIAttrCalc {
    sizeValue: number
    percentPos: number
}

export interface UIAttrCalcAxis {
    [AXIS.X]: UIAttrCalc
    [AXIS.Y]: UIAttrCalc
}

export interface UIPosition {
    size: number
    start: number
    end: number
    startChanged: boolean
    endChanged: boolean
    scrollApplied: boolean
    marginStart: number
    marginEnd: number
    paddingStart: number
    paddingEnd: number
}

export interface UIPositionAxis {
    [AXIS.X]: UIPosition
    [AXIS.Y]: UIPosition
}

export interface UIChildrenOrderAxis {
    [AXIS.X]: UIView[]
    [AXIS.Y]: UIView[]
}

export interface UIDependenciesAxis {
    [AXIS.X]: string[]
    [AXIS.Y]: string[]
}

enum ATTR {
    WIDTH = "w",
    FULL_WIDTH = "fw",
    HEIGHT = "h",
    FULL_HEIGHT = "fh",
    LEFT = "l",
    RIGHT = "r",
    TOP = "t",
    BOTTOM = "b",
    AT_LEFT = "al",
    AT_LEFT_EQUAL = "ale",
    AT_RIGHT = "ar",
    AT_RIGHT_EQUAL = "are",
    AT_TOP = "at",
    AT_TOP_EQUAL = "ate",
    AT_BOTTOM = "ab",
    AT_BOTTOM_EQUAL = "abe",
    MARGIN_LEFT = "ml",
    MARGIN_TOP = "mt",
    MARGIN_RIGHT = "mr",
    MARGIN_BOTTOM = "mb",
    MARGIN = "m",
    PADDING_LEFT = "pl",
    PADDING_RIGHT = "pr",
    PADDING_TOP = "pt",
    PADDING_BOTTOM = "pb",
    PADDING = "p",
    CENTER_VERTICAL = "cv",
    CENTER_HORIZONTAL = "ch",
    CENTER = "c",
    SCROLL_VERTICAL = "sv",
    SCROLL_HORIZONTAL = "sh",
    VISIBILITY = "v",
}

export interface UIAttributeValue {
    attr: string
    value?: string
}

export default class UIView {
    public static readonly UI_TAG: string = "ui"

    id: string
    element: UIHTMLElement
    parent: UIView
    screen: UIView

    childrenOrder: UIChildrenOrderAxis = {
        [AXIS.X]: [],
        [AXIS.Y]: [],
    }

    order: number = 0
    orderNum: number = 0
    dependencies: UIDependenciesAxis = {
        [AXIS.X]: [],
        [AXIS.Y]: [],
    }

    public refs: UIRefAxis = {
        [AXIS.X]: {
            [UI_REF.START_START]: "",
            [UI_REF.START_END]: "",
            [UI_REF.END_END]: "",
            [UI_REF.END_START]: "",
        },
        [AXIS.Y]: {
            [UI_REF.START_START]: "",
            [UI_REF.START_END]: "",
            [UI_REF.END_END]: "",
            [UI_REF.END_START]: "",
        },
    }

    public attrs: UIAttrAxis = {
        [AXIS.X]: {
            size: UI_SIZE.SIZE_CONTENT,
            scroll: false,
            center: false,
            marginStart: "0",
            marginEnd: "0",
            paddingStart: "0",
            paddingEnd: "0",
        },
        [AXIS.Y]: {
            size: UI_SIZE.SIZE_CONTENT,
            scroll: false,
            center: false,
            marginStart: "0",
            marginEnd: "0",
            paddingStart: "0",
            paddingEnd: "0",
        },
    }

    public attrsCalc: UIAttrCalcAxis = {
        [AXIS.X]: {
            sizeValue: 0,
            percentPos: 0,
        },
        [AXIS.Y]: {
            sizeValue: 0,
            percentPos: 0,
        },
    }

    // visibility
    visibility: UI_VISIBILITY = UI_VISIBILITY.VISIBLE

    // animations
    animationDurations: number[] = []

    //----- calculated -----

    public positions: UIPositionAxis = {
        [AXIS.X]: {
            size: 0,
            start: 0,
            end: 0,
            startChanged: false,
            endChanged: false,
            scrollApplied: false,
            marginStart: 0,
            marginEnd: 0,
            paddingStart: 0,
            paddingEnd: 0,
        },
        [AXIS.Y]: {
            size: 0,
            start: 0,
            end: 0,
            startChanged: false,
            endChanged: false,
            scrollApplied: false,
            marginStart: 0,
            marginEnd: 0,
            paddingStart: 0,
            paddingEnd: 0,
        },
    }

    //----- Flags for changes -----
    sizeLoaded: boolean = false
    positionLoaded: boolean = false
    childrenInOrder: boolean = false

    /**
     * Create a view object reading the HTML of the element
     * @constructor
     * @param element where to read data
     * @param {UIView=} parent to assign to the view created
     * @param {UIView=} screen to assign to the view created
     * @param {string=} attributeMain with the name of the attribute to read
     * @param {Array<string>=} attributes with the name of the attributes to read as secondary
     **/
    constructor(element: HTMLElement, parent: UIView, screen: UIView, attributeMain: string, attributes: string[]) {
        this.id = element.id
        this.element = UIHTMLElement.convert(element, this)
        this.parent = parent
        this.screen = screen

        //----- INIT -----
        this.init(attributeMain, attributes)
    }

    private init(attributeMain: string, attributes: string[]) {
        //initialize
        this.readUI(this.element, attributeMain, attributes)

        //set this instance into the element
        // this.element.ui = this
        this.element["ui"] = this
    }

    public setWidth(value: string | number) {
        this.setSize(AXIS.X, "" + value)
    }

    public setHeight(value: string | number) {
        this.setSize(AXIS.Y, "" + value)
    }

    public setSize(axis: AXIS, value: string) {
        if (value == UI_SIZE.SIZE_CONTENT) {
            this.attrs[axis].size = value
            this.attrsCalc[axis].sizeValue = 0
        } else if (String(value).indexOf("%") != -1) {
            var indexPercent = value.indexOf("%")
            this.attrsCalc[axis].sizeValue = parseFloat(value.substring(0, indexPercent))
            if (indexPercent < value.length - 1) {
                this.attrsCalc[axis].percentPos = parseInt(value.substring(indexPercent + 1, value.length), 10)
            }
            this.attrs[axis].size = UI_SIZE.PERCENTAGE
        } else {
            this.attrsCalc[axis].sizeValue = parseInt(value, 10)
            this.attrs[axis].size = UI_SIZE.SCREEN
        }
        this.sizeLoaded = false
    }

    // ----- REFERENCES -----

    public setReference(axis: AXIS, ref: UI_REF, id: string) {
        this.refs[axis][ref] = id
        this.sizeLoaded = false
    }

    public getReference(axis: AXIS): ViewRef {
        return this.refs[axis]
    }

    // ----- SCROLL -----

    private setScroll(axis: AXIS, value: boolean) {
        this.attrs[axis].scroll = value
    }

    // ----- CENTER -----

    public setCenter(axis: AXIS, value: boolean) {
        this.attrs[axis].center = value
    }

    // ----- MARGIN ------

    public setMargin(margin: string, axis?: AXIS) {
        if (axis != null) {
            this.setMarginStart(axis, margin)
            this.setMarginEnd(axis, margin)
        } else {
            this.setMarginStart(AXIS.X, margin)
            this.setMarginEnd(AXIS.X, margin)
            this.setMarginStart(AXIS.Y, margin)
            this.setMarginEnd(AXIS.Y, margin)
        }
    }

    public setMarginLeft(margin: string | number) {
        this.setMarginStart(AXIS.X, "" + margin)
    }

    public setMarginTop(margin: string | number) {
        this.setMarginStart(AXIS.Y, "" + margin)
    }

    public setMarginRight(margin: string | number) {
        this.setMarginEnd(AXIS.X, "" + margin)
    }

    public setMarginBottom(margin: string | number) {
        this.setMarginEnd(AXIS.Y, "" + margin)
    }

    public setMarginStart(axis: AXIS, margin: string) {
        this.attrs[axis].marginStart = margin
        this.sizeLoaded = false
    }

    public setMarginEnd(axis: AXIS, margin: string) {
        this.attrs[axis].marginEnd = margin
        this.sizeLoaded = false
    }

    // ----- PADDING -----

    public setPadding(padding: string, axis?: AXIS) {
        if (axis != null) {
            this.setPaddingStart(axis, padding)
            this.setPaddingEnd(axis, padding)
        } else {
            this.setPaddingStart(AXIS.X, padding)
            this.setPaddingEnd(AXIS.X, padding)
            this.setPaddingStart(AXIS.Y, padding)
            this.setPaddingEnd(AXIS.Y, padding)
        }
    }

    public setPaddingLeft(margin: string | number) {
        this.setPaddingStart(AXIS.X, "" + margin)
    }

    public setPaddingTop(margin: string | number) {
        this.setPaddingStart(AXIS.Y, "" + margin)
    }

    public setPaddingRight(margin: string | number) {
        this.setPaddingEnd(AXIS.X, "" + margin)
    }

    public setPaddingBottom(margin: string | number) {
        this.setPaddingEnd(AXIS.Y, "" + margin)
    }

    public setPaddingStart(axis: AXIS, padding: string) {
        this.attrs[axis].paddingStart = padding
        this.sizeLoaded = false
    }

    public setPaddingEnd(axis: AXIS, padding: string) {
        this.attrs[axis].paddingEnd = padding
        this.sizeLoaded = false
    }

    // ----- VISIBILITY -----

    public setVisibility(visibility: UI_VISIBILITY) {
        if (visibility != UI_VISIBILITY.GONE && this.visibility == UI_VISIBILITY.GONE) {
            this.sizeLoaded = false
        }
        this.visibility = visibility
    }

    public cleanSizeLoaded() {
        //clean the sizeLoaded of this view
        this.sizeLoaded = false

        //if it has parent and the size depend of children we clean it too
        if (
            this.parent != null &&
            (this.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT || this.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT)
        ) {
            this.parent.cleanSizeLoaded()
        }
    }

    public hasToBeCalculated(): boolean {
        return this.visibility != UI_VISIBILITY.GONE
    }

    public animateNextRefresh(animationDuration: number) {
        // this.animationDurations.push(animationDuration);

        //animate all views from parent
        if (this.parent) {
            this.parent.animateDependencies(animationDuration)
        } else {
            this.animateDependencies(animationDuration)
        }
    }

    private animateDependencies(animationDuration: number) {
        //animate this
        this.animationDurations.push(animationDuration)

        //animate children
        for (const child of this.getUIChildren()) {
            child.animateDependencies(animationDuration)
        }
    }

    /**
     * Check if this view has UI children
     * @return {boolean} TRUE if has children
     */
    public hasUIChildren(): boolean {
        var children = this.element.childNodes
        for (var i = 0; i < children.length; i++) {
            const uiChild = UIHTMLElement.get(children[i])
            if (uiChild != null) {
                return true
            }
        }

        return false
    }

    /**
     * Get the children elements (childNodes)
     * @return {Array<*>} Array of elements
     */
    public getChildElements(): UIHTMLElement[] {
        return UIHTMLElement.getAll(this.element.childNodes)
    }

    public getUIChildren(): UIView[] {
        var children = UIHTMLElement.getAll(this.element.childNodes)
        const uiChildren: UIView[] = []
        for (const child of children) {
            const uiElement = UIHTMLElement.get(child)
            if (uiElement != null) {
                uiChildren.push(uiElement.ui)
            }
        }
        return uiChildren
    }

    public getPreviousView(): UIView | null {
        let previousView: UIView | null = null

        //if it is an screen there is not a previous view
        if (this.parent == null) {
            return null
        }

        const childNodes = this.parent.element.childNodes
        for (var i = 0; i < childNodes.length; i++) {
            var child = UIHTMLElement.get(childNodes[i])
            if (child != null) {
                if (child.id == this.id) {
                    return previousView
                } else if (child.ui.hasToBeCalculated()) {
                    previousView = child.ui
                }
            }
        }

        //not found
        return null
    }

    public cleanAllAxis() {
        for (const axis of AXIS_LIST) {
            this.clean(axis)
        }
    }

    public clean(axis: AXIS) {
        this.positions[axis].startChanged = false
        this.positions[axis].endChanged = false

        this.positions[axis].start = 0
        this.positions[axis].end = 0
        this.positions[axis].size = 0
    }

    public cleanUI() {
        this.refs = {
            [AXIS.X]: {
                [UI_REF.START_START]: "",
                [UI_REF.START_END]: "",
                [UI_REF.END_END]: "",
                [UI_REF.END_START]: "",
            },
            [AXIS.Y]: {
                [UI_REF.START_START]: "",
                [UI_REF.START_END]: "",
                [UI_REF.END_END]: "",
                [UI_REF.END_START]: "",
            },
        }

        this.attrs = {
            [AXIS.X]: {
                size: UI_SIZE.SIZE_CONTENT,
                scroll: false,
                center: false,
                marginStart: "0",
                marginEnd: "0",
                paddingStart: "0",
                paddingEnd: "0",
            },
            [AXIS.Y]: {
                size: UI_SIZE.SIZE_CONTENT,
                scroll: false,
                center: false,
                marginStart: "0",
                marginEnd: "0",
                paddingStart: "0",
                paddingEnd: "0",
            },
        }
    }

    public applyDimens(coreConfig: UIConfiguration) {
        for (const axis of AXIS_LIST) {
            this.positions[axis].paddingStart = coreConfig.getDimen(this.attrs[axis].paddingStart)
            this.positions[axis].paddingEnd = coreConfig.getDimen(this.attrs[axis].paddingEnd)
            this.positions[axis].marginStart = coreConfig.getDimen(this.attrs[axis].marginStart)
            this.positions[axis].marginEnd = coreConfig.getDimen(this.attrs[axis].marginEnd)
        }
    }

    public toString() {
        return (
            "[" +
            this.id +
            "]: ll:" +
            this.refs[AXIS.X][UI_REF.START_START] +
            ", lr:" +
            this.refs[AXIS.X][UI_REF.START_END] +
            ", rr:" +
            this.refs[AXIS.X][UI_REF.END_END] +
            ", rl:" +
            this.refs[AXIS.X][UI_REF.END_START] +
            ", tt:" +
            this.refs[AXIS.Y][UI_REF.START_START] +
            ",tb: " +
            this.refs[AXIS.Y][UI_REF.START_END] +
            ", bb:" +
            this.refs[AXIS.Y][UI_REF.END_END] +
            ", bt:" +
            this.refs[AXIS.Y][UI_REF.END_START] +
            ", ml:" +
            this.positions[AXIS.X].marginStart +
            ", mr:" +
            this.positions[AXIS.X].marginEnd +
            ", mt:" +
            this.positions[AXIS.Y].marginStart +
            ",mb: " +
            this.positions[AXIS.Y].marginEnd +
            ", pl:" +
            this.positions[AXIS.X].paddingStart +
            ", pr:" +
            this.positions[AXIS.X].paddingEnd +
            ", pt:" +
            this.positions[AXIS.Y].paddingStart +
            ", pb:" +
            this.positions[AXIS.Y].paddingEnd +
            ", w:" +
            this.positions[AXIS.X].size +
            ", h:" +
            this.positions[AXIS.Y].size +
            ", sh:" +
            this.attrs[AXIS.X].size +
            ", sh:" +
            this.attrs[AXIS.Y].size +
            ", pId:" +
            (this.parent ? this.parent.id : "") +
            ", l:" +
            this.positions[AXIS.X].start +
            ", r:" +
            this.positions[AXIS.X].end +
            ", t:" +
            this.positions[AXIS.Y].start +
            ", b:" +
            this.positions[AXIS.Y].end
        )
    }

    /**
     * Create a view object reading the HTML of the element
     * @param element where to read data
     * @param attributeMain with the name of the attribute to read
     * @param attributes with the name of the attributes to read as secondary
     * @return View generated
     **/
    public readUI(element: HTMLElement, attributeMain: string, attributes: string[]): UIView {
        //read main attributes
        let attributeValues = UIUtils.readAttributes(element.getAttribute(attributeMain))
        for (var i = 0; i < attributes.length; i++) {
            attributeValues = attributeValues.concat(UIUtils.readAttributes(element.getAttribute(attributes[i])))
        }

        //check if we have attributes
        if (attributeValues.length == 0) {
            return
        }

        //set the ui values
        for (const attributeValue of attributeValues) {
            this.readUIAttribute(attributeValue)
        }

        const referencesXEmpty = UIView.isReferenceEmpty(this.getReference(AXIS.X))
        if (referencesXEmpty && !this.attrs[AXIS.X].center) {
            this.setReference(AXIS.X, UI_REF.START_START, UI_VIEW_ID.PARENT)
        }

        const referencesYEmpty = UIView.isReferenceEmpty(this.getReference(AXIS.Y))
        if (referencesYEmpty && !this.attrs[AXIS.Y].center) {
            this.setReference(AXIS.Y, UI_REF.START_START, UI_VIEW_ID.PARENT)
        }
    }

    /**
     * Read attribute and value
     * @param attr attribute
     * @param value value of attribute
     */
    private readUIAttribute(attributeValue: UIAttributeValue) {
        const attr = attributeValue.attr
        const value = attributeValue.value

        if (attr === ATTR.WIDTH) {
            this.setSize(AXIS.X, value)
        } else if (attr === ATTR.FULL_WIDTH) {
            this.setSize(AXIS.X, "100%")
        } else if (attr === ATTR.HEIGHT) {
            this.setSize(AXIS.Y, value)
        } else if (attr === ATTR.FULL_HEIGHT) {
            this.setSize(AXIS.Y, "100%")
        } else if (attr === ATTR.LEFT) {
            this.setReference(AXIS.X, UI_REF.START_START, value)
        } else if (attr === ATTR.RIGHT) {
            this.setReference(AXIS.X, UI_REF.END_END, value)
        } else if (attr === ATTR.TOP) {
            this.setReference(AXIS.Y, UI_REF.START_START, value)
        } else if (attr === ATTR.BOTTOM) {
            this.setReference(AXIS.Y, UI_REF.END_END, value)
        } else if (attr === ATTR.AT_LEFT) {
            this.setReference(AXIS.X, UI_REF.END_START, value)
        } else if (attr === ATTR.AT_LEFT_EQUAL) {
            this.setReference(AXIS.X, UI_REF.END_START, value)
            this.setReference(AXIS.Y, UI_REF.START_START, value)
            this.setReference(AXIS.Y, UI_REF.END_END, value)
        } else if (attr === ATTR.AT_RIGHT) {
            this.setReference(AXIS.X, UI_REF.START_END, value)
        } else if (attr === ATTR.AT_RIGHT_EQUAL) {
            this.setReference(AXIS.X, UI_REF.START_END, value)
            this.setReference(AXIS.Y, UI_REF.START_START, value)
            this.setReference(AXIS.Y, UI_REF.END_END, value)
        } else if (attr === ATTR.AT_TOP) {
            this.setReference(AXIS.Y, UI_REF.END_START, value)
        } else if (attr === ATTR.AT_TOP_EQUAL) {
            this.setReference(AXIS.Y, UI_REF.END_START, value)
            this.setReference(AXIS.X, UI_REF.START_START, value)
            this.setReference(AXIS.X, UI_REF.END_END, value)
        } else if (attr === ATTR.AT_BOTTOM) {
            this.setReference(AXIS.Y, UI_REF.START_END, value)
        } else if (attr === ATTR.AT_BOTTOM_EQUAL) {
            this.setReference(AXIS.Y, UI_REF.START_END, value)
            this.setReference(AXIS.X, UI_REF.START_START, value)
            this.setReference(AXIS.X, UI_REF.END_END, value)
        } else if (attr === ATTR.MARGIN_LEFT) {
            this.setMarginStart(AXIS.X, value)
        } else if (attr === ATTR.MARGIN_RIGHT) {
            this.setMarginEnd(AXIS.X, value)
        } else if (attr === ATTR.MARGIN_TOP) {
            this.setMarginStart(AXIS.Y, value)
        } else if (attr === ATTR.MARGIN_BOTTOM) {
            this.setMarginEnd(AXIS.Y, value)
        } else if (attr === ATTR.MARGIN) {
            var mValues = value.split(",")
            if (mValues.length === 1) {
                this.setMargin(value)
            } else if (mValues.length === 4) {
                this.setMarginStart(AXIS.X, mValues[0])
                this.setMarginStart(AXIS.Y, mValues[1])
                this.setMarginEnd(AXIS.X, mValues[2])
                this.setMarginEnd(AXIS.Y, mValues[3])
            }
        } else if (attr === ATTR.PADDING_LEFT) {
            this.setPaddingStart(AXIS.X, value)
        } else if (attr === ATTR.PADDING_RIGHT) {
            this.setPaddingEnd(AXIS.X, value)
        } else if (attr === ATTR.PADDING_TOP) {
            this.setPaddingStart(AXIS.Y, value)
        } else if (attr === ATTR.PADDING_BOTTOM) {
            this.setPaddingEnd(AXIS.Y, value)
        } else if (attr === ATTR.PADDING) {
            var pValues = value.split(",")
            if (pValues.length === 1) {
                this.setPadding(value)
            } else if (pValues.length === 4) {
                this.setPaddingStart(AXIS.X, mValues[0])
                this.setPaddingStart(AXIS.Y, mValues[1])
                this.setPaddingEnd(AXIS.X, mValues[2])
                this.setPaddingEnd(AXIS.Y, mValues[3])
            }
        } else if (attr === ATTR.CENTER_VERTICAL) {
            this.setCenter(AXIS.Y, true)
        } else if (attr === ATTR.CENTER_HORIZONTAL) {
            this.setCenter(AXIS.X, true)
        } else if (attr === ATTR.CENTER) {
            this.setCenter(AXIS.X, true)
            this.setCenter(AXIS.Y, true)
        } else if (attr === ATTR.SCROLL_VERTICAL) {
            this.setScroll(AXIS.Y, true)
        } else if (attr === ATTR.SCROLL_HORIZONTAL) {
            this.setScroll(AXIS.X, true)
        } else if (attr === ATTR.VISIBILITY) {
            this.setVisibility((value as UI_VISIBILITY) || UI_VISIBILITY.VISIBLE)
        } else if (attr.length > 0) {
            Log.logW("Attribute unknown: " + attr + " in view " + this.id)
        }
    }

    private static isReferenceEmpty(reference: ViewRef): boolean {
        for (const id of UI_REF_LIST) {
            if (reference[id].length > 0) {
                return false
            }
        }

        // not found
        return true
    }
}
