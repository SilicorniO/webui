import UIView from "../../model/UIView"
import UIViewUtils from "../../utils/uiview/UIViewUtils"
import { AXIS } from "../../model/UIAxis"
import UIAttr, { UI_SIZE, UI_REF, UI_REF_LIST, UI_VIEW_ID } from "../../model/UIAttr"
import Log from "../../utils/log/Log"
import UIPosition from "../../model/UIPosition"

export default class UICalculator {
    public static calculateScreen(screen: UIView, scrollSize: number) {
        //generate list of views and indexes for quick access
        var arrayViews = UIViewUtils.generateArrayViews(screen)
        var indexes = UIViewUtils.generateIndexes(arrayViews)

        var viewsRestored

        do {
            //clean array
            viewsRestored = new Array()

            //clean all views except the screen
            for (var i = 1; i < arrayViews.length; i++) {
                arrayViews[i].cleanAllAxis()
            }

            //calculate views
            this.calculateViews(
                AXIS.X,
                screen.childrenOrder[AXIS.X],
                screen,
                arrayViews,
                indexes,
                screen.positions[AXIS.X].size,
                viewsRestored,
                scrollSize,
            )
            this.calculateViews(
                AXIS.Y,
                screen.childrenOrder[AXIS.Y],
                screen,
                arrayViews,
                indexes,
                screen.positions[AXIS.Y].size,
                viewsRestored,
                scrollSize,
            )
        } while (viewsRestored.length > 0)
    }

    private static calculateViews(
        axis: AXIS,
        views: UIView[],
        parentView: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        size: number,
        viewsRestored: UIView[],
        scrollSize: number,
    ) {
        for (var i = 0; i < views.length; i++) {
            if (views[i].hasToBeCalculated()) {
                this.calculateView(axis, views[i], parentView, arrayViews, indexes, size, viewsRestored, scrollSize)
            }
        }
    }

    private static calculateView(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        size: number,
        viewsRestored: UIView[],
        scrollSize: number,
    ) {
        //eval references to try to calculate the width
        this.evalDependencies(axis, view, parentView, size, arrayViews, indexes)

        const attr = view.attrs.getAxis(axis)
        const position = view.positions[axis]
        const parentPosition = parentView.positions[axis]

        //calculate width
        this.evalFixedSize(attr, position)
        this.evalPercentSize(attr, position, parentPosition)

        //apply margins to left and right
        this.evalMargins(attr, position)

        // if we have start and end defined we can set the size
        if (view.positions[axis].startChanged && view.positions[axis].endChanged) {
            // calculate the width
            this.assignSize(position, size)

            // check gravity
            this.evalCenter(attr, position, size)

            //if there are children we eval them with width restrictions
            if (view.childrenOrder[axis].length > 0) {
                //calculate the real width with padding
                var viewWidth = view.attrs[axis].scroll
                    ? 0
                    : view.positions[axis].size - view.positions[axis].paddingStart - view.positions[axis].paddingEnd
                this.calculateViews(
                    axis,
                    view.childrenOrder[axis],
                    view,
                    arrayViews,
                    indexes,
                    viewWidth,
                    viewsRestored,
                    scrollSize,
                )

                //move left and right of all children using the paddingLeft
                this.applyPaddingChildren(axis, view)
            }
        } else {
            //if there are children we calculate the size of the children
            //giving the width of the parent
            if (view.childrenOrder[axis].length > 0) {
                //calculate the real width with padding
                var viewWidth = 0 //view.scrollHorizontal? 0 : width;
                this.calculateViews(
                    axis,
                    view.childrenOrder[axis],
                    view,
                    arrayViews,
                    indexes,
                    viewWidth,
                    viewsRestored,
                    scrollSize,
                )

                //move left and right of all children using the paddingLeft
                this.applyPaddingChildren(axis, view)

                //set the width of the children
                this.applySizeChildren(axis, view, arrayViews, indexes, viewsRestored, scrollSize)
            } else {
                //else if there are not children we calculate the content size
                this.applySizeContent(axis, view)
            }

            // calculate the width
            this.assignSize(position, size)

            // check gravity
            this.evalCenter(attr, position, size)
        }

        // check if size of children if bigger than container to add vertical scroll
        if (this.evalScroll(axis, view, size)) {
            // apply the padding of the scroll to the element
            view.positions[axis == AXIS.X ? AXIS.Y : AXIS.X].paddingEnd += scrollSize
            view.positions[axis].scrollApplied = true

            // save the view as one to recalculate
            viewsRestored.push(view)
        }
    }

    private static assignSize(position: UIPosition, size: number) {
        //if parent has size we force the space to the parent
        if (size > 0) {
            if (position.end > size) {
                position.end = size
            }
            if (position.start < 0) {
                position.start = 0
            }
        }
        position.size = position.end - position.start
    }

    private static evalFixedSize(attr: UIAttr, position: UIPosition) {
        if (attr.size != UI_SIZE.SCREEN) {
            return
        }

        //set left and top if they are not set
        if (position.endChanged) {
            position.start = position.end - attr.sizeValue
        } else {
            position.end = position.start + attr.sizeValue
        }

        // fixes size change start and end
        position.startChanged = true
        position.endChanged = true
    }

    /**
     * Add the padding of the view to all its children
     * @param view parent
     **/
    private static applyPaddingChildren(axis: AXIS, view: UIView) {
        if (view.positions[axis].paddingStart != 0) {
            for (const child of view.getUIChildren()) {
                child.positions[axis].start += view.positions[axis].paddingStart
                child.positions[axis].end += view.positions[axis].paddingStart
            }
        }
    }

    /**
     * Apply scroll to the view if their children are widther than parent
     * @param view View parent
     **/
    private static evalScroll(axis: AXIS, view: UIView, size: number) {
        if (view.attrs[axis].scroll) {
            var max = 0
            for (const child of view.getUIChildren()) {
                if (child.positions[axis].end > max) {
                    max = child.positions[axis].end
                }
            }
            if (view.attrs[axis].size != "sc" || max > size + view.positions[axis].paddingStart) {
                //check it here and not before because in the future we could change this state to not scroll without recalculate everything
                if (!view.positions[axis].scrollApplied) {
                    //apply style to show vertical scroll
                    var element = document.getElementById(view.id)
                    if (axis == AXIS.X) {
                        element.style.overflowX = "auto"
                    } else {
                        element.style.overflowY = "auto"
                    }

                    //recalculate all the children
                    return true
                }
            }
        }

        //not applied
        return false
    }

    /**
     * Calculate the left and right values with the content
     * @param view View to set size with content
     **/
    private static applySizeContent(axis: AXIS, view: UIView) {
        //if the size depends of children, calculate the position of children
        if (view.positions[axis].endChanged) {
            view.positions[axis].start = view.positions[axis].end - view.attrs[axis].sizeValue
            view.positions[axis].startChanged = true
        } else if (view.positions[axis].startChanged) {
            // TODO previous axis should be already asigned to calculate now the size correctly
            if (axis == AXIS.Y && view.positions[AXIS.X].startChanged && view.positions[AXIS.X].endChanged) {
                const height = UIViewUtils.calculateHeightView(view, view.element, view.positions[axis].size)
                view.attrs[axis].sizeValue = height
                view.positions[axis].end = view.positions[axis].start + view.attrs[axis].sizeValue
                view.positions[axis].endChanged = true
            } else {
                view.positions[axis].end = view.positions[axis].start + view.attrs[axis].sizeValue
                view.positions[axis].endChanged = true
            }
        }
    }

    /**
     * Calculate the left or the right with the size of the children if the sizeWidth is "sc"
     * @param view View to set the size
     **/
    private static applySizeChildren(
        axis: AXIS,
        view: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        viewsRestored: UIView[],
        scrollSize: number,
    ) {
        var min = 0
        var max = 0
        for (const child of view.getUIChildren()) {
            if (child.positions[axis].size > 0) {
                if (child.positions[axis].end > max) {
                    max = child.positions[axis].end
                } else if (child.positions[axis].start < min) {
                    min = child.positions[axis].start
                }
            }
        }
        var sizeChildren = max - min

        //if no size it is becase there is any child with fixed size, so we get the bigger child
        if (sizeChildren == 0) {
            for (const child of view.getUIChildren()) {
                if (child.attrs[axis].sizeValue > sizeChildren) {
                    sizeChildren = child.attrs[axis].sizeValue
                }
            }
        } else if (min < 0) {
            //move all the children to positive values
            for (const child of view.getUIChildren()) {
                if (
                    child.positions[axis].startChanged &&
                    child.positions[axis].endChanged &&
                    child.positions[axis].size > 0
                ) {
                    child.positions[axis].start += -min
                    child.positions[axis].end += -min
                }
            }
        }

        if (view.positions[axis].endChanged) {
            view.positions[axis].start = view.positions[axis].end - sizeChildren - view.positions[axis].paddingStart
            view.positions[axis].startChanged = true
        } else {
            view.positions[axis].end = view.positions[axis].start + sizeChildren + view.positions[axis].paddingEnd
            view.positions[axis].endChanged = true
        }
        view.positions[axis].size = view.positions[axis].end - view.positions[axis].start

        //apply width of children if they were waiting to have the parent size
        //this is used for r:p and parent has no size defined
        for (const child of view.getUIChildren()) {
            if (
                !child.positions[axis].startChanged ||
                !child.positions[axis].endChanged ||
                child.positions[axis].size <= 0
            ) {
                child.clean(axis)
                this.calculateView(axis, child, view, arrayViews, indexes, sizeChildren, viewsRestored, scrollSize)
            }
        }
    }

    /**
     * Apply percent to a view with a set size
     **/
    private static evalPercentSize(attr: UIAttr, position: UIPosition, parentPosition: UIPosition) {
        if (attr.size != UI_SIZE.PERCENTAGE) {
            return
        }

        if (position.endChanged && !position.startChanged) {
            position.start = position.end - (parentPosition.size * attr.sizeValue) / 100
        } else {
            position.end = position.start + (parentPosition.size * attr.sizeValue) / 100
        }

        //move the percent if necessary
        if (attr.percentPos > 0) {
            var percentWidth = (position.end - position.start) * attr.percentPos
            position.start += percentWidth
            position.end += percentWidth
        }

        //mark left and right as changed
        position.endChanged = true
        position.startChanged = true
    }

    /**
     * Assign gravity values to the view
     * @param view View to get and change values
     * @param size int
     **/
    private static evalCenter(attr: UIAttr, position: UIPosition, size: number) {
        if (!attr.center || size <= 0) {
            return
        }

        var viewWidth = position.size > 0 ? position.size : attr.sizeValue
        position.start = Math.max(0, (size - viewWidth) / 2)
        position.end = Math.min(size, position.start + viewWidth)
        position.startChanged = true
        position.endChanged = true
        position.size = position.end - position.start
    }

    /**
     * Assign margin values to the view
     * @param view View to get and change values
     **/
    private static evalMargins(attr: UIAttr, positions: UIPosition) {
        //get real margin values
        var viewMarginStart = positions.marginStart
        var viewMarginEnd = positions.marginEnd

        if (viewMarginStart != 0 && positions.startChanged) {
            positions.start += viewMarginStart
            if (!positions.endChanged || attr.size == UI_SIZE.SCREEN) {
                positions.end += viewMarginStart
            }
        }
        if (viewMarginEnd != 0 && positions.endChanged) {
            positions.end -= viewMarginEnd
            if (!positions.startChanged || attr.size == UI_SIZE.SCREEN) {
                positions.start -= viewMarginEnd
            }
        }
    }

    /**
     * Change start or end depending of the references
     * @param axis
     * @param view
     * @param parentView
     * @param size
     * @param arrayViews
     * @param indexes
     */
    private static evalDependencies(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        size: number,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
    ) {
        var numDependencies = 0
        var attrs = view.getAttrs(axis)
        for (const refId of UI_REF_LIST) {
            var dependency = this.translateViewDependency(view, attrs.getRef(refId), parentView)
            if (dependency.length > 0) {
                this.evalDependence(axis, view, parentView, size, refId, arrayViews[indexes[dependency]])
                numDependencies += 1
            }
        }

        //set left parent if there is not dependencies
        if (numDependencies == 0 && !view.attrs[axis].center) {
            view.positions[axis].start = 0
            view.positions[axis].startChanged = true
        }
    }

    /**
     * Set left, top, right, bottom values for the reference received
     * @param view to set the values
     * @param parentView to check and get values
     * @param iReference index of reference to evaluate
     * @param viewDependency from wich get the value
     **/
    private static evalDependence(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        width: number,
        referenceId: UI_REF,
        viewDependency: UIView,
    ) {
        if (viewDependency == null) {
            Log.logE("The view '" + view.id + "' has a wrong reference")
            return
        }

        switch (referenceId) {
            case UI_REF.START_START:
                if (parentView != viewDependency) {
                    view.positions[axis].start = viewDependency.positions[axis].start
                }
                view.positions[axis].startChanged = true
                break
            case UI_REF.START_END:
                view.positions[axis].start = viewDependency.positions[axis].endChanged
                    ? viewDependency.positions[axis].end
                    : viewDependency.positions[axis].start + viewDependency.positions[axis].size
                view.positions[axis].startChanged = true
                break
            case UI_REF.END_END:
                if (parentView == viewDependency) {
                    if (parentView.positions[axis].endChanged) {
                        view.positions[axis].end = width
                    } else {
                        view.positions[axis].end = 0
                        break
                    }
                } else {
                    view.positions[axis].end = viewDependency.positions[axis].endChanged
                        ? viewDependency.positions[axis].end
                        : viewDependency.positions[axis].start + viewDependency.positions[axis].size
                }
                view.positions[axis].endChanged = true
                break
            case UI_REF.END_START:
                view.positions[axis].end = viewDependency.positions[axis].start
                view.positions[axis].endChanged = true
                break
        }
    }

    private static translateViewDependency(view: UIView, viewDependency: string, parentView: UIView): string {
        //replace parent or last viewDependency
        if (viewDependency == UI_VIEW_ID.PARENT) {
            return parentView.id
        } else if (viewDependency == UI_VIEW_ID.LAST) {
            //get previous view and check is null to set as parent
            var previousView = view.getPreviousView()
            if (previousView == null) {
                return "" //parentView.id;
            } else {
                return previousView.id
            }
        } else {
            return viewDependency
        }
    }
}
