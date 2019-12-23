import Log from "../../utils/log/Log"
import UIHTMLElement from "../../model/UIHTMLElement"
import { UIViewStateChange } from "../../model/UIView"
import { WebUIListener } from "../../WebUI"
import HtmlUtils from "../../utils/html/HTMLUtils"
import UIConfiguration from "../../UIConfiguration"
import { UIViewState } from "../../model/UIViewState"

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
                    this.evalModifiedDom(mutation)
                } else if (mutation.type == "characterData") {
                    this.evalModifiedData(mutation)
                } else if (mutation.type == "attributes") {
                    this.evalModifiedAttribute(mutation)
                }
            }
        })

        // start observing the body
        observerAddRemoveNodes.observe(bodyElement, {
            childList: true,
            characterData: true,
            attributes: true,
            subtree: true,
        })
    }

    private evalModifiedDom(mutation: MutationRecord) {
        // check it is an HTMLElement
        const element = mutation.target
        if (!(element instanceof HTMLElement)) {
            return
        }

        // list of processed nodes
        const processedNodes: Node[] = []

        // added nodes
        mutation.addedNodes.forEach(addedNode => {
            this.evalAddedNode(addedNode, element)
            processedNodes.push(addedNode)
        })

        // removed nodes
        mutation.removedNodes.forEach(removedNode => {
            if (!processedNodes.includes(removedNode)) {
                this.evalRemovedNode(element)
            }
        })
    }

    private evalAddedNode(node: Node, element: HTMLElement) {
        // if node is not an HTMLElement it is a modification
        if (!(node instanceof HTMLElement)) {
            this.evalModifiedNode(element)
            return
        }

        // check its parent is a UIView
        const uiElement = UIHTMLElement.get(element)
        if (uiElement != null) {
            Log.log(`Event 'addedNode' being processed for view ${uiElement.id}`)
            uiElement.ui.changeState(UIViewStateChange.CHILD_NODE_ADDED)
        }

        // search for screens from parent element
        this.webUIListener.onElementDiscover(element)
    }

    private evalRemovedNode(element: HTMLElement) {
        Log.log("Event 'removedNode' being processed from body. Element: " + element.id)

        // check its parent is a UIView
        const uiElement = UIHTMLElement.get(element)
        if (uiElement != null) {
            uiElement.ui.changeState(UIViewStateChange.CHILD_NODE_REMOVED)
            return
        }

        // search for previous UI view, if exists we change the state to dom
        const previousUIElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, element)
        if (previousUIElement == null) {
            // one of the main screen without UI parents, we don't need to do anything
            return
        }

        // convert to ui element
        const previousUiElement = UIHTMLElement.get(previousUIElement)
        if (previousUiElement == null) {
            Log.logE("UNEXPECTED: element has the UI attribute but it is not initialized")
            return
        }

        // change state of previous element because size might have changed
        Log.log(`Event 'removedNode' being processed for view ${previousUiElement.id}`)
        previousUiElement.ui.changeState(UIViewStateChange.CHILD_NODE_REMOVED)
    }

    private evalModifiedNode(element: HTMLElement) {
        // search for previous UI view, if exists we change the state to dom
        const previousUiElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, element)
        if (previousUiElement == null) {
            // one of the main screen without UI parents, we don't need to do anything
            return
        }

        // convert to ui element
        const uiElement = UIHTMLElement.get(previousUiElement)
        if (uiElement == null) {
            Log.logE("UNEXPECTED: element has the UI attribute but it is not initialized")
            return
        }

        // change state of previous element because size might have changed
        Log.log(`Event 'modifiedaNode' being processed for view ${uiElement.id}`)
        uiElement.ui.changeState(UIViewStateChange.CHILD_NODE_ADDED)
    }

    private evalModifiedData(mutation: MutationRecord) {
        // get parent element
        const parentElement = mutation.target.parentElement
        if (!(parentElement instanceof HTMLElement)) {
            return
        }

        // search for previous UI view, if exists we change the state to dom
        const previousUIElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, parentElement)
        if (previousUIElement == null) {
            // one of the main screen without UI parents, we don't need to do anything
            return
        }

        // check its parent is a UIView
        const uiNode = UIHTMLElement.get(parentElement)
        if (uiNode == null) {
            return
        }

        Log.log(`Event 'modifiedaData' being processed for view ${uiNode.id}`)
        uiNode.ui.changeState(UIViewStateChange.ATTRIBUTE_MODIFIED)
    }

    private evalModifiedAttribute(mutation: MutationRecord) {
        // check it is an HTMLElement
        const element = mutation.target
        if (!(element instanceof HTMLElement)) {
            return
        }

        // get attribute
        const attributeName = mutation.attributeName || ""

        // convert to uiElement to not check all dom if not necessary
        const uiElement = UIHTMLElement.get(element)

        // if we have style attribute and it is a UI attribute we dismiss it because should not be used
        if (attributeName === "style" && uiElement != null) {
            return
        }

        // check is a interested attribute
        if (
            attributeName !== "id" &&
            attributeName !== "class" &&
            attributeName !== this.configuration.attribute &&
            !this.configuration.attributes.includes(attributeName)
        ) {
            return
        }

        // if no ui element we search for parent to mark as modidied the dom
        if (uiElement == null) {
            // search for previous UI view, if exists we change the state to dom
            const previousUIElement = HtmlUtils.getPreviousElementWithAttribute(this.configuration.attribute, element)
            if (previousUIElement == null) {
                // one of the main screen without UI parents, we don't need to do anything
                return
            }

            // check its parent is a UIView
            const previousUiElement = UIHTMLElement.get(previousUIElement)
            if (previousUiElement == null) {
                return
            }

            Log.log(`Event 'modifiedAttributeInside' being processed for view ${previousUiElement.id}`)
            previousUiElement.ui.changeState(UIViewStateChange.CHILD_NODE_MODIFIED)
            return
        }

        // check the view has been calculated
        if (uiElement.ui.getState() <= UIViewState.NONE) {
            return
        }

        Log.log(
            `Event 'modifiedAttribute' '${attributeName}' being processed for view ${
                uiElement.id
            } - ${uiElement.ui.getState()}`,
        )
        uiElement.ui.eventsManager.evalAttributeModified(attributeName)
    }
}
