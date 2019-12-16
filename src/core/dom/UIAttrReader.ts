import { UI_REF, UI_VIEW_ID, UI_SIZE } from "../../model/UIAttr"
import UIAttrReaderUtils from "./UIAttrReaderUtils"
import UIView from "../../model/UIView"
import UIAttributeValue from "./UIAttributeValue"
import UIViewAttrs from "../../model/UIViewAttrs"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import Log from "../../utils/log/Log"
import UIConfiguration from "../../UIConfiguration"

export enum ATTR {
    NONE = "",
    WIDTH = "w",
    FULL_WIDTH = "fw",
    HEIGHT = "h",
    FULL_HEIGHT = "fh",
    LEFT = "l",
    RIGHT = "r",
    TOP = "t",
    BOTTOM = "b",
    AT_LEFT = "al",
    AT_LEFT_EQUAL = "ale",
    AT_RIGHT = "ar",
    AT_RIGHT_EQUAL = "are",
    AT_TOP = "at",
    AT_TOP_EQUAL = "ate",
    AT_BOTTOM = "ab",
    AT_BOTTOM_EQUAL = "abe",
    MARGIN_LEFT = "ml",
    MARGIN_TOP = "mt",
    MARGIN_RIGHT = "mr",
    MARGIN_BOTTOM = "mb",
    MARGIN = "m",
    PADDING_LEFT = "pl",
    PADDING_RIGHT = "pr",
    PADDING_TOP = "pt",
    PADDING_BOTTOM = "pb",
    PADDING = "p",
    CENTER_VERTICAL = "cv",
    CENTER_HORIZONTAL = "ch",
    CENTER = "c",
    SCROLL_VERTICAL = "sv",
    SCROLL_HORIZONTAL = "sh",
    VISIBILITY = "v",
}

export default class UIAttrReader {
    public static readAttrs(element: HTMLElement, config: UIConfiguration): UIViewAttrs {
        // read configuration attributes
        const attributeMain = config.attribute
        const attributes = config.attributes

        // create axis UIAttr to return
        const viewAttrs = new UIViewAttrs()

        // read UI
        this.readUI(viewAttrs, element, attributeMain, attributes)

        // TODO set to view sizeLoaded to false
        // this.sizeLoaded = false

        return viewAttrs
    }

    /**
     * Create a view object reading the HTML of the element
     * @param element where to read data
     * @param attributeMain with the name of the attribute to read
     * @param attributes with the name of the attributes to read as secondary
     * @return View generated
     **/
    private static readUI(viewAttrs: UIViewAttrs, element: HTMLElement, attributeMain: string, attributes: string[]) {
        //read main attributes
        let attributeValues = UIAttrReaderUtils.readAttributes(element.getAttribute(attributeMain))
        for (let i = 0; i < attributes.length; i++) {
            attributeValues = attributeValues.concat(
                UIAttrReaderUtils.readAttributes(element.getAttribute(attributes[i])),
            )
        }

        //check if we have attributes
        if (attributeValues.length == 0) {
            return
        }

        //set the ui values
        for (const attributeValue of attributeValues) {
            this.readUIAttribute(viewAttrs, attributeValue, element.id)
        }

        const referencesXEmpty = UIAttrReaderUtils.isReferenceEmpty(viewAttrs.x)
        if (referencesXEmpty && !viewAttrs.x.center) {
            viewAttrs.x.setRef(UI_REF.START_START, UI_VIEW_ID.PARENT)
        }

        const referencesYEmpty = UIAttrReaderUtils.isReferenceEmpty(viewAttrs.y)
        if (referencesYEmpty && !viewAttrs.y.center) {
            viewAttrs.y.setRef(UI_REF.START_START, UI_VIEW_ID.PARENT)
        }
    }

    /**
     * Read attribute and value
     * @param attr attribute
     * @param value value of attribute
     */
    public static readUIAttribute(viewAttrs: UIViewAttrs, attributeValue: UIAttributeValue, viewId: string) {
        const attr = attributeValue.attr
        const sValue = "" + attributeValue.value
        const bValue = attributeValue.value !== false

        switch (attr) {
            case ATTR.WIDTH:
                viewAttrs.x.setSize(sValue)
                break
            case ATTR.FULL_WIDTH:
                viewAttrs.x.setSize("100%")
                break
            case ATTR.HEIGHT:
                viewAttrs.y.setSize(sValue)
                break
            case ATTR.FULL_HEIGHT:
                viewAttrs.y.setSize("100%")
                break
            case ATTR.LEFT:
                viewAttrs.x.setRef(UI_REF.START_START, sValue)
                break
            case ATTR.RIGHT:
                viewAttrs.x.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.TOP:
                viewAttrs.y.setRef(UI_REF.START_START, sValue)
                break
            case ATTR.BOTTOM:
                viewAttrs.y.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.AT_LEFT:
                viewAttrs.x.setRef(UI_REF.END_START, sValue)
                break
            case ATTR.AT_LEFT_EQUAL:
                viewAttrs.x.setRef(UI_REF.END_START, sValue)
                viewAttrs.y.setRef(UI_REF.START_START, sValue)
                viewAttrs.y.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.AT_RIGHT:
                viewAttrs.x.setRef(UI_REF.START_END, sValue)
                break
            case ATTR.AT_RIGHT_EQUAL:
                viewAttrs.x.setRef(UI_REF.START_END, sValue)
                viewAttrs.y.setRef(UI_REF.START_START, sValue)
                viewAttrs.y.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.AT_TOP:
                viewAttrs.y.setRef(UI_REF.END_START, sValue)
                break
            case ATTR.AT_TOP_EQUAL:
                viewAttrs.y.setRef(UI_REF.END_START, sValue)
                viewAttrs.x.setRef(UI_REF.START_START, sValue)
                viewAttrs.x.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.AT_BOTTOM:
                viewAttrs.y.setRef(UI_REF.START_END, sValue)
                break
            case ATTR.AT_BOTTOM_EQUAL:
                viewAttrs.y.setRef(UI_REF.START_END, sValue)
                viewAttrs.x.setRef(UI_REF.START_START, sValue)
                viewAttrs.x.setRef(UI_REF.END_END, sValue)
                break
            case ATTR.MARGIN_LEFT:
                viewAttrs.x.marginStart = sValue
                break
            case ATTR.MARGIN_RIGHT:
                viewAttrs.x.marginEnd = sValue
                break
            case ATTR.MARGIN_TOP:
                viewAttrs.y.marginStart = sValue
                break
            case ATTR.MARGIN_BOTTOM:
                viewAttrs.y.marginEnd = sValue
                break
            case ATTR.MARGIN:
                const mValues = sValue.split(",")
                if (mValues.length === 1) {
                    viewAttrs.x.setMargin(sValue)
                    viewAttrs.y.setMargin(sValue)
                } else if (mValues.length === 4) {
                    viewAttrs.x.marginStart = mValues[0]
                    viewAttrs.y.marginStart = mValues[1]
                    viewAttrs.x.marginEnd = mValues[2]
                    viewAttrs.y.marginEnd = mValues[3]
                }
                break
            case ATTR.PADDING_LEFT:
                viewAttrs.x.paddingStart = sValue
                break
            case ATTR.PADDING_RIGHT:
                viewAttrs.x.paddingEnd = sValue
                break
            case ATTR.PADDING_TOP:
                viewAttrs.y.paddingStart = sValue
                break
            case ATTR.PADDING_BOTTOM:
                viewAttrs.y.paddingEnd = sValue
                break
            case ATTR.PADDING:
                const pValues = sValue.split(",")
                if (pValues.length === 1) {
                    viewAttrs.x.setPadding(sValue)
                    viewAttrs.y.setPadding(sValue)
                } else if (pValues.length === 4) {
                    viewAttrs.x.paddingStart = pValues[0]
                    viewAttrs.y.paddingStart = pValues[1]
                    viewAttrs.x.paddingEnd = pValues[2]
                    viewAttrs.y.paddingEnd = pValues[3]
                }
                break
            case ATTR.CENTER_VERTICAL:
                viewAttrs.y.center = bValue
                break
            case ATTR.CENTER_HORIZONTAL:
                viewAttrs.x.center = bValue
                break
            case ATTR.CENTER:
                viewAttrs.x.center = bValue
                viewAttrs.y.center = bValue
                break
            case ATTR.SCROLL_VERTICAL:
                viewAttrs.y.scroll = bValue
                break
            case ATTR.SCROLL_HORIZONTAL:
                viewAttrs.x.scroll = bValue
                break
            case ATTR.VISIBILITY:
                viewAttrs.visibility = (sValue as UI_VISIBILITY) || UI_VISIBILITY.VISIBLE
                break
            case ATTR.NONE:
                break
            default:
                Log.logW("Attribute unknown: " + attr + " in view " + viewId)
        }
    }

    public static generateUiAttr(viewAttrs: UIViewAttrs): string {
        // string attribute to add all parameters
        const attrs: string[] = []

        // check all parameters
        // size
        if (viewAttrs.x.size == UI_SIZE.SCREEN) {
            attrs.push(`${ATTR.WIDTH}:${viewAttrs.x.sizeValue}`)
        } else if (viewAttrs.x.size == UI_SIZE.PERCENTAGE) {
            const percentPos = viewAttrs.x.percentPos > 0 ? "" + viewAttrs.x.percentPos : ""
            attrs.push(`${ATTR.WIDTH}:${viewAttrs.x.sizeValue}%${percentPos}`)
        }
        if (viewAttrs.y.size == UI_SIZE.SCREEN) {
            attrs.push(`${ATTR.HEIGHT}:${viewAttrs.y.sizeValue}`)
        } else if (viewAttrs.y.size == UI_SIZE.PERCENTAGE) {
            const percentPos = viewAttrs.y.percentPos > 0 ? "" + viewAttrs.y.percentPos : ""
            attrs.push(`${ATTR.HEIGHT}:${viewAttrs.y.sizeValue}%${percentPos}`)
        }

        // references
        if (viewAttrs.x.startStart.length > 0) {
            attrs.push(`${ATTR.LEFT}:${viewAttrs.x.startStart}`)
        }
        if (viewAttrs.x.startEnd.length > 0) {
            attrs.push(`${ATTR.AT_RIGHT}:${viewAttrs.x.startEnd}`)
        }
        if (viewAttrs.x.endEnd.length > 0) {
            attrs.push(`${ATTR.RIGHT}:${viewAttrs.x.endEnd}`)
        }
        if (viewAttrs.x.endStart.length > 0) {
            attrs.push(`${ATTR.AT_LEFT}:${viewAttrs.x.endStart}`)
        }

        if (viewAttrs.y.startStart.length > 0) {
            attrs.push(`${ATTR.TOP}:${viewAttrs.y.startStart}`)
        }
        if (viewAttrs.y.startEnd.length > 0) {
            attrs.push(`${ATTR.AT_BOTTOM}:${viewAttrs.y.startEnd}`)
        }
        if (viewAttrs.y.endEnd.length > 0) {
            attrs.push(`${ATTR.BOTTOM}:${viewAttrs.y.endEnd}`)
        }
        if (viewAttrs.y.endStart.length > 0) {
            attrs.push(`${ATTR.AT_TOP}:${viewAttrs.y.endStart}`)
        }

        // margin
        if (viewAttrs.x.marginStart.length > 0) {
            attrs.push(`${ATTR.MARGIN_LEFT}:${viewAttrs.x.marginStart}`)
        }
        if (viewAttrs.x.marginEnd.length > 0) {
            attrs.push(`${ATTR.MARGIN_RIGHT}:${viewAttrs.x.marginEnd}`)
        }
        if (viewAttrs.y.marginStart.length > 0) {
            attrs.push(`${ATTR.MARGIN_TOP}:${viewAttrs.y.marginStart}`)
        }
        if (viewAttrs.y.marginEnd.length > 0) {
            attrs.push(`${ATTR.MARGIN_BOTTOM}:${viewAttrs.y.marginEnd}`)
        }

        // padding
        if (viewAttrs.x.paddingStart.length > 0) {
            attrs.push(`${ATTR.PADDING_LEFT}:${viewAttrs.x.paddingStart}`)
        }
        if (viewAttrs.x.paddingEnd.length > 0) {
            attrs.push(`${ATTR.PADDING_RIGHT}:${viewAttrs.x.paddingEnd}`)
        }
        if (viewAttrs.y.paddingStart.length > 0) {
            attrs.push(`${ATTR.PADDING_TOP}:${viewAttrs.y.paddingStart}`)
        }
        if (viewAttrs.y.paddingEnd.length > 0) {
            attrs.push(`${ATTR.PADDING_BOTTOM}:${viewAttrs.y.paddingEnd}`)
        }

        // center
        if (viewAttrs.x.center) {
            attrs.push(`${ATTR.CENTER_HORIZONTAL}`)
        }
        if (viewAttrs.y.center) {
            attrs.push(`${ATTR.CENTER_VERTICAL}`)
        }

        // scroll
        if (viewAttrs.x.scroll) {
            attrs.push(`${ATTR.SCROLL_HORIZONTAL}`)
        }
        if (viewAttrs.y.scroll) {
            attrs.push(`${ATTR.SCROLL_VERTICAL}`)
        }

        // visibility
        if (viewAttrs.visibility == UI_VISIBILITY.GONE) {
            attrs.push(`${ATTR.VISIBILITY}:${UI_VISIBILITY.GONE}`)
        } else if (viewAttrs.visibility == UI_VISIBILITY.INVISIBLE) {
            attrs.push(`${ATTR.VISIBILITY}:${UI_VISIBILITY.INVISIBLE}`)
        }

        // check we have more than one
        if (attrs.length === 0) {
            return ""
        }

        // convert attributes to text
        let sAttrs = attrs[0]
        for (let i = 1; i < attrs.length; i += 1) {
            sAttrs += ";" + attrs[i]
        }

        // return generated attribute
        return sAttrs
    }
}
