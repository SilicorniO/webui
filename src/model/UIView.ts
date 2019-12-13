import UIHTMLElement from "./UIHTMLElement"
import UIConfiguration from "../UIConfiguration"
import UIAttr, { UI_SIZE } from "./UIAttr"
import { AXIS, AXIS_LIST, UIAxisArray, UIAxis } from "./UIAxis"
import UIPosition from "./UIPosition"
import UIDraw from "./UIDraw"
import { UI_VISIBILITY } from "./UIVisibility"
import UIViewAttrs from "./UIViewAttrs"
import UIAttrReader from "../core/read/UIAttrReader"
import { WebUIListener } from "../WebUI"
import UIViewEventsManager from "../core/events/UIViewEventsManager"

export default class UIView {
    public static readonly UI_TAG: string = "ui"

    // Value to incremenet and create auto ids
    private static generatedId: number = 0

    // identifier
    id: string

    // dom element
    element: UIHTMLElement

    // connections with parent and screen
    parent?: UIView
    screen?: UIView

    // associated events manager to this view
    eventsManager: UIViewEventsManager

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
        [AXIS.X]: new UIPosition(),
        [AXIS.Y]: new UIPosition(),
    }

    // ----- Object to draw -----

    public draw: UIDraw

    // ----- Flags for changes -----
    sizeLoaded: boolean = false

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
    constructor(
        element: HTMLElement,
        configuration: UIConfiguration,
        webUIListener: WebUIListener,
        parent?: UIView,
        screen?: UIView,
    ) {
        // assign id to element if it has not one
        if (element.id.length == 0) {
            element.id = "_aID_" + UIView.generatedId
            UIView.generatedId += 1
        }

        this.id = element.id
        this.element = UIHTMLElement.convert(element, this)
        this.parent = parent
        this.screen = screen

        // initialize
        this.attrs = UIAttrReader.readAttrs(this.element, configuration)

        // initialize events manager
        this.eventsManager = new UIViewEventsManager(this, webUIListener, configuration)

        // initialize opacity to 0 to show it when it has the position
        element.style.opacity = "0"

        //if it is an image we prepare to refresh when image is loaded
        if (element.tagName != null && element.tagName.toLowerCase() == "img") {
            element.onload = () => {
                this.eventsManager.launchResizeEvent()
            }
        }
    }

    public evalEvents() {
        this.eventsManager.evalEvents()

        // eval events of all children
        for (const child of this.getUIChildren()) {
            child.evalEvents()
        }
    }

    public disableEvents() {
        this.eventsManager.disableEvents()

        // eval events of all children
        for (const child of this.getUIChildren()) {
            child.disableEvents()
        }
    }

    public setWidth(value: string | number) {
        this.attrs[AXIS.X].setSize("" + value)
        this.eventsManager.launchResizeEvent()
    }

    public setHeight(value: string | number) {
        this.attrs[AXIS.Y].setSize("" + value)
        this.eventsManager.launchResizeEvent()
    }

    // ----- REFERENCES -----

    public getAttrs(axis: AXIS): UIAttr {
        return this.attrs[axis]
    }

    // ----- SCROLL -----

    public setScrollVertical(value: boolean) {
        this.attrs[AXIS.Y].scroll = value
        this.eventsManager.launchResizeEvent()
    }

    public setScrollHorizontal(value: boolean) {
        this.attrs[AXIS.X].scroll = value
        this.eventsManager.launchResizeEvent()
    }

    // ----- CENTER -----

    public setCenter(axis: AXIS, value: boolean) {
        this.attrs[axis].center = value
        this.eventsManager.launchResizeEvent()
    }

    // ----- MARGIN ------

    public setMargin(margin: string, axis?: AXIS) {
        if (axis != null) {
            this.attrs[AXIS.X].setMargin(margin)
            this.attrs[AXIS.Y].setMargin(margin)
        } else {
            this.attrs[axis].setMargin(margin)
        }
        this.eventsManager.launchResizeEvent()
    }

    public setMarginLeft(margin: string | number) {
        this.attrs[AXIS.X].marginStart = "" + margin
        this.eventsManager.launchResizeEvent()
    }

    public setMarginTop(margin: string | number) {
        this.attrs[AXIS.Y].marginStart = "" + margin
        this.eventsManager.launchResizeEvent()
    }

    public setMarginRight(margin: string | number) {
        this.attrs[AXIS.X].marginEnd = "" + margin
        this.eventsManager.launchResizeEvent()
    }

    public setMarginBottom(margin: string | number) {
        this.attrs[AXIS.Y].marginEnd = "" + margin
        this.eventsManager.launchResizeEvent()
    }

    // ----- PADDING -----

    public setPadding(padding: string, axis?: AXIS) {
        if (axis != null) {
            this.attrs[AXIS.X].setPadding(padding)
            this.attrs[AXIS.Y].setPadding(padding)
        } else {
            this.attrs[axis].setPadding(padding)
        }
        this.eventsManager.launchResizeEvent()
    }

    public setPaddingLeft(padding: string | number) {
        this.attrs[AXIS.X].paddingStart = "" + padding
        this.eventsManager.launchResizeEvent()
    }

    public setPaddingTop(padding: string | number) {
        this.attrs[AXIS.Y].paddingStart = "" + padding
        this.eventsManager.launchResizeEvent()
    }

    public setPaddingRight(padding: string | number) {
        this.attrs[AXIS.X].paddingEnd = "" + padding
        this.eventsManager.launchResizeEvent()
    }

    public setPaddingBottom(padding: string | number) {
        this.attrs[AXIS.Y].paddingEnd = "" + padding
        this.eventsManager.launchResizeEvent()
    }

    // ----- VISIBILITY -----

    public setVisibility(visibility: UI_VISIBILITY) {
        if (visibility != UI_VISIBILITY.GONE && this.attrs.visibility == UI_VISIBILITY.GONE) {
            this.sizeLoaded = false
        }
        this.attrs.visibility = visibility
        this.eventsManager.launchResizeEvent()
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
        return this.getUIChildren().length > 0
    }

    // ----- GET ------

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

    // ----- CLEAN ------

    public cleanAllAxis() {
        for (const axis of AXIS_LIST) {
            this.clean(axis)
        }
    }

    public clean(axis: AXIS) {
        this.positions[axis].clean()
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

    // ----- TO STRING ------

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
