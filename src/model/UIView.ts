import Log from "../utils/log/Log"
import UIUtils from "../utils/ui/UIUtils"
import UIHTMLElement from "./UIHTMLElement"
import UIConfiguration from "../UIConfiguration"

export type UIViewId = UI_VIEW_ID | string

export type UIVisibility = "v" | "i" | "g"

export enum UI_VIEW_ID {
    SCREEN = "s",
    PARENT = "p",
    LAST = "l",
}

export enum UI_REFERENCE {
    START_START,
    START_END,
    END_END,
    END_START,
}

export const UI_REFERENCE_LIST: UI_REFERENCE[] = [
    UI_REFERENCE.START_START,
    UI_REFERENCE.START_END,
    UI_REFERENCE.END_END,
    UI_REFERENCE.END_START,
]

export interface UIReference {
    [UI_REFERENCE.START_START]: UIViewId
    [UI_REFERENCE.START_END]: UIViewId
    [UI_REFERENCE.END_END]: UIViewId
    [UI_REFERENCE.END_START]: UIViewId
}

export enum UI_AXIS {
    X,
    Y,
}

export const UI_AXIS_LIST: UI_AXIS[] = [UI_AXIS.X, UI_AXIS.Y]

export interface UIReferenceAxis {
    [UI_AXIS.X]: UIReference
    [UI_AXIS.Y]: UIReference
}

export enum UI_ATTR_AXIS {
    SIZE,
    PERCENT_POS,
    SCROLL,
    CENTER,
    MARGIN_START,
    MARGIN_END,
    PADDING_START,
    PADDING_END,
}

export enum UI_ATTR {
    VISIBILITY,
    ANIMATION_DURATIONS,
}

export interface UIAttrAxis {
    [UI_ATTR_AXIS.SIZE]: string
    [UI_ATTR_AXIS.SCROLL]: boolean
    [UI_ATTR_AXIS.CENTER]: boolean
    [UI_ATTR_AXIS.MARGIN_START]: string
    [UI_ATTR_AXIS.MARGIN_END]: string
    [UI_ATTR_AXIS.PADDING_START]: string
    [UI_ATTR_AXIS.PADDING_END]: string
}

export interface UIAttr {
    [UI_ATTR.VISIBILITY]: UIVisibility
    [UI_ATTR.ANIMATION_DURATIONS]: number[]
}

export enum UI_POSITION {
    SIZE,
    START,
    END,
    START_CHANGED,
    END_CHANGED,
    SCROLL_APPLIED,
    MARGIN_START,
    MARGIN_END,
    PADDING_START,
    PADDING_END,
}

export interface UIPosition {
    [UI_POSITION.SIZE]: number
    [UI_POSITION.START]: number
    [UI_POSITION.END]: number
    [UI_POSITION.START_CHANGED]: boolean
    [UI_POSITION.END_CHANGED]: boolean
    [UI_POSITION.SCROLL_APPLIED]: boolean
    [UI_POSITION.MARGIN_START]: number
    [UI_POSITION.MARGIN_END]: number
    [UI_POSITION.PADDING_START]: number
    [UI_POSITION.PADDING_END]: number
}

export interface UIPositionAxis {
    [UI_AXIS.X]: UIPosition
    [UI_AXIS.Y]: UIPosition
}

export default class UIView {
    public static readonly UI_TAG: string = "ui"

    id: string
    element: UIHTMLElement
    parent: UIView
    screen: UIView

    childrenOrderHor: UIView[] = []
    childrenOrderVer: UIView[] = []
    childrenUI: boolean = true

    order: number = 0
    orderNum: number = 0
    dependenciesHor: string[] = []
    dependenciesVer: string[] = []

    private references: UIReferenceAxis = {
        [UI_AXIS.X]: {
            [UI_REFERENCE.START_START]: "",
            [UI_REFERENCE.START_END]: "",
            [UI_REFERENCE.END_END]: "",
            [UI_REFERENCE.END_START]: "",
        },
        [UI_AXIS.Y]: {
            [UI_REFERENCE.START_START]: "",
            [UI_REFERENCE.START_END]: "",
            [UI_REFERENCE.END_END]: "",
            [UI_REFERENCE.END_START]: "",
        },
    }

    sizeWidth: string = "sc"
    sizeHeight: string = "sc"

    widthValue: number = 0
    heightValue: number = 0

    percentWidthPos: number = 0
    percentHeightPos: number = 0

    scrollVertical: boolean = false
    scrollHorizontal: boolean = false

    centerHor: boolean = false
    centerVer: boolean = false

    marginLeftDimen: string = "0"
    marginTopDimen: string = "0"
    marginRightDimen: string = "0"
    marginBottomDimen: string = "0"

    paddingLeftDimen: string = "0"
    paddingTopDimen: string = "0"
    paddingRightDimen: string = "0"
    paddingBottomDimen: string = "0"

    visibility: string = "v"

    //animations
    animationDurations: number[] = []

    //----- calculated -----

    public positions: UIPositionAxis = {
        [UI_AXIS.X]: {
            [UI_POSITION.SIZE]: 0,
            [UI_POSITION.START]: 0,
            [UI_POSITION.END]: 0,
            [UI_POSITION.START_CHANGED]: false,
            [UI_POSITION.END_CHANGED]: false,
            [UI_POSITION.SCROLL_APPLIED]: false,
            [UI_POSITION.MARGIN_START]: 0,
            [UI_POSITION.MARGIN_END]: 0,
            [UI_POSITION.PADDING_START]: 0,
            [UI_POSITION.PADDING_END]: 0,
        },
        [UI_AXIS.Y]: {
            [UI_POSITION.SIZE]: 0,
            [UI_POSITION.START]: 0,
            [UI_POSITION.END]: 0,
            [UI_POSITION.START_CHANGED]: false,
            [UI_POSITION.END_CHANGED]: false,
            [UI_POSITION.SCROLL_APPLIED]: false,
            [UI_POSITION.MARGIN_START]: 0,
            [UI_POSITION.MARGIN_END]: 0,
            [UI_POSITION.PADDING_START]: 0,
            [UI_POSITION.PADDING_END]: 0,
        },
    }

    //----- Flags for changes -----
    sizeLoaded: boolean = false
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

    public setWidth(w: string) {
        if (w == "sc") {
            this.sizeWidth = w
            this.widthValue = 0
        } else if (String(w).indexOf("%") != -1) {
            var indexPercent = w.indexOf("%")
            this.widthValue = parseFloat(w.substring(0, indexPercent))
            if (indexPercent < w.length - 1) {
                this.percentWidthPos = parseInt(w.substring(indexPercent + 1, w.length), 10)
            }
            this.sizeWidth = "sp" //size_percent
        } else {
            this.widthValue = parseInt(w, 10)
            this.sizeWidth = "s" //sized
        }
        this.sizeLoaded = false
    }

    public setHeight(h: string) {
        if (h == "sc") {
            this.sizeHeight = h
            this.heightValue = 0
        } else if (String(h).indexOf("%") != -1) {
            var indexPercent = h.indexOf("%")
            this.heightValue = parseInt(h.substring(0, indexPercent), 10)
            if (indexPercent < h.length - 1) {
                this.percentHeightPos = parseInt(h.substring(indexPercent + 1, h.length), 10)
            }
            this.sizeHeight = "sp" //size_percent
        } else {
            this.heightValue = parseInt(h, 10)
            this.sizeHeight = "s" //sized
        }
        this.sizeLoaded = false
    }

    // ----- REFERENCES -----

    public setReference(axis: UI_AXIS, ref: UI_REFERENCE, id: string) {
        this.references[axis][ref] = id
        this.sizeLoaded = false
    }

    public getReference(axis: UI_AXIS): UIReference {
        return this.references[axis]
    }

    // ----- SCROLL -----

    private setScrollVertical(value: boolean) {
        this.scrollVertical = value
    }
    private setScrollHorizontal(value: boolean) {
        this.scrollHorizontal = value
    }

    // ----- CENTER -----

    public setCenterVertical(value: boolean) {
        this.centerVer = value
    }
    public setCenterHorizontal(value: boolean) {
        this.centerHor = value
    }

    // ----- MARGIN ------

    public setMargin(margin: string) {
        this.setMargins(margin, margin, margin, margin)
    }

    public setMarginLeft(margin: string) {
        this.marginLeftDimen = margin
        this.sizeLoaded = false
    }

    public setMarginTop(margin: string) {
        this.marginTopDimen = margin
        this.sizeLoaded = false
    }

    public setMarginRight(margin: string) {
        this.marginRightDimen = margin
        this.sizeLoaded = false
    }

    public setMarginBottom(margin: string) {
        this.marginBottomDimen = margin
        this.sizeLoaded = false
    }

    public setMargins(marginLeft: string, marginTop: string, marginRight: string, marginBottom: string) {
        this.marginLeftDimen = marginLeft
        this.marginTopDimen = marginTop
        this.marginRightDimen = marginRight
        this.marginBottomDimen = marginBottom
        this.sizeLoaded = false
    }

    // ----- PADDING -----

    public setPadding(padding: string) {
        this.setPaddings(padding, padding, padding, padding)
    }

    public setPaddingLeft(padding: string) {
        this.paddingLeftDimen = padding
        this.sizeLoaded = false
    }

    public setPaddingTop(padding: string) {
        this.paddingTopDimen = padding
        this.sizeLoaded = false
    }

    public setPaddingRight(padding: string) {
        this.paddingRightDimen = padding
        this.sizeLoaded = false
    }

    public setPaddingBottom(padding: string) {
        this.paddingBottomDimen = padding
        this.sizeLoaded = false
    }

    public setPaddings(paddingLeft: string, paddingTop: string, paddingRight: string, paddingBottom: string) {
        this.paddingLeftDimen = paddingLeft
        this.paddingTopDimen = paddingTop
        this.paddingRightDimen = paddingRight
        this.paddingBottomDimen = paddingBottom
        this.sizeLoaded = false
    }

    // ----- VISIBILITY -----

    public setVisibility(visibility: string) {
        if (visibility != "g" && this.visibility == "g") {
            this.sizeLoaded = false
        }
        this.visibility = visibility
    }

    public cleanSizeLoaded() {
        //clean the sizeLoaded of this view
        this.sizeLoaded = false

        //if it has parent and the size depend of children we clean it too
        if (this.parent != null && (this.parent.sizeHeight == "sc" || this.parent.sizeWidth == "sc")) {
            this.parent.cleanSizeLoaded()
        }
    }

    public hasToBeCalculated(): boolean {
        return this.visibility != "g"
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
        this.forEachChild((child: UIView) => {
            child.animateDependencies(animationDuration)
        })
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

    /**
     * Call to callback for each child with UI
     * @param cb
     */
    public forEachChild(cb: (child: UIView, i: number) => void) {
        var children = UIHTMLElement.getAll(this.element.childNodes)
        for (var i = 0; i < children.length; i++) {
            var child = children[i].ui
            if (child) {
                cb(child, i)
            }
        }
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
        for (const axis of UI_AXIS_LIST) {
            this.clean(axis)
        }
    }

    public clean(axis: UI_AXIS) {
        this.positions[axis][UI_POSITION.START_CHANGED] = false
        this.positions[axis][UI_POSITION.END_CHANGED] = false

        this.positions[axis][UI_POSITION.START] = 0
        this.positions[axis][UI_POSITION.END] = 0
        this.positions[axis][UI_POSITION.SIZE] = 0
    }

    public cleanUI() {
        this.references = {
            [UI_AXIS.X]: {
                [UI_REFERENCE.START_START]: "",
                [UI_REFERENCE.START_END]: "",
                [UI_REFERENCE.END_END]: "",
                [UI_REFERENCE.END_START]: "",
            },
            [UI_AXIS.Y]: {
                [UI_REFERENCE.START_START]: "",
                [UI_REFERENCE.START_END]: "",
                [UI_REFERENCE.END_END]: "",
                [UI_REFERENCE.END_START]: "",
            },
        }

        this.sizeWidth = "sc" //size_content
        this.sizeHeight = "sc" //size_content

        this.widthValue = 0
        this.heightValue = 0

        this.percentWidthPos = 0
        this.percentHeightPos = 0

        this.scrollVertical = false
        this.scrollHorizontal = false

        this.centerHor = false
        this.centerVer = false

        this.marginLeftDimen = "0"
        this.marginTopDimen = "0"
        this.marginRightDimen = "0"
        this.marginBottomDimen = "0"

        this.paddingLeftDimen = "0"
        this.paddingTopDimen = "0"
        this.paddingRightDimen = "0"
        this.paddingBottomDimen = "0"
    }

    public applyDimens(coreConfig: UIConfiguration) {
        this.positions[UI_AXIS.X][UI_POSITION.PADDING_START] = coreConfig.getDimen(this.paddingLeftDimen)
        this.positions[UI_AXIS.X][UI_POSITION.PADDING_END] = coreConfig.getDimen(this.paddingRightDimen)
        this.positions[UI_AXIS.Y][UI_POSITION.PADDING_START] = coreConfig.getDimen(this.paddingTopDimen)
        this.positions[UI_AXIS.Y][UI_POSITION.PADDING_END] = coreConfig.getDimen(this.paddingBottomDimen)

        this.positions[UI_AXIS.X][UI_POSITION.MARGIN_START] = coreConfig.getDimen(this.marginLeftDimen)
        this.positions[UI_AXIS.X][UI_POSITION.MARGIN_END] = coreConfig.getDimen(this.marginRightDimen)
        this.positions[UI_AXIS.Y][UI_POSITION.MARGIN_START] = coreConfig.getDimen(this.marginTopDimen)
        this.positions[UI_AXIS.Y][UI_POSITION.MARGIN_END] = coreConfig.getDimen(this.marginBottomDimen)
    }

    public toString() {
        return (
            "[" +
            this.id +
            "]: ll:" +
            this.references[UI_AXIS.X][UI_REFERENCE.START_START] +
            ", lr:" +
            this.references[UI_AXIS.X][UI_REFERENCE.START_END] +
            ", rr:" +
            this.references[UI_AXIS.X][UI_REFERENCE.END_END] +
            ", rl:" +
            this.references[UI_AXIS.X][UI_REFERENCE.END_START] +
            ", tt:" +
            this.references[UI_AXIS.Y][UI_REFERENCE.START_START] +
            ",tb: " +
            this.references[UI_AXIS.Y][UI_REFERENCE.START_END] +
            ", bb:" +
            this.references[UI_AXIS.Y][UI_REFERENCE.END_END] +
            ", bt:" +
            this.references[UI_AXIS.Y][UI_REFERENCE.END_START] +
            ", ml:" +
            this.positions[UI_AXIS.X][UI_POSITION.MARGIN_START] +
            ", mr:" +
            this.positions[UI_AXIS.X][UI_POSITION.MARGIN_END] +
            ", mt:" +
            this.positions[UI_AXIS.Y][UI_POSITION.MARGIN_START] +
            ",mb: " +
            this.positions[UI_AXIS.Y][UI_POSITION.MARGIN_END] +
            ", pl:" +
            this.positions[UI_AXIS.X][UI_POSITION.PADDING_START] +
            ", pr:" +
            this.positions[UI_AXIS.X][UI_POSITION.PADDING_END] +
            ", pt:" +
            this.positions[UI_AXIS.Y][UI_POSITION.PADDING_START] +
            ", pb:" +
            this.positions[UI_AXIS.Y][UI_POSITION.PADDING_END] +
            ", w:" +
            this.positions[UI_AXIS.X][UI_POSITION.SIZE] +
            ", h:" +
            this.positions[UI_AXIS.Y][UI_POSITION.SIZE] +
            ", sh:" +
            this.sizeWidth +
            ", sh:" +
            this.sizeHeight +
            ", pId:" +
            (this.parent ? this.parent.id : "") +
            ", l:" +
            this.positions[UI_AXIS.X][UI_POSITION.START] +
            ", r:" +
            this.positions[UI_AXIS.X][UI_POSITION.END] +
            ", t:" +
            this.positions[UI_AXIS.Y][UI_POSITION.START] +
            ", b:" +
            this.positions[UI_AXIS.Y][UI_POSITION.END]
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
        var aValues = UIUtils.readAttributes(element.getAttribute(attributeMain))
        for (var i = 0; i < attributes.length; i++) {
            aValues = aValues.concat(UIUtils.readAttributes(element.getAttribute(attributes[i])))
        }

        //check if we have attributes
        if (aValues.length == 0) {
            return
        }

        //set the ui values
        for (var i = 0; i < aValues.length; i++) {
            var attr = aValues[i].attr
            var value = aValues[i].value

            if (attr == "w") {
                this.setWidth(value)
            } else if (attr == "fw") {
                this.setWidth("100%")
            } else if (attr == "h") {
                this.setHeight(value)
            } else if (attr == "fh") {
                this.setHeight("100%")
            } else if (attr == "l") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.START_START, value)
            } else if (attr == "r") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.END_END, value)
            } else if (attr == "t") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.START_START, value)
            } else if (attr == "b") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.END_END, value)
            } else if (attr == "al") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.END_START, value)
            } else if (attr == "ale") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.END_START, value)
                this.setReference(UI_AXIS.Y, UI_REFERENCE.START_START, value)
                this.setReference(UI_AXIS.Y, UI_REFERENCE.END_END, value)
            } else if (attr == "ar") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.START_END, value)
            } else if (attr == "are") {
                this.setReference(UI_AXIS.X, UI_REFERENCE.START_END, value)
                this.setReference(UI_AXIS.Y, UI_REFERENCE.START_START, value)
                this.setReference(UI_AXIS.Y, UI_REFERENCE.END_END, value)
            } else if (attr == "at") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.END_START, value)
            } else if (attr == "ate") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.END_START, value)
                this.setReference(UI_AXIS.X, UI_REFERENCE.START_START, value)
                this.setReference(UI_AXIS.X, UI_REFERENCE.END_END, value)
            } else if (attr == "ab") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.START_END, value)
            } else if (attr == "abe") {
                this.setReference(UI_AXIS.Y, UI_REFERENCE.START_END, value)
                this.setReference(UI_AXIS.X, UI_REFERENCE.START_START, value)
                this.setReference(UI_AXIS.X, UI_REFERENCE.END_END, value)
            } else if (attr == "ml") {
                this.setMarginLeft(value)
            } else if (attr == "mr") {
                this.setMarginRight(value)
            } else if (attr == "mt") {
                this.setMarginTop(value)
            } else if (attr == "mb") {
                this.setMarginBottom(value)
            } else if (attr == "m") {
                var mValues = value.split(",")
                if (mValues.length == 1) {
                    this.setMargins(value, value, value, value)
                } else if (mValues.length == 4) {
                    this.setMargins(mValues[0], mValues[1], mValues[2], mValues[3])
                }
            } else if (attr == "pl") {
                this.setPaddingLeft(value)
            } else if (attr == "pr") {
                this.setPaddingRight(value)
            } else if (attr == "pt") {
                this.setPaddingTop(value)
            } else if (attr == "pb") {
                this.setPaddingBottom(value)
            } else if (attr == "p") {
                var pValues = value.split(",")
                if (pValues.length == 1) {
                    this.setPaddings(value, value, value, value)
                } else if (pValues.length == 4) {
                    this.setPaddings(pValues[0], pValues[1], pValues[2], pValues[3])
                }
            } else if (attr == "cv") {
                this.setCenterVertical(true)
            } else if (attr == "ch") {
                this.setCenterHorizontal(true)
            } else if (attr == "c") {
                this.setCenterVertical(true)
                this.setCenterHorizontal(true)
            } else if (attr == "cui") {
                if (value == "n") {
                    this.childrenUI = false
                } else {
                    this.childrenUI = true
                }
            } else if (attr == "sv") {
                this.setScrollVertical(true)
            } else if (attr == "sh") {
                this.setScrollHorizontal(true)
            } else if (attr == "v") {
                this.setVisibility(value)
            } else if (attr.length > 0) {
                Log.logW("Attribute unknown: " + attr + " in view " + this.id)
            }
        }

        //if no references we add one to the parent: top
        // var refs = false;
        // var references = this.getReferences();
        // for(var i=0; i<references.length; i++){
        // 	if(references[i].length>0){
        // 		refs = true;
        // 		break;
        // 	}
        // }
        const referencesXEmpty = UIView.isReferenceEmpty(this.getReference(UI_AXIS.X))
        if (referencesXEmpty && !this.centerHor) {
            this.setReference(UI_AXIS.X, UI_REFERENCE.START_START, UI_VIEW_ID.PARENT)
        }

        const referencesYEmpty = UIView.isReferenceEmpty(this.getReference(UI_AXIS.Y))
        if (referencesYEmpty && !this.centerVer) {
            this.setReference(UI_AXIS.Y, UI_REFERENCE.START_START, UI_VIEW_ID.PARENT)
        }

        // if(!refs){
        // 	this.setTop(parentId);
        // }
    }

    private static isReferenceEmpty(reference: UIReference): boolean {
        for (const id of UI_REFERENCE_LIST) {
            if (reference[id].length > 0) {
                return false
            }
        }

        // not found
        return true
    }
}
