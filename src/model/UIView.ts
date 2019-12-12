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

    // listener for redraw events
    webUIListener: WebUIListener

    // associated configuration
    private configuration: UIConfiguration

    // observers
    observerAttributes: MutationObserver | null = null
    observerCharacterData: MutationObserver | null = null
    observerAddRemoveNodes: MutationObserver | null = null

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

        this.webUIListener = webUIListener
        this.id = element.id
        this.element = UIHTMLElement.convert(element, this)
        this.parent = parent
        this.screen = screen
        this.configuration = configuration

        //initialize
        this.attrs = UIAttrReader.readAttrs(this.element, configuration)

        // initialize opacity to 0 to show it when it has the position
        element.style.opacity = "0"

        //if it is an image we prepare to refresh when image is loaded
        if (element.tagName != null && element.tagName.toLowerCase() == "img") {
            element.onload = () => {
                this.resizeEvent()
            }
        }
    }

    public evalEvents() {
        this.evalListenAttributes()
        this.evalListenCharacterData()
        this.evalListenAddRemoveNodes()
        this.evalListenResizeEvents()

        // eval events of all children
        for (const child of this.getUIChildren()) {
            child.evalEvents()
        }
    }

    private evalListenAttributes() {
        // remove previous observer
        if (this.observerAttributes != null) {
            this.observerAttributes.disconnect()
        }

        // Create an observer instance linked to the callback function
        const observerAttributes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "attributes") {
                    const attributeName = mutation.attributeName
                    if (
                        attributeName == "id" ||
                        attributeName == "class" ||
                        attributeName == this.configuration.attribute ||
                        this.configuration.attributes.includes(attributeName)
                    ) {
                        this.webUIListener.onScreenReinit(this.screen || this)
                    }
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAttributes = observerAttributes
        observerAttributes.observe(this.element, { attributes: true, subtree: false })
    }

    private evalListenCharacterData() {
        // remove previous observer
        if (this.observerCharacterData != null) {
            this.observerCharacterData.disconnect()
        }

        // check has not children
        if (this.element.childNodes.length > 0) {
            return
        }

        // Create an observer instance linked to the callback function
        const observerCharacterData = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (var mutation of mutationsList) {
                if (mutation.type == "characterData") {
                    this.webUIListener.onScreenRedraw(this.screen || this)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerCharacterData = observerCharacterData
        observerCharacterData.observe(this.element, { characterData: true, subtree: true })
    }

    private evalListenAddRemoveNodes() {
        // remove previous observer
        if (this.observerAddRemoveNodes != null) {
            this.observerAddRemoveNodes.disconnect()
        }

        // Create an observer instance linked to the callback function
        const observerAddRemoveNodes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (var mutation of mutationsList) {
                if (mutation.type == "childList") {
                    this.webUIListener.onScreenReinit(this.screen || this)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAddRemoveNodes = observerAddRemoveNodes
        observerAddRemoveNodes.observe(this.element, { childList: true, subtree: true })
    }

    private resizeEvent() {
        this.sizeLoaded = false
        this.webUIListener.onScreenRedraw(this.screen || this)
    }

    private evalListenResizeEvents() {
        // listen events of parent or window
        let parentElement: HTMLElement | Window = this.element.parentElement
        if (parentElement == null) {
            parentElement = window
        }

        // remove event by default
        parentElement.removeEventListener("resize", this.resizeEvent.bind(this))

        // check this view is screen
        if (this.parent != null) {
            return
        }

        // check the size of the view dependes of parent size
        if (this.attrs.x.size != UI_SIZE.PERCENTAGE && this.attrs.y.size != UI_SIZE.PERCENTAGE) {
            return
        }

        // apply listener
        parentElement.addEventListener("resize", this.resizeEvent.bind(this))
    }

    public setWidth(value: string | number) {
        this.attrs[AXIS.X].setSize("" + value)
        this.sizeLoaded = false
        this.resizeEvent()
    }

    public setHeight(value: string | number) {
        this.attrs[AXIS.Y].setSize("" + value)
        this.sizeLoaded = false
        this.resizeEvent()
    }

    // ----- REFERENCES -----

    public getAttrs(axis: AXIS): UIAttr {
        return this.attrs[axis]
    }

    // ----- SCROLL -----

    public setScrollVertical(value: boolean) {
        this.attrs[AXIS.Y].scroll = value
        this.resizeEvent()
    }

    public setScrollHorizontal(value: boolean) {
        this.attrs[AXIS.X].scroll = value
        this.resizeEvent()
    }

    // ----- CENTER -----

    public setCenter(axis: AXIS, value: boolean) {
        this.attrs[axis].center = value
        this.resizeEvent()
    }

    // ----- MARGIN ------

    public setMargin(margin: string, axis?: AXIS) {
        if (axis != null) {
            this.attrs[AXIS.X].setMargin(margin)
            this.attrs[AXIS.Y].setMargin(margin)
        } else {
            this.attrs[axis].setMargin(margin)
        }
        this.resizeEvent()
    }

    public setMarginLeft(margin: string | number) {
        this.attrs[AXIS.X].marginStart = "" + margin
        this.resizeEvent()
    }

    public setMarginTop(margin: string | number) {
        this.attrs[AXIS.Y].marginStart = "" + margin
        this.resizeEvent()
    }

    public setMarginRight(margin: string | number) {
        this.attrs[AXIS.X].marginEnd = "" + margin
        this.resizeEvent()
    }

    public setMarginBottom(margin: string | number) {
        this.attrs[AXIS.Y].marginEnd = "" + margin
        this.resizeEvent()
    }

    // ----- PADDING -----

    public setPadding(padding: string, axis?: AXIS) {
        if (axis != null) {
            this.attrs[AXIS.X].setPadding(padding)
            this.attrs[AXIS.Y].setPadding(padding)
        } else {
            this.attrs[axis].setPadding(padding)
        }
        this.resizeEvent()
    }

    public setPaddingLeft(padding: string | number) {
        this.attrs[AXIS.X].paddingStart = "" + padding
        this.resizeEvent()
    }

    public setPaddingTop(padding: string | number) {
        this.attrs[AXIS.Y].paddingStart = "" + padding
        this.resizeEvent()
    }

    public setPaddingRight(padding: string | number) {
        this.attrs[AXIS.X].paddingEnd = "" + padding
        this.resizeEvent()
    }

    public setPaddingBottom(padding: string | number) {
        this.attrs[AXIS.Y].paddingEnd = "" + padding
        this.resizeEvent()
    }

    // ----- VISIBILITY -----

    public setVisibility(visibility: UI_VISIBILITY) {
        if (visibility != UI_VISIBILITY.GONE && this.attrs.visibility == UI_VISIBILITY.GONE) {
            this.sizeLoaded = false
        }
        this.attrs.visibility = visibility
        this.resizeEvent()
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
