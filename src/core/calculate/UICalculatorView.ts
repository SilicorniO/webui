import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_SIZE } from "../../model/UIAttr"
import UICalculatorDependencies from "./UICalculatorDependencies"
import UICalculatorContentRect from "./UICalculatorContentRect"
import DomSizeUtils from "../../utils/domsize/DomSizeUtils"

export default class UICalculatorView {
    public static calculate(axis: AXIS, view: UIView, size: number, scrollSize: number) {
        // calculate content rect
        const contentRect = UICalculatorContentRect.calculateContentRect(axis, view, scrollSize, size)

        // calculate children
        this.calculateChildren(axis, view, contentRect, scrollSize)

        // if screen is size content and has not end changed we calculate with the children
        if (!view.positions[axis].endChanged) {
            view.positions[axis].end = this.getMaxEndOfChildren(axis, view)
            view.positions[axis].endChanged = true
        }
    }

    private static calculateChildren(axis: AXIS, parent: UIView, contentRect: AxisRect, scrollSize: number) {
        // calculate content size
        const contentSize = contentRect.end - contentRect.start

        // for each child
        for (const child of parent.getUIChildren()) {
            // if has children we calculate children
            if (child.hasUIChildren()) {
                const childSize = this.getChildSize(axis, child, contentSize)
                this.calculate(axis, child, childSize, scrollSize)
            }

            // clean position because we are going to calculate everything
            child.positions[axis].clean()

            // eval dependencies that not depend from parent size
            UICalculatorDependencies.evalViewDependencies(axis, child, parent, contentRect)

            // eval size of child
            this.evalViewSize(axis, child, contentRect)

            // eval positions
            this.evalViewPositions(axis, child)
        }
    }

    private static getChildSize(axis: AXIS, view: UIView, parentSize: number): number {
        const attr = view.attrs[axis]

        // check size is content
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            // calculate content size of view
            if (view.hasUIChildren()) {
                return parentSize
            } else {
                return attr.sizeValue
            }
        } else if (attr.size == UI_SIZE.PERCENTAGE) {
            return (parentSize * attr.sizeValue) / 100
        } else {
            return attr.sizeValue
        }
    }

    private static evalViewSize(axis: AXIS, view: UIView, contentRect: AxisRect) {
        const attr = view.attrs[axis]
        const position = view.positions[axis]
        const parentSize = contentRect.end - contentRect.start

        // check if we have the size defined
        if (position.startChanged && position.endChanged) {
            position.size = position.end - position.start
            return
        }

        // check size is content
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            this.evalViewSizeContent(axis, view, contentRect)
        } else if (attr.size == UI_SIZE.PERCENTAGE) {
            // size of the parent can be changed with margins
            const parentSizeLessMargins = parentSize - position.marginStart - position.marginEnd

            // apply porcentage size
            position.size = (parentSizeLessMargins * attr.sizeValue) / 100

            // if we have a position we apply it now
            position.start = position.size * attr.percentPos + position.marginStart
            position.startChanged = true
        } else {
            position.size = attr.sizeValue
        }
    }

    private static evalViewSizeContent(axis: AXIS, view: UIView, contentRect: AxisRect) {
        const position = view.positions[axis]
        const attr = view.attrs[axis]

        // calculate max end checking all children
        if (view.hasUIChildren()) {
            const maxEnd = this.getMaxEndOfChildren(axis, view)
            position.size = maxEnd - contentRect.start
        } else {
            // if we are not in first axis (x), the content could change, so we recalculate
            if (axis == AXIS.Y) {
                position.size = DomSizeUtils.calculateHeightView(view.element, view.positions[AXIS.X].size)
            } else {
                position.size = attr.sizeValue
            }
        }

        // add padding end because this view is bigger than content size
        position.size += position.paddingEnd
    }

    private static getMaxEndOfChildren(axis: AXIS, view: UIView): number {
        let maxEnd = 0
        for (const child of view.getUIChildren()) {
            maxEnd = Math.max(maxEnd, child.positions[axis].end)
        }
        return maxEnd
    }

    private static evalViewPositions(axis: AXIS, view: UIView) {
        const position = view.positions[axis]

        // if we have center defined we calculate start and end
        if (position.centerChanged) {
            position.start = position.center - position.size / 2
            position.end = position.center + position.size / 2

            position.startChanged = true
            position.endChanged = true
            return
        }

        // check we have start defined
        if (!position.startChanged) {
            // if we have end, we get start with its size
            if (position.endChanged) {
                position.start = position.end - position.size
            }
            position.startChanged = true
        }

        // check we have end defined
        if (!position.endChanged) {
            // if we have start, we get start with its size
            if (position.startChanged) {
                position.end = position.start + position.size
            }
            position.endChanged = true
        }
    }
}
