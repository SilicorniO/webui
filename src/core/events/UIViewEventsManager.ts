import UIView from "../../model/UIView"
import { WebUIListener } from "../../WebUI"
import UIConfiguration from "../../UIConfiguration"
import UIHTMLElement from "../../model/UIHTMLElement"
import { UI_SIZE } from "../../model/UIAttr"
import Log from "../../utils/log/Log"

export default class UIViewEventsManager {
    // associated screen
    private view: UIView

    // associated listener for redraw events
    webUIListener: WebUIListener

    // associated configuration
    private configuration: UIConfiguration

    // observers
    observerAttributes: MutationObserver | null = null
    observerCharacterData: MutationObserver | null = null
    observerAddRemoveNodes: MutationObserver | null = null

    constructor(view: UIView, webUIListener: WebUIListener, configuration: UIConfiguration) {
        this.view = view
        this.webUIListener = webUIListener
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

    public launchResizeEvent() {
        this.view.sizeLoaded = false
        this.webUIListener.onScreenRedraw(this.view.screen || this.view)
    }

    // ----- PRIVATE -----

    private evalListenAttributes() {
        // remove previous observer
        this.disableListenAttributes()

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
                        Log.log(`Event 'attributes' being processed for view ${this.view.id}`)
                        this.webUIListener.onScreenReinit(this.view.screen || this.view)
                    }
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAttributes = observerAttributes
        observerAttributes.observe(this.view.element, { attributes: true, subtree: false })
    }

    private disableListenAttributes() {
        // remove previous observer
        if (this.observerAttributes != null) {
            this.observerAttributes.disconnect()
        }
    }

    private evalListenCharacterData() {
        // remove previous observer
        this.disableListenCharacterData()

        // check has not children
        if (this.view.element.childNodes.length > 0) {
            return
        }

        // Create an observer instance linked to the callback function
        const observerCharacterData = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (var mutation of mutationsList) {
                if (mutation.type == "characterData") {
                    Log.log(`Event 'characterData' being processed for view ${this.view.id}`)
                    this.webUIListener.onScreenRedraw(this.view.screen || this.view)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerCharacterData = observerCharacterData
        observerCharacterData.observe(this.view.element, { characterData: true, subtree: true })
    }

    private disableListenCharacterData() {
        // remove previous observer
        if (this.observerCharacterData != null) {
            this.observerCharacterData.disconnect()
        }
    }

    private evalListenAddRemoveNodes() {
        // remove previous observer
        this.disableListenAddRemoveNodes()

        // check this view is screen
        if (this.view.parent != null) {
            return
        }

        // Create an observer instance linked to the callback function
        const observerAddRemoveNodes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (var mutation of mutationsList) {
                if (mutation.type == "childList") {
                    Log.log(`Event 'childList' being processed for view ${this.view.id}`)
                    this.webUIListener.onScreenReinit(this.view.screen || this.view)
                }
            }
        })

        // start observing the target node for configured mutations
        this.observerAddRemoveNodes = observerAddRemoveNodes
        observerAddRemoveNodes.observe(this.view.element, { childList: true, subtree: true })
    }

    private disableListenAddRemoveNodes() {
        // remove previous observer
        if (this.observerAddRemoveNodes != null) {
            this.observerAddRemoveNodes.disconnect()
        }
    }

    private resizeEvent() {
        Log.log(`Event 'resize' being processed for view ${this.view.id}`)
        this.launchResizeEvent()
    }

    private evalListenResizeEvents() {
        // disable resize events
        const parentElement = this.disableListenResizeEvents()

        // check this view is screen
        if (this.view.parent != null) {
            return
        }

        // check the size of the view dependes of parent size
        if (this.view.attrs.x.size != UI_SIZE.PERCENTAGE && this.view.attrs.y.size != UI_SIZE.PERCENTAGE) {
            return
        }

        // apply listener
        parentElement.addEventListener("resize", this.resizeEvent.bind(this))
    }

    private disableListenResizeEvents(): HTMLElement | Window {
        // listen events of parent or window
        let parentElement: HTMLElement | Window = this.view.element.parentElement
        if (parentElement == null) {
            parentElement = window
        }

        // remove event by default
        parentElement.removeEventListener("resize", this.resizeEvent.bind(this))

        return parentElement
    }
}
