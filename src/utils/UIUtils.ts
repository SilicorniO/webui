import UIView from "../UIView"
import UIHTMLElement from "../UIHTMLElement"

/**
 * @constructor
 */
export default class UIUtils {
    /**
     * Read the list of attributes received in a text
     * @param text String with the text to parse
     * @return array of objects with key and value
     **/
    public static readAttributes(text: string): { [key: string]: string }[] {
        //check text is not null
        if (text == null) {
            return []
        }

        //split the text
        var aValues = text.replace(" ", "").split(";")

        //for each value read the value and key adding it to an array
        var aAttributes: { [key: string]: string }[] = []
        for (var i = 0; i < aValues.length; i++) {
            var aValue = aValues[i].split(":")
            if (aValue.length == 2) {
                aAttributes.push({ attr: aValue[0], value: aValue[1] })
            } else if (aValue.length == 1) {
                aAttributes.push({ attr: aValue[0], value: "" })
            }
        }

        //return array of attr-values
        return aAttributes
    }

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
