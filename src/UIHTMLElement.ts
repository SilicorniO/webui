import UIView from "./UIView"

export default class UIHTMLElement extends HTMLElement {
    public ui: UIView

    private constructor() {
        super()
    }

    public static convert(element: HTMLElement, view: UIView): UIHTMLElement {
        const uiElement = element as UIHTMLElement
        uiElement.ui = view
        return uiElement
    }

    public static get(element: HTMLElement | Node | ChildNode): UIHTMLElement | null {
        // check element has ui parameter
        if ((element as any)[UIView.UI_TAG] == null) {
            return null
        }

        return element as UIHTMLElement
    }

    public static getAll(elements: HTMLElement[] | NodeListOf<ChildNode>): UIHTMLElement[] {
        const uiElements: UIHTMLElement[] = []
        if (elements instanceof Array) {
            for (const element of elements) {
                const uiElement = UIHTMLElement.get(element)
                if (uiElement != null) {
                    uiElements.push(uiElement)
                }
            }
        } else {
            ;(elements as NodeListOf<ChildNode>).forEach(node => {
                const uiElement = UIHTMLElement.get(node)
                if (uiElement != null) {
                    uiElements.push(uiElement)
                }
            })
        }

        return uiElements
    }

    public static convertToUIView(uiElements: UIHTMLElement[]): UIView[] {
        const views: UIView[] = []
        for (const uiElement of uiElements) {
            views.push(uiElement.ui)
        }
        return views
    }
}
