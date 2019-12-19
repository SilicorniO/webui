import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_SIZE } from "../../model/UIAttr"
import UICalculatorDependencies from "./UICalculatorDependencies"
import UICalculatorViewSize from "./UICalculatorViewSize"
import UIPosition from "../../model/UIPosition"

export default class UICalculatorView {
    public static calculate(axis: AXIS, view: UIView, contentRect: AxisRect) {
        // calculate children
        this.calculateChildren(axis, view, contentRect)
    }

    private static calculateChildren(axis: AXIS, parent: UIView, contentRect: AxisRect): number {
        // for each child
        let maxEnd = 0
        for (const child of parent.getUIChildren()) {
            // clean position because we are going to calculate everything
            child.positions[axis].clean()

            // eval dependencies that not depend from parent size
            UICalculatorDependencies.evalViewDependencies(axis, child, parent, contentRect)

            // eval size of child
            this.evalViewSize(axis, child, contentRect)

            // eval positions
            this.evalViewPositions(child.positions[axis])

            // save max end
            maxEnd = Math.max(maxEnd, child.positions[axis].end)
        }

        // return the biggest end of all children
        return maxEnd
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
            // calculate content size of view
            position.size = UICalculatorViewSize.calculate(axis, view, 0, parentSize)
        } else if (attr.size == UI_SIZE.PERCENTAGE) {
            position.size = (parentSize * attr.sizeValue) / 100
        } else {
            position.size = attr.sizeValue
        }
    }

    private static evalViewPositions(position: UIPosition) {
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
