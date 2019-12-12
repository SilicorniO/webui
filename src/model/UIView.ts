import UIHTMLElement from "./UIHTMLElement"
import UIConfiguration from "../UIConfiguration"
import UIAttr, { UI_SIZE } from "./UIAttr"
import { AXIS, AXIS_LIST, UIAxisArray, UIAxis } from "./UIAxis"
import UIPosition from "./UIPosition"
import UIDraw from "./UIDraw"
import { UI_VISIBILITY } from "./UIVisibility"
import UIViewAttrs from "./UIViewAttrs"
import UIAttrReader from "../core/read/UIAttrReader"

export default class UIView {
    public static readonly UI_TAG: string = "ui"

    // identifier
    id: string

    // dom element
    element: UIHTMLElement

    // connections with parent and screen
    parent: UIView
    screen: UIView

    // calculated children
    childrenInOrder: boolean = false
    childrenOrder: UIAxisArray<UIView> = {
        [AXIS.X]: [],
        [AXIS.Y]: [],
    }

    // used for order of views
    orderNum: number = 0

    // dependencies used to order views
    dependencies: UIAxisArray<string> = {
        [AXIS.X]: [],
        [AXIS.Y]: [],
    }

    public attrs: UIViewAttrs = new UIViewAttrs()

    // ----- calculated -----

    public positions: UIAxis<UIPosition> = {
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

    // ----- Object to draw -----

    public draw: UIDraw

    // ----- Flags for changes -----
    sizeLoaded: boolean = false
    positionLoaded: boolean = false

    // animations
    animationDurations: number[] = []

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
        this.attrs = UIAttrReader.readAttrs(this.element, attributeMain, attributes)

        //set this instance into the element
        // this.element.ui = this
        this.element["ui"] = this
    }

    public setWidth(value: string | number) {
        this.attrs[AXIS.X].setSize("" + value)
        this.sizeLoaded = false
    }

    public setHeight(value: string | number) {
        this.attrs[AXIS.Y].setSize("" + value)
        this.sizeLoaded = false
    }

    // ----- REFERENCES -----

    public getAttrs(axis: AXIS): UIAttr {
        return this.attrs[axis]
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
            this.attrs[AXIS.X].setMargin(margin)
            this.attrs[AXIS.Y].setMargin(margin)
        } else {
            this.attrs[axis].setMargin(margin)
        }
    }

    public setMarginLeft(margin: string | number) {
        this.attrs[AXIS.X].marginStart = "" + margin
    }

    public setMarginTop(margin: string | number) {
        this.attrs[AXIS.Y].marginStart = "" + margin
    }

    public setMarginRight(margin: string | number) {
        this.attrs[AXIS.X].marginEnd = "" + margin
    }

    public setMarginBottom(margin: string | number) {
        this.attrs[AXIS.Y].marginEnd = "" + margin
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
            this.attrs[AXIS.X].setPadding(padding)
            this.attrs[AXIS.Y].setPadding(padding)
        } else {
            this.attrs[axis].setPadding(padding)
        }
    }

    public setPaddingLeft(padding: string | number) {
        this.attrs[AXIS.X].paddingStart = "" + padding
    }

    public setPaddingTop(padding: string | number) {
        this.attrs[AXIS.Y].paddingStart = "" + padding
    }

    public setPaddingRight(padding: string | number) {
        this.attrs[AXIS.X].paddingEnd = "" + padding
    }

    public setPaddingBottom(padding: string | number) {
        this.attrs[AXIS.Y].paddingEnd = "" + padding
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
        if (visibility != UI_VISIBILITY.GONE && this.attrs.visibility == UI_VISIBILITY.GONE) {
            this.sizeLoaded = false
        }
        this.attrs.visibility = visibility
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
        return this.attrs.visibility != UI_VISIBILITY.GONE
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
        this.attrs[AXIS.X].clean()
        this.attrs[AXIS.Y].clean()
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
            this.attrs[AXIS.X].startStart +
            ", lr:" +
            this.attrs[AXIS.X].startEnd +
            ", rr:" +
            this.attrs[AXIS.X].endEnd +
            ", rl:" +
            this.attrs[AXIS.X].endStart +
            ", tt:" +
            this.attrs[AXIS.Y].startStart +
            ",tb: " +
            this.attrs[AXIS.Y].startEnd +
            ", bb:" +
            this.attrs[AXIS.Y].endEnd +
            ", bt:" +
            this.attrs[AXIS.Y].endStart +
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
}
