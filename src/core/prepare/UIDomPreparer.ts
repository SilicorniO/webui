import UIConfiguration from "../../UIConfiguration"
import { WebUIListener } from "../../WebUI"
import UIView, { UIViewState } from "../../model/UIView"
import UIHTMLElement from "../../model/UIHTMLElement"

export default class UIDomPreparer {
    public static discoverScreens(
        element: HTMLElement,
        config: UIConfiguration,
        webUIListener: WebUIListener,
        listener: (screen: UIView) => void,
        parentUi: boolean = false,
    ) {
        // flag to know if this element is a screen
        let isScreen = false

        // check if it has UI attribute
        if (element.hasAttribute(config.attribute) && !parentUi) {
            // generate screen
            const screen = new UIView(element, config, webUIListener)

            // screen was discovered
            listener(screen)

            // mark element as screen
            isScreen = true
        }

        // no UI, search in children
        element.childNodes.forEach(child => {
            if (child instanceof HTMLElement) {
                UIDomPreparer.discoverScreens(child, config, webUIListener, listener, isScreen)
            }
        })
    }

    public static prepareDom(
        element: HTMLElement,
        config: UIConfiguration,
        webUIListener: WebUIListener,
        parent: UIView,
        screen: UIView,
    ) {
        // check element is a UIView, in that case we do something different
        const uiElement = UIHTMLElement.get(element)
        if (uiElement != null) {
            const view = uiElement.ui
            // search if it is ecessary in the rest of the dom
            if (view.getState() == UIViewState.NOT_STARTED) {
                // generate views of all children
                element.childNodes.forEach(child => {
                    if (child instanceof HTMLElement) {
                        UIDomPreparer.prepareDom(child, config, webUIListener, view, screen)
                    }
                })

                // update state of the view
                view.setState(UIViewState.DOM_PREPARED)
            }
            return
        }

        // check element has attribute, else we stop here
        if (!element.hasAttribute(config.attribute)) {
            return
        }

        // generate the view
        const view = new UIView(element, config, webUIListener, parent, screen)

        // generate views of all children
        element.childNodes.forEach(child => {
            if (child instanceof HTMLElement) {
                UIDomPreparer.prepareDom(child, config, webUIListener, view, screen)
            }
        })

        // update state of the view
        view.setState(UIViewState.DOM_PREPARED)
    }

    public static clearUIDom(element: Node) {
        //delete the UI element and childrens
        delete (element as any).ui

        // delete the UI from children
        element.childNodes.forEach(childNode => {
            UIDomPreparer.clearUIDom(childNode)
        })
    }
}
