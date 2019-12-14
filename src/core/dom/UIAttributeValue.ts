import { ATTR } from "./UIAttrReader"

export default interface UIAttributeValue {
    attr: ATTR
    value?: string | number | boolean
}

export type UIAttributeValueArray = [ATTR, string | number | boolean]
