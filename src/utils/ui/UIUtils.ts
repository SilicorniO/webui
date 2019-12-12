import UIView from "../../model/UIView"
import UIHTMLElement from "../../model/UIHTMLElement"

/**
 * @constructor
 */
export default class UIUtils {
    /**
     * From the given node get the previous UIScreen if there was one
     * @param {*} node
     * @return {UIView} previous screen
     */
    public static getPreviousUIScreen(nodeUI: UIView): UIView {
        if (nodeUI != null && nodeUI.screen) {
            return nodeUI.screen
        } else {
            return nodeUI
        }
    }

    /**
     * From the given node get the previous UIView if there was one
     * @param {*} node
     * @return {UIView} previous UIView
     */
    public static getPreviousUIView(node: Node): UIView {
        const uiNode = UIHTMLElement.get(node)
        if (uiNode != null) {
            return uiNode.ui
        }

        if (node.parentNode != null) {
            return this.getPreviousUIView(node.parentNode)
        } else {
            return null
        }
    }
}
