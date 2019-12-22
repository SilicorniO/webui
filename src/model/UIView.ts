import UIHTMLElement from "./UIHTMLElement"
import UIConfiguration from "../UIConfiguration"
import UIAttr, { UIAttrCleanOptions } from "./UIAttr"
import { AXIS, UIAxisArray, UIAxis } from "./UIAxis"
import UIPosition from "./UIPosition"
import UIDraw, { UIDrawAnimation } from "./UIDraw"
import { UI_VISIBILITY } from "./UIVisibility"
import UIViewAttrs from "./UIViewAttrs"
import UIAttrReader, { ATTR } from "../core/dom/UIAttrReader"
import { WebUIListener } from "../WebUI"
import UIViewEventsManager from "../core/events/UIViewEventsManager"
import { UIAttributeValueArray } from "../core/dom/UIAttributeValue"
import UIViewStateManager from "../core/state/UIViewStateManager"
import { UIViewState } from "./UIViewState"

export enum UIViewStateChange {
    NONE,
    ALL,
    SIZE,
    SIZE_POS,
    START,
    END,
    CENTER,
    MARGIN_START,
    MARGIN_END,
    PADDING_START,
    PADDING_END,
    OVERFLOW,
    VISIBILITY,
    VISIBILITY_GONE,
    CHILD_NODE_ADDED,
    CHILD_NODE_REMOVED,
    CHILD_NODE_MODIFIED,
    PARENT_RESIZED,
    ATTRIBUTE_MODIFIED,
    ELEMENT_LOADED,
}

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
    dependenciesMap: { [key: string]: UIView } = {}

    public attrs: UIViewAttrs = new UIViewAttrs()

    // ----- calculated -----
    public positions: UIAxis<UIPosition> = {
        [AXIS.X]: new UIPosition(),
        [AXIS.Y]: new UIPosition(),
    }

    // ----- Object to draw -----
    public draw: UIDraw

    // ----- Flags for changes -----
    private stateManager: UIViewStateManager

    // animations
    animations: UIDrawAnimation[] = []

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

        // initialize events manager
        this.eventsManager = new UIViewEventsManager(this, configuration)
        this.stateManager = new UIViewStateManager(this, webUIListener)

        // initialize opacity to 0 to show it when it has the position
        element.style.opacity = "0"

        //if it is an image we prepare to refresh when image is loaded
        if (element.tagName != null && element.tagName.toLowerCase() == "img") {
            element.onload = () => {
                this.eventsManager.onLoadElement()
            }
        }
    }

    // ----- STATE ----

    public setState(state: UIViewState) {
        this.stateManager.setState(state)
    }

    public changeState(change: UIViewStateChange, axis?: AXIS): UIView | null {
        return this.stateManager.changeState(change, axis)
    }

    public getState(): UIViewState {
        return this.stateManager.getState()
    }

    // ----- REFRESH -----

    public forceRefresh() {
        this.stateManager.changeState(UIViewStateChange.ALL)
    }

    // ----- SET ATTRIBUTE -----

    public setAttrs(attributes: UIAttributeValueArray[], animationDuration?: number, animationEnd?: () => void) {
        // apply attributes
        for (let i = 0; i < attributes.length; i += 1) {
            const attribute = attributes[i]
            if (i == 0) {
                // apply animation to last one
                this.setAttr(attribute[0], attribute[1], animationDuration, animationEnd)
            } else {
                this.setAttr(attribute[0], attribute[1])
            }
        }
    }

    public setAttr(
        attribute: ATTR,
        value?: string | number | boolean,
        animationDuration?: number,
        animationEnd?: () => void,
    ) {
        // get a copy of the attributes
        let previousAttributes = this.attrs.clone()

        // apply attribute
        this.applyAttribute(attribute, value)

        // apply animation
        this.animateNextRefresh(animationDuration, animationEnd)

        // launch resize event
        this.eventsManager.onChangeAttribute(attribute, previousAttributes, value)
    }

    private applyAttribute(attribute: ATTR, value?: string | number | boolean) {
        // apply attribute
        UIAttrReader.readUIAttribute(
            this.attrs,
            {
                attr: attribute,
                value,
            },
            this.id,
        )
    }

    public cleanAttrs(options: UIAttrCleanOptions) {
        // clean attributes
        this.attrs.clean(options)
    }

    // ----- REFERENCES -----

    public getAttrs(axis: AXIS): UIAttr {
        return this.attrs[axis]
    }

    // ----- VISIBILITY -----

    public isGone(): boolean {
        return this.attrs.visibility == UI_VISIBILITY.GONE
    }

    // Animations

    private animateNextRefresh(animationDuration?: number, animationEnd?: () => void) {
        // check animation duration is valid
        if (animationDuration == null) {
            return
        }

        // generate next animation
        const animation = new UIDrawAnimation()
        animation.duration = animationDuration
        animation.onEnd = animationEnd || null

        //animate this
        this.animations.push(animation)
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
        const children = UIHTMLElement.getAll(this.element.childNodes)
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
        for (let i = 0; i < childNodes.length; i++) {
            const child = UIHTMLElement.get(childNodes[i])
            if (child != null) {
                if (child.id == this.id) {
                    return previousView
                } else if (!child.ui.isGone()) {
                    previousView = child.ui
                }
            }
        }

        //not found
        return null
    }

    // ----- CLEAN ------

    public clean(axis: AXIS) {
        this.positions[axis].clean()
    }

    public cleanUI() {
        this.attrs[AXIS.X].clean()
        this.attrs[AXIS.Y].clean()
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
