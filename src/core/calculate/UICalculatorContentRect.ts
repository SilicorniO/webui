import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import UIPosition from "../../model/UIPosition"
import UIAttr, { UI_SIZE, UI_OVERFLOW } from "../../model/UIAttr"
import UICalculatorDependencies from "./UICalculatorDependencies"

export default class UICalculatorContentRect {
    public static calculate(axis: AXIS, view: UIView, parentSize: number, scrollSize: number): AxisRect {
        const attr = view.attrs[axis]
        const position = view.positions[axis]

        // create content rect
        const contentRect = new AxisRect()

        // calculate size
        contentRect.end = this.calculateSize(axis, view, parentSize)

        // apply padding to content rect
        this.applyPaddingToContentRect(contentRect, attr, position)

        // apply scroll to content rect
        this.applyScrollToContentRect(contentRect, attr, position, scrollSize)

        // return content rect
        return contentRect
    }

    private static calculateSize(axis: AXIS, view: UIView, parentSize: number): number {
        const attr = view.attrs[axis]

        // check size is content
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            return this.calculateSizeContent(axis, view, parentSize)
        } else if (attr.size == UI_SIZE.PERCENTAGE) {
            return (parentSize * attr.sizeValue) / 100
        } else {
            return attr.sizeValue
        }
    }

    private static calculateSizeContent(axis: AXIS, view: UIView, parentSize: number): number {
        const parent = view.parent
        if (parent != null) {
            // create content rect with the size
            const contentRect = new AxisRect()
            contentRect.end = parentSize

            // try to get the size with dependencies with the parent
            const position = UICalculatorDependencies.evalViewDependencies(axis, view, parent, contentRect, false)
            if (position.startChanged && position.endChanged) {
                return Math.max(0, position.end - position.start)
            } else {
                return 0
            }
        } else {
            // else we return 0 to not calculate this child for the content
            return 0
        }
    }

    private static applyPaddingToContentRect(contentRect: AxisRect, attr: UIAttr, position: UIPosition) {
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            contentRect.end += position.paddingStart
        } else {
            contentRect.end -= position.paddingEnd
        }
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
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            contentRect.end += scrollSize
        } else {
            contentRect.end -= scrollSize
        }
    }
}
