import { AXIS, AxisRect } from "../../model/UIAxis"
import UIView from "../../model/UIView"
import { UI_REF_LIST, UI_REF, UI_VIEW_ID } from "../../model/UIAttr"
import Log from "../../utils/log/Log"

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
    public static evalViewDependencies(axis: AXIS, view: UIView, parentView: UIView, contentRect: AxisRect) {
        var numDependencies = 0
        var attrs = view.getAttrs(axis)
        for (const refId of UI_REF_LIST) {
            var dependency = this.translateViewDependency(view, attrs.getRef(refId), parentView)
            if (dependency.length > 0) {
                this.evalViewDependence(
                    axis,
                    view,
                    parentView,
                    contentRect,
                    refId,
                    parentView.dependenciesMap[dependency],
                )
                numDependencies += 1
            }
        }

        //set left parent if there is not dependencies
        if (numDependencies == 0 && !view.attrs[axis].center) {
            this.evalDependenceStartStart(axis, view, parentView, contentRect, parentView)
        }
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
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        referenceId: UI_REF,
        viewDependency: UIView | null,
    ) {
        if (viewDependency == null) {
            Log.logE(`The view ${view.id} has a wrong reference: ${referenceId}`)
            return
        }

        switch (referenceId) {
            case UI_REF.START_START:
                this.evalDependenceStartStart(axis, view, parentView, contentRect, viewDependency)
                break
            case UI_REF.START_END:
                this.evalDependenceStartEnd(axis, view, parentView, contentRect, viewDependency)
                break
            case UI_REF.END_END:
                this.evalDependenceEndEnd(axis, view, parentView, contentRect, viewDependency)
                break
            case UI_REF.END_START:
                this.evalDependenceEndStart(axis, view, parentView, contentRect, viewDependency)
                break
            case UI_REF.CENTER:
                this.evalDependenceCenter(axis, view, parentView, contentRect, viewDependency)
                break
        }
    }

    private static evalDependenceStartStart(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        viewDependency: UIView,
    ) {
        if (parentView == viewDependency) {
            view.positions[axis].start = contentRect.start
        } else {
            view.positions[axis].start = viewDependency.positions[axis].start
        }
        view.positions[axis].start += view.positions[axis].marginStart
        view.positions[axis].startChanged = true
    }

    private static evalDependenceStartEnd(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        viewDependency: UIView,
    ) {
        if (parentView == viewDependency) {
            view.positions[axis].start = contentRect.end
        } else {
            view.positions[axis].start = viewDependency.positions[axis].end
        }
        view.positions[axis].start += view.positions[axis].marginStart
        view.positions[axis].startChanged = true
    }

    private static evalDependenceEndEnd(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        viewDependency: UIView,
    ) {
        if (parentView == viewDependency) {
            view.positions[axis].end = contentRect.end
        } else {
            view.positions[axis].end = viewDependency.positions[axis].end
        }
        view.positions[axis].end -= view.positions[axis].marginEnd
        view.positions[axis].endChanged = true
    }

    private static evalDependenceEndStart(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        viewDependency: UIView,
    ) {
        if (parentView == viewDependency) {
            view.positions[axis].end = contentRect.start
        } else {
            view.positions[axis].end = viewDependency.positions[axis].start
        }
        view.positions[axis].end -= view.positions[axis].marginEnd
        view.positions[axis].endChanged = true
    }

    private static evalDependenceCenter(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        contentRect: AxisRect,
        viewDependency: UIView,
    ) {
        if (parentView == viewDependency) {
            view.positions[axis].center = (contentRect.start + contentRect.end) / 2
            view.positions[axis].centerChanged = true
        } else {
            view.positions[axis].center =
                (viewDependency.positions[axis].start + viewDependency.positions[axis].end) / 2
            view.positions[axis].centerChanged = true
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
