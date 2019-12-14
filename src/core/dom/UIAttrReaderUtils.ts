import UIAttributeValue from "./UIAttributeValue"
import UIAttr, { UI_REF_LIST } from "../../model/UIAttr"
import { ATTR } from "./UIAttrReader"

export default class UIAttrReaderUtils {
    /**
     * Read the list of attributes received in a text
     * @param text String with the text to parse
     * @return array of objects with key and value
     **/
    static readAttributes(text: string): UIAttributeValue[] {
        //check text is not null
        if (text == null) {
            return []
        }

        //split the text
        const aValues = text.replace(" ", "").split(";")

        //for each value read the value and key adding it to an array
        const aAttributes: UIAttributeValue[] = []
        for (let i = 0; i < aValues.length; i++) {
            const aValue = aValues[i].split(":")
            if (aValue.length == 2) {
                aAttributes.push({
                    attr: aValue[0] as ATTR,
                    value: aValue[1],
                })
            } else if (aValue.length == 1) {
                aAttributes.push({
                    attr: aValue[0] as ATTR,
                })
            }
        }

        //return array of attr-values
        return aAttributes
    }

    static isReferenceEmpty(attrs: UIAttr): boolean {
        for (const id of UI_REF_LIST) {
            if (attrs.getRef(id).length > 0) {
                return false
            }
        }

        // not found
        return true
    }
}
