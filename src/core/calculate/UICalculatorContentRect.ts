import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import UICalculatorViewSize from "./UICalculatorViewSize"
import UIPosition from "../../model/UIPosition"
import UIAttr, { UI_SIZE, UI_OVERFLOW } from "../../model/UIAttr"

export default class UICalculatorContentRect {
    public static calculateContentRect(axis: AXIS, view: UIView, scrollSize: number, parentSize: number): AxisRect {
        const attr = view.attrs[axis]
        const position = view.positions[axis]

        // calculate the size of the view
        position.size = UICalculatorViewSize.calculate(axis, view, scrollSize, parentSize)

        // apply padding
        this.applyPaddingToSize(attr, position)

        // create content rect
        const contentRect = new AxisRect()
        this.applyPaddingToContentRect(contentRect, position)

        // apply scroll if necessary
        this.applyScrollToContentRect(contentRect, attr, position, scrollSize)

        // return content rect
        return contentRect
    }

    private static applyPaddingToSize(attr: UIAttr, position: UIPosition) {
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            position.size += position.paddingStart + position.paddingEnd
        }
    }

    private static applyPaddingToContentRect(contentRect: AxisRect, position: UIPosition) {
        contentRect.end = position.size - position.paddingEnd
        contentRect.start += position.paddingStart
    }

    private static applyScrollToContentRect(
        contentRect: AxisRect,
        attr: UIAttr,
        position: UIPosition,
        scrollSize: number,
    ) {
        // check we have to apply scroll
        if (!position.scrollApplied) {
            return
        }

        // check we have scroll
        if (attr.overflow != UI_OVERFLOW.SCROLL) {
            return
        }

        // check we need scroll
        if (contentRect.end - contentRect.start <= position.size) {
            return
        }

        // apply scroll to content rect
        contentRect.end -= scrollSize
    }
}
