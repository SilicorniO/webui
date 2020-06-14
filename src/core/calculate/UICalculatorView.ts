import { AXIS, AxisRect, AXIS_LIST } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_SIZE } from "../../model/UIAttr"
import UICalculatorDependencies from "./UICalculatorDependencies"
import DomSizeUtils from "../../utils/domsize/DomSizeUtils"
import UICalculatorContentRect from "./UICalculatorContentRect"
import { UIViewState } from "../../model/UIViewState"

export default class UICalculatorView {
    public static calculate(axis: AXIS, view: UIView, size: number, scrollSize: number) {
        // calculate content rect
        const contentRect = UICalculatorContentRect.calculate(axis, view, size, scrollSize)

        // calculate children
        this.calculateChildren(axis, view, contentRect, scrollSize)

        // if screen is size content and has not end changed we calculate with the children
        if (!view.positions[axis].endChanged) {
            view.positions[axis].end = this.getMaxEndOfChildren(axis, view)
            view.positions[axis].endChanged = true
        }
    }

    private static calculateChildren(
        axis: AXIS,
        parent: UIView,
        contentRect: AxisRect,
        scrollSize: number,
        secondPass: boolean = false,
    ) {
        // check has children
        if (!parent.hasUIChildren()) {
            return
        }

        const attr = parent.attrs[axis]

        // for each child
        for (const child of parent.childrenOrder[axis]) {
            // if has children we calculate children
            if (child.hasUIChildren()) {
                this.calculate(axis, child, contentRect.size(), scrollSize)
            }

            // eval dependencies that not depend from parent size
            child.positions[axis] = UICalculatorDependencies.evalViewDependencies(axis, child, parent, contentRect)

            // eval size of child
            this.evalViewSize(axis, child, contentRect)

            // eval positions
            this.evalViewPositions(axis, child)

            // if it is the last axis we mark it as calculated
            if (axis == AXIS_LIST[AXIS_LIST.length - 1]) {
                child.setState(UIViewState.CALCULATE)
            }
        }

        // TODO calculate again if a child has parent dependencies, but now with real size
        if (attr.size == UI_SIZE.SIZE_CONTENT && contentRect.size() == 0 && !secondPass) {
            // apply size of calculated children to content rect
            contentRect.end = this.getMaxEndOfChildren(axis, parent, true)

            // calculate children again
            this.calculateChildren(axis, parent, contentRect, scrollSize, true)
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
            if (attr.percentPos > 0) {
                position.start = contentRect.start + position.size * attr.percentPos + position.marginStart
                position.startChanged = true
            }
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
            position.size = maxEnd
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

    private static getMaxEndOfChildren(axis: AXIS, view: UIView, forceInsideParent: boolean = false): number {
        let maxEnd = 0
        for (const child of view.getUIChildren()) {
            const position = child.positions[axis]
            if (forceInsideParent && position.start < 0) {
                maxEnd = Math.max(maxEnd, position.end - position.start)
            } else {
                maxEnd = Math.max(maxEnd, position.end)
            }
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
