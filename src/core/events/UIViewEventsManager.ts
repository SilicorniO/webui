import UIView, { UIViewStateChange } from "../../model/UIView"
import UIConfiguration from "../../UIConfiguration"
import { UI_SIZE } from "../../model/UIAttr"
import Log from "../../utils/log/Log"
import UIAttrReader, { ATTR } from "../dom/UIAttrReader"
import UIViewEventsUtils from "./UIViewEventsUtils"
import { AXIS, AXIS_LIST } from "../../model/UIAxis"
import UIViewAttrs from "../../model/UIViewAttrs"

export default class UIViewEventsManager {
    // associated screen
    private view: UIView

    // associated configuration
    private configuration: UIConfiguration

    // observers
    private observerAttributes: MutationObserver | null = null
    private observerCharacterData: MutationObserver | null = null
    private observerAddRemoveNodes: MutationObserver | null = null
    private observerAddRemoveNodesTree: boolean = false
    private observerResizeEvent: boolean = false

    // flag to disable next ui attribute mutation
    private dismissNextUiAttributeMutation: boolean = false

    constructor(view: UIView, configuration: UIConfiguration) {
        this.view = view
        this.configuration = configuration
    }

    // ----- PUBLIC -----

    public evalEvents() {
        this.evalListenAttributes()
        this.evalListenCharacterData()
        this.evalListenAddRemoveNodes()
        this.evalListenResizeEvents()
    }

    public disableEvents() {
        this.disableListenAttributes()
        this.disableListenCharacterData()
        this.disableListenAddRemoveNodes()
        this.disableListenResizeEvents()
    }

    public onChangeAttribute(attribute: ATTR, previousAttributes: UIViewAttrs, value?: string | number | boolean) {
        // update ui attribute
        this.dismissNextUiAttributeMutation = true
        this.view.element.setAttribute(this.configuration.attribute, UIAttrReader.generateUiAttr(this.view.attrs))

        // launch change of state
        const aStateChangeAndAxis = UIViewEventsUtils.convertAttrToStateChangeWithAxis(
            attribute,
            previousAttributes,
            value,
        )
        for (const stateChangeAndAxis of aStateChangeAndAxis) {
            this.view.changeState(stateChangeAndAxis.stateChange, stateChangeAndAxis.axis)
        }
    }

    public onLoadElement() {
        for (const axis of AXIS_LIST) {
            this.view.changeState(UIViewStateChange.SIZE, axis)
        }
    }

    // ----- PRIVATE -----

    private evalListenAttributes() {
        // check if we have a listen already created
        if (this.observerAttributes != null) {
            return
        }

        // Create an observer instance linked to the callback function
        const observerAttributes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "attributes") {
                    const attributeName = mutation.attributeName
                    if (attributeName != null) {
                        if (
                            attributeName == "id" ||
                            attributeName == "class" ||
                            attributeName == this.configuration.attribute ||
                            this.configuration.attributes.includes(attributeName)
                        ) {
                            // check if we have to dismiss it because it is our change
                            if (attributeName == this.configuration.attribute && this.dismissNextUiAttributeMutation) {
                                this.dismissNextUiAttributeMutation = false
                                return
                            }

                            Log.log(`Event 'attributes' being processed for view ${this.view.id}`)
                            this.view.changeState(UIViewStateChange.ATTRIBUTE_MODIFIED)
                        }
                    }
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAttributes = observerAttributes
        observerAttributes.observe(this.view.element, { attributes: true })
    }

    private disableListenAttributes() {
        // remove previous observer
        if (this.observerAttributes != null) {
            this.observerAttributes.disconnect()
            this.observerAttributes = null
        }
    }

    private evalListenCharacterData() {
        // check if we have a listen already created
        if (this.observerCharacterData != null) {
            return
        }

        // check has not children
        if (this.view.element.childNodes.length > 0) {
            return
        }

        // Create an observer instance linked to the callback function
        const observerCharacterData = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "characterData") {
                    Log.log(`Event 'characterData' being processed for view ${this.view.id}`)
                    this.view.changeState(UIViewStateChange.SIZE, AXIS.X)
                    this.view.changeState(UIViewStateChange.SIZE, AXIS.Y)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerCharacterData = observerCharacterData
        // listen for tree events if it is the last UI view in the tree
        observerCharacterData.observe(this.view.element, { characterData: true })
    }

    private disableListenCharacterData() {
        // remove previous observer
        if (this.observerCharacterData != null) {
            this.observerCharacterData.disconnect()
            this.observerCharacterData = null
        }
    }

    private evalListenAddRemoveNodes() {
        // check if nodestree has changed, we disable the actual observer
        const observerAddRemoveNodesTree = !this.view.hasUIChildren()
        if (this.observerAddRemoveNodesTree != observerAddRemoveNodesTree) {
            this.disableListenAddRemoveNodes()
        }

        // check if we have a listen already created
        if (this.observerAddRemoveNodes != null) {
            return
        }

        // remove previous observer
        this.disableListenAddRemoveNodes()

        // Create an observer instance linked to the callback function
        const observerAddRemoveNodes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList") {
                    Log.log(`Event 'childList' being processed for view ${this.view.id}`)
                    this.view.changeState(UIViewStateChange.CHILD_NODE_ADDED)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAddRemoveNodesTree = observerAddRemoveNodesTree
        this.observerAddRemoveNodes = observerAddRemoveNodes
        observerAddRemoveNodes.observe(this.view.element, { childList: true, subtree: observerAddRemoveNodesTree })
    }

    private disableListenAddRemoveNodes() {
        // remove previous observer
        if (this.observerAddRemoveNodes != null) {
            this.observerAddRemoveNodes.disconnect()
            this.observerAddRemoveNodes = null
        }
    }

    private resizeEvent() {
        Log.log(`Event 'resize' being processed for view ${this.view.id}`)
        this.view.changeState(UIViewStateChange.PARENT_RESIZED)
    }

    private evalListenResizeEvents() {
        // disable resize events
        let parentElement: HTMLElement | Window | null = this.view.element.parentElement
        if (parentElement == null) {
            parentElement = window || null
        }
        if (parentElement == null) {
            Log.logE("Window events can't be catched")
            return
        }

        // check we have already a resizeEvent
        if (this.observerResizeEvent) {
            return
        }

        // check this view is screen
        if (this.view.parent != null) {
            return
        }

        // check the size of the view dependes of parent size
        if (this.view.attrs.x.size != UI_SIZE.PERCENTAGE && this.view.attrs.y.size != UI_SIZE.PERCENTAGE) {
            return
        }

        // apply listener
        this.observerResizeEvent = true
        parentElement.addEventListener("resize", this.resizeEvent.bind(this))
    }

    private disableListenResizeEvents(): HTMLElement | Window | null {
        // listen events of parent or window
        let parentElement: HTMLElement | Window | null = this.view.element.parentElement
        if (parentElement == null) {
            parentElement = window || null
        }
        if (parentElement == null) {
            Log.logE("Window events can't be catched")
            return null
        }

        // remove event by default
        parentElement.removeEventListener("resize", this.resizeEvent.bind(this))
        this.observerResizeEvent = false

        return parentElement
    }
}
