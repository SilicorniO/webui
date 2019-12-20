import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_REF_LIST, UI_REF, UI_VIEW_ID } from "../../model/UIAttr"
import Log from "../../utils/log/Log"
import UIPosition from "../../model/UIPosition"

export default class UICalculatorDependencies {
    /**
     * Change start or end depending of the references
     * @param axis
     * @param view
     * @param parentView
     * @param size
     * @param arrayViews
     * @param indexes
     */
    public static evalViewDependencies(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
    ): UIPosition {
        // create the position to return, we add margin because we can use it
        const position = view.positions[axis].clone()
        position.clean()

        var numDependencies = 0
        var attrs = view.getAttrs(axis)
        for (const refId of UI_REF_LIST) {
            var dependency = this.translateViewDependency(view, attrs.getRef(refId), parentView)
            if (dependency.length > 0) {
                const viewDependency = parentView.dependenciesMap[dependency]
                if (viewDependency != null) {
                    this.evalViewDependence(axis, position, parentView, contentRect, refId, viewDependency)
                    numDependencies += 1
                } else {
                    Log.logE(`The view ${view.id} has a wrong reference: ${refId}`)
                }
            }
        }

        // set left parent if there is not dependencies
        if (numDependencies == 0 && !view.attrs[axis].center) {
            this.evalDependenceStartStart(position, contentRect, true, parentView.positions[axis])
        }

        // return position
        return position
    }

    /**
     * Set left, top, right, bottom values for the reference received
     * @param view to set the values
     * @param parentView to check and get values
     * @param iReference index of reference to evaluate
     * @param viewDependency from wich get the value
     **/
    private static evalViewDependence(
        axis: AXIS,
        position: UIPosition,
        parentView: UIView,
        contentRect: AxisRect,
        referenceId: UI_REF,
        viewDependency: UIView,
    ) {
        // values to check
        const viewDependencyPosition = viewDependency.positions[axis]
        const parentDependence = viewDependency == parentView

        switch (referenceId) {
            case UI_REF.START_START:
                this.evalDependenceStartStart(position, contentRect, parentDependence, viewDependencyPosition)
                break
            case UI_REF.START_END:
                this.evalDependenceStartEnd(position, contentRect, parentDependence, viewDependencyPosition)
                break
            case UI_REF.END_END:
                this.evalDependenceEndEnd(position, contentRect, parentDependence, viewDependencyPosition)
                break
            case UI_REF.END_START:
                this.evalDependenceEndStart(position, contentRect, parentDependence, viewDependencyPosition)
                break
            case UI_REF.CENTER:
                this.evalDependenceCenter(position, contentRect, parentDependence, viewDependencyPosition)
                break
        }
    }

    private static evalDependenceStartStart(
        position: UIPosition,
        contentRect: AxisRect,
        parentDependence: boolean,
        viewDependencyPosition: UIPosition,
    ) {
        if (parentDependence) {
            position.start = contentRect.start
        } else {
            position.start = viewDependencyPosition.start
        }
        position.start += position.marginStart
        position.startChanged = true
    }

    private static evalDependenceStartEnd(
        position: UIPosition,
        contentRect: AxisRect,
        parentDependence: boolean,
        viewDependencyPosition: UIPosition,
    ) {
        if (parentDependence) {
            position.start = contentRect.end
        } else {
            position.start = viewDependencyPosition.end
        }
        position.start += position.marginStart
        position.startChanged = true
    }

    private static evalDependenceEndEnd(
        position: UIPosition,
        contentRect: AxisRect,
        parentDependence: boolean,
        viewDependencyPosition: UIPosition,
    ) {
        if (parentDependence) {
            position.end = contentRect.end
        } else {
            position.end = viewDependencyPosition.end
        }
        position.end -= position.marginEnd
        position.endChanged = true
    }

    private static evalDependenceEndStart(
        position: UIPosition,
        contentRect: AxisRect,
        parentDependence: boolean,
        viewDependencyPosition: UIPosition,
    ) {
        if (parentDependence) {
            position.end = contentRect.start
        } else {
            position.end = viewDependencyPosition.start
        }
        position.end -= position.marginEnd
        position.endChanged = true
    }

    private static evalDependenceCenter(
        position: UIPosition,
        contentRect: AxisRect,
        parentDependence: boolean,
        viewDependencyPosition: UIPosition,
    ) {
        if (parentDependence) {
            position.center = (contentRect.start + contentRect.end) / 2
            position.centerChanged = true
        } else {
            position.center = (viewDependencyPosition.start + position.end) / 2
            position.centerChanged = true
        }
    }

    private static translateViewDependency(view: UIView, viewDependency: string, parentView: UIView): string {
        // replace parent or last viewDependency
        if (viewDependency == UI_VIEW_ID.PARENT) {
            return parentView.id
        } else if (viewDependency == UI_VIEW_ID.LAST) {
            // get previous view and check is null to set as parent
            var previousView = view.getPreviousView()
            if (previousView != null) {
                return previousView.id
            } else {
                return ""
            }
        } else {
            return viewDependency
        }
    }
}
