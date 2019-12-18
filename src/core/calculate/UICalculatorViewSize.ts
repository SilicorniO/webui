import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_SIZE } from "../../model/UIAttr"
import Log from "../../utils/log/Log"
import UICalculatorDependencies from "./UICalculatorDependencies"
import UIPosition from "../../model/UIPosition"

export default class UICalculatorViewSize {
    public static calculate(axis: AXIS, view: UIView, scrollSize: number, parentSize: number): number {
        const attr = view.attrs[axis]

        // check size is content
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            // size depends of children we calculate children sizes
            return this.calculateChildrenMaxSize(axis, view, scrollSize, parentSize)
        } else if (attr.size == UI_SIZE.PERCENTAGE) {
            return (parentSize * attr.sizeValue) / 100
        } else {
            return attr.sizeValue
        }
    }

    private static calculateChildrenMaxSize(axis: AXIS, view: UIView, scrollSize: number, parentSize: number): number {
        const children = view.getUIChildren()

        // check we have children
        if (children.length == 0) {
            return view.attrs[axis].sizeValue
        }

        // get parent
        const parent = children[0].parent
        if (parent == null) {
            Log.logE("UNEXPECTED: Child has no parent but it was received from one")
            return 0
        }

        // convert parent size to content
        const content = new AxisRect()
        content.end = parentSize

        // for each child
        let maxEnd = 0
        for (const child of children) {
            // eval dependencies that not depend from parent size
            UICalculatorDependencies.evalViewDependencies(axis, child, parent, content)

            // eval size of child
            this.evalViewSize(axis, child, scrollSize, parentSize)

            // eval positions
            this.evalViewPositions(child.positions[axis])

            // save max end
            maxEnd = Math.max(maxEnd, child.positions[axis].end)
        }

        // return the biggest end of all children
        return maxEnd
    }

    private static evalViewSize(axis: AXIS, view: UIView, scrollSize: number, parentSize: number) {
        const attr = view.attrs[axis]
        const position = view.positions[axis]

        // check if we have the size defined
        if (position.startChanged && position.endChanged) {
            return
        }

        // check size is content
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            // calculate content size of view
            position.size = this.calculate(axis, view, scrollSize, parentSize)
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
