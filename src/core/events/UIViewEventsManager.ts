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
        // this.evalListenCharacterData()
        this.evalListenResizeEvents()
    }

    public disableEvents() {
        this.disableListenAttributes()
        // this.disableListenCharacterData()
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
        this.view.changeState(UIViewStateChange.ELEMENT_LOADED)
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

    // private evalListenCharacterData() {
    //     // check if we have a listen already created
    //     if (this.observerCharacterData != null) {
    //         return
    //     }

    //     // check has not children
    //     if (this.view.element.childNodes.length > 0) {
    //         return
    //     }

    //     // Create an observer instance linked to the callback function
    //     const observerCharacterData = new MutationObserver((mutationsList: MutationRecord[]) => {
    //         for (const mutation of mutationsList) {
    //             if (mutation.type == "characterData") {
    //                 Log.log(`Event 'characterData' being processed for view ${this.view.id}`)
    //                 this.view.changeState(UIViewStateChange.SIZE, AXIS.X)
    //                 this.view.changeState(UIViewStateChange.SIZE, AXIS.Y)
    //             }
    //         }
    //     })

    //     // start observing the target node for configured mutations
    //     this.observerCharacterData = observerCharacterData
    //     // listen for tree events if it is the last UI view in the tree
    //     observerCharacterData.observe(this.view.element, { characterData: true })
    // }

    // private disableListenCharacterData() {
    //     // remove previous observer
    //     if (this.observerCharacterData != null) {
    //         this.observerCharacterData.disconnect()
    //         this.observerCharacterData = null
    //     }
    // }

    private resizeEvent() {
        Log.log(`Event 'resize' being processed for view ${this.view.id}`)
        this.view.changeState(UIViewStateChange.PARENT_RESIZED)
    }

    private evalListenResizeEvents() {
        // check we have already a resizeEvent
        if (this.observerResizeEvent) {
            return
        }

        // check this view has not children
        if (this.view.hasUIChildren()) {
            return
        }

        // check the size of the view depends of content
        if (this.view.attrs.x.size != UI_SIZE.SIZE_CONTENT && this.view.attrs.y.size != UI_SIZE.SIZE_CONTENT) {
            return
        }

        // apply listener
        this.observerResizeEvent = true
        this.view.element.addEventListener("resize", this.resizeEvent.bind(this))
    }

    private disableListenResizeEvents() {
        // check we have a resizeEvent active
        if (!this.observerResizeEvent) {
            return
        }

        // remove event by default
        this.view.element.removeEventListener("resize", this.resizeEvent.bind(this))
        this.observerResizeEvent = false
    }
}
