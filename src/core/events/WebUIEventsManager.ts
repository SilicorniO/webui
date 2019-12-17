import Log from "../../utils/log/Log"
import UIHTMLElement from "../../model/UIHTMLElement"
import { UIViewStateChange } from "../../model/UIView"
import { WebUIListener } from "../../WebUI"
import HtmlUtils from "../../utils/html/HTMLUtils"
import UIConfiguration from "../../UIConfiguration"

export default class WebUIEventsManager {
    private webUIListener: WebUIListener
    private configuration: UIConfiguration

    constructor(webUIListener: WebUIListener) {
        this.webUIListener = webUIListener
    }

    public init(bodyElement: HTMLElement, configuration: UIConfiguration) {
        // save configuration
        this.configuration = configuration

        // create observer
        const observerAddRemoveNodes = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList") {
                    // check it is an HTMLElement
                    const parentElement = mutation.target
                    if (parentElement instanceof HTMLElement) {
                        // list of processed nodes
                        const processedNodes: Node[] = []

                        // added nodes
                        mutation.addedNodes.forEach(addedNode => {
                            this.evalAddedNode(addedNode, parentElement)
                            processedNodes.push(addedNode)
                        })

                        // removed nodes
                        mutation.removedNodes.forEach(removedNode => {
                            if (!processedNodes.includes(removedNode)) {
                                this.evalRemovedNode(parentElement)
                            }
                        })
                    }
                }
                // if (mutation.type == "characterData") {
                // }
            }
        })

        // start observing the body
        observerAddRemoveNodes.observe(bodyElement, { childList: true, /*characterData: true, */ subtree: true })
    }

    private evalAddedNode(node: Node, parentElement: HTMLElement) {
        // if node is not an HTMLElement it is a modification
        if (!(node instanceof HTMLElement)) {
            this.evalModifiedNode(parentElement)
            return
        }

        // check it is an HTMLElement
        Log.log("Event 'addedNode' being processed from body")

        // check its parent is a UIView
        const uiParentNode = UIHTMLElement.get(parentElement)
        if (uiParentNode != null) {
            uiParentNode.ui.changeState(UIViewStateChange.CHILD_NODE_ADDED)
            return
        }

        // search for screens from parent element
        this.webUIListener.onElementDiscover(parentElement)
    }

    private evalRemovedNode(parentElement: HTMLElement) {
        Log.log("Event 'removedNode' being processed from body")

        // check its parent is a UIView
        const uiParentNode = UIHTMLElement.get(parentElement)
        if (uiParentNode != null) {
            uiParentNode.ui.changeState(UIViewStateChange.CHILD_NODE_REMOVED)
            return
        }

        // search for previous UI view, if exists we change the state to dom
        const previousUIElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, parentElement)
        if (previousUIElement == null) {
            // one of the main screen without UI parents, we don't need to do anything
            return
        }

        // convert to ui element
        const uiElement = UIHTMLElement.get(previousUIElement)
        if (uiElement == null) {
            Log.logE("UNEXPECTED: element has the UI attribute but it is not initialized")
            return
        }

        // change state of previous element because size might have changed
        uiElement.ui.changeState(UIViewStateChange.CHILD_NODE_REMOVED)
    }

    private evalModifiedNode(parentElement: HTMLElement) {
        Log.log("Event 'modifiedNode' being processed from body")

        // search for previous UI view, if exists we change the state to dom
        const previousUIElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, parentElement)
        if (previousUIElement == null) {
            // one of the main screen without UI parents, we don't need to do anything
            return
        }

        // convert to ui element
        const uiElement = UIHTMLElement.get(previousUIElement)
        if (uiElement == null) {
            Log.logE("UNEXPECTED: element has the UI attribute but it is not initialized")
            return
        }

        // change state of previous element because size might have changed
        uiElement.ui.changeState(UIViewStateChange.CHILD_NODE_ADDED)
    }
}
