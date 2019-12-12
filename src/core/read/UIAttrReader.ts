import { UI_REF, UI_VIEW_ID } from "../../model/UIAttr"
import UIAttrReaderUtils from "./UIAttrReaderUtils"
import UIView from "../../model/UIView"
import UIAttributeValue from "./UIAttributeValue"
import UIViewAttrs from "../../model/UIViewAttrs"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import Log from "../../utils/log/Log"
import UIConfiguration from "../../UIConfiguration"

enum ATTR {
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
    private static readUI(
        viewAttrs: UIViewAttrs,
        element: HTMLElement,
        attributeMain: string,
        attributes: string[],
    ): UIView {
        //read main attributes
        let attributeValues = UIAttrReaderUtils.readAttributes(element.getAttribute(attributeMain))
        for (var i = 0; i < attributes.length; i++) {
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
    private static readUIAttribute(viewAttrs: UIViewAttrs, attributeValue: UIAttributeValue, viewId: string) {
        const attr = attributeValue.attr
        const value = attributeValue.value

        if (attr === ATTR.WIDTH) {
            viewAttrs.x.setSize(value)
        } else if (attr === ATTR.FULL_WIDTH) {
            viewAttrs.x.setSize("100%")
        } else if (attr === ATTR.HEIGHT) {
            viewAttrs.y.setSize(value)
        } else if (attr === ATTR.FULL_HEIGHT) {
            viewAttrs.y.setSize("100%")
        } else if (attr === ATTR.LEFT) {
            viewAttrs.x.setRef(UI_REF.START_START, value)
        } else if (attr === ATTR.RIGHT) {
            viewAttrs.x.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.TOP) {
            viewAttrs.y.setRef(UI_REF.START_START, value)
        } else if (attr === ATTR.BOTTOM) {
            viewAttrs.y.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.AT_LEFT) {
            viewAttrs.x.setRef(UI_REF.END_START, value)
        } else if (attr === ATTR.AT_LEFT_EQUAL) {
            viewAttrs.x.setRef(UI_REF.END_START, value)
            viewAttrs.y.setRef(UI_REF.START_START, value)
            viewAttrs.y.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.AT_RIGHT) {
            viewAttrs.x.setRef(UI_REF.START_END, value)
        } else if (attr === ATTR.AT_RIGHT_EQUAL) {
            viewAttrs.x.setRef(UI_REF.START_END, value)
            viewAttrs.y.setRef(UI_REF.START_START, value)
            viewAttrs.y.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.AT_TOP) {
            viewAttrs.y.setRef(UI_REF.END_START, value)
        } else if (attr === ATTR.AT_TOP_EQUAL) {
            viewAttrs.y.setRef(UI_REF.END_START, value)
            viewAttrs.x.setRef(UI_REF.START_START, value)
            viewAttrs.x.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.AT_BOTTOM) {
            viewAttrs.y.setRef(UI_REF.START_END, value)
        } else if (attr === ATTR.AT_BOTTOM_EQUAL) {
            viewAttrs.y.setRef(UI_REF.START_END, value)
            viewAttrs.x.setRef(UI_REF.START_START, value)
            viewAttrs.x.setRef(UI_REF.END_END, value)
        } else if (attr === ATTR.MARGIN_LEFT) {
            viewAttrs.x.marginStart = value
        } else if (attr === ATTR.MARGIN_RIGHT) {
            viewAttrs.x.marginEnd = value
        } else if (attr === ATTR.MARGIN_TOP) {
            viewAttrs.y.marginStart = value
        } else if (attr === ATTR.MARGIN_BOTTOM) {
            viewAttrs.y.marginEnd = value
        } else if (attr === ATTR.MARGIN) {
            var mValues = value.split(",")
            if (mValues.length === 1) {
                viewAttrs.x.setMargin(value)
                viewAttrs.y.setMargin(value)
            } else if (mValues.length === 4) {
                viewAttrs.x.marginStart = mValues[0]
                viewAttrs.y.marginStart = mValues[1]
                viewAttrs.x.marginEnd = mValues[2]
                viewAttrs.y.marginEnd = mValues[3]
            }
        } else if (attr === ATTR.PADDING_LEFT) {
            viewAttrs.x.paddingStart = value
        } else if (attr === ATTR.PADDING_RIGHT) {
            viewAttrs.x.paddingEnd = value
        } else if (attr === ATTR.PADDING_TOP) {
            viewAttrs.y.paddingStart = value
        } else if (attr === ATTR.PADDING_BOTTOM) {
            viewAttrs.y.paddingEnd = value
        } else if (attr === ATTR.PADDING) {
            var pValues = value.split(",")
            if (pValues.length === 1) {
                viewAttrs.x.setPadding(value)
                viewAttrs.y.setPadding(value)
            } else if (pValues.length === 4) {
                viewAttrs.x.paddingStart = mValues[0]
                viewAttrs.y.paddingStart = mValues[1]
                viewAttrs.x.paddingEnd = mValues[2]
                viewAttrs.y.paddingEnd = mValues[3]
            }
        } else if (attr === ATTR.CENTER_VERTICAL) {
            viewAttrs.y.center = true
        } else if (attr === ATTR.CENTER_HORIZONTAL) {
            viewAttrs.x.center = true
        } else if (attr === ATTR.CENTER) {
            viewAttrs.x.center = true
            viewAttrs.y.center = true
        } else if (attr === ATTR.SCROLL_VERTICAL) {
            viewAttrs.y.scroll = true
        } else if (attr === ATTR.SCROLL_HORIZONTAL) {
            viewAttrs.x.scroll = true
        } else if (attr === ATTR.VISIBILITY) {
            viewAttrs.visibility = (value as UI_VISIBILITY) || UI_VISIBILITY.VISIBLE
        } else if (attr.length > 0) {
            Log.logW("Attribute unknown: " + attr + " in view " + viewId)
        }
    }
}
