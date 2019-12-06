import Log from "./utils/log/Log"
import UIViewUtils from "./utils/uiview/UIViewUtils"
import UIView, { AXIS, UI_VIEW_ID, UI_REF_LIST, UI_REF, UI_SIZE } from "./model/UIView"

export default class UICore {
    private scrollWidth: number

    /**
     * @constructor
     * @param {Number} scrollWidth
     */
    constructor(scrollWidth: number) {
        this.scrollWidth = scrollWidth
    }

    public calculateScreen(screen: UIView) {
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
            )
            this.calculateViews(
                AXIS.Y,
                screen.childrenOrder[AXIS.Y],
                screen,
                arrayViews,
                indexes,
                screen.positions[AXIS.Y].size,
                viewsRestored,
            )
        } while (viewsRestored.length > 0)
    }

    private calculateViews(
        axis: AXIS,
        views: UIView[],
        parentView: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        width: number,
        viewsRestored: UIView[],
    ) {
        for (var i = 0; i < views.length; i++) {
            if (views[i].hasToBeCalculated()) {
                this.calculateView(axis, views[i], parentView, arrayViews, indexes, width, viewsRestored)
            }
        }
    }

    private calculateView(
        axis: AXIS,
        view: UIView,
        parentView: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        width: number,
        viewsRestored: UIView[],
    ) {
        //eval references to try to calculate the width
        var numDependencies = 0
        var reference = view.getReference(axis)
        for (const refId of UI_REF_LIST) {
            var dependency = this.translateViewDependency(view, reference[refId], parentView)
            if (dependency.length > 0) {
                this.evalDependence(axis, view, parentView, width, refId, arrayViews[indexes[dependency]])
                numDependencies += 1
            }
        }

        //set left parent if there is not dependencies
        if (numDependencies == 0 && !view.attrs[axis].center) {
            view.positions[axis].start = 0
            view.positions[axis].startChanged = true
        }

        //calculate width
        if (view.attrs[axis].size == UI_VIEW_ID.SCREEN) {
            //fixed width
            this.applyFixedSize(axis, view)
        } else if (view.attrs[axis].size == UI_SIZE.PERCENTAGE) {
            //apply percent
            this.applyPercent(axis, view, parentView, width)
        }

        //apply margins to left and right
        this.assignMargins(axis, view)

        //calculate width if it is possible
        if (view.positions[axis].startChanged && view.positions[axis].endChanged) {
            //calculate the width
            this.assignSize(axis, view, width)

            //check gravity
            this.assignCenter(axis, view, width)

            //if there are children we eval them with width restrictions
            if (view.childrenOrder[axis].length > 0) {
                //calculate the real width with padding
                var viewWidth = view.attrs[axis].scroll
                    ? 0
                    : view.positions[axis].size - view.positions[axis].paddingStart - view.positions[axis].paddingEnd
                this.calculateViews(axis, view.childrenOrder[axis], view, arrayViews, indexes, viewWidth, viewsRestored)

                //move left and right of all children using the paddingLeft
                this.applyPaddingChildren(axis, view)
            }
        } else {
            //if there are children we calculate the size of the children
            //giving the width of the parent
            if (view.childrenOrder[axis].length > 0) {
                //calculate the real width with padding
                var viewWidth = 0 //view.scrollHorizontal? 0 : width;
                this.calculateViews(axis, view.childrenOrder[axis], view, arrayViews, indexes, viewWidth, viewsRestored)

                //move left and right of all children using the paddingLeft
                this.applyPaddingChildren(axis, view)

                //set the width of the children
                this.applySizeChildren(axis, view, arrayViews, indexes, viewsRestored)
            } else {
                //else if there are not children we calculate the content size
                this.applySizeContent(axis, view)
            }

            //calculate the width
            this.assignSize(axis, view, width)

            //check gravity
            this.assignCenter(axis, view, width)
        }

        //check if size of children if bigger than container to add vertical scroll
        if (this.applyScroll(axis, view, width)) {
            //apply the padding of the scroll to the element
            view.positions[axis == AXIS.X ? AXIS.Y : AXIS.X].paddingEnd += this.scrollWidth
            view.positions[axis].scrollApplied = true

            //save the view as one to recalculate
            viewsRestored.push(view)
        }
    }

    private assignSize(axis: AXIS, view: UIView, size: number) {
        //if parent has size we force the space to the parent
        if (size > 0) {
            if (view.positions[axis].end > size) {
                view.positions[axis].end = size
            }
            if (view.positions[axis].start < 0) {
                view.positions[axis].start = 0
            }
        }
        view.positions[axis].size = view.positions[axis].end - view.positions[axis].start
    }

    private applyFixedSize(axis: AXIS, view: UIView) {
        //set left and top if they are not setted
        if (view.positions[axis].endChanged) {
            view.positions[axis].start = view.positions[axis].end - view.attrsCalc[axis].sizeValue
            view.positions[axis].startChanged = true
        } else {
            view.positions[axis].end = view.positions[axis].start + view.attrsCalc[axis].sizeValue
            view.positions[axis].startChanged = true
            view.positions[axis].endChanged = true
        }
    }

    /**
     * Add the padding of the view to all its children
     * @param view parent
     **/
    private applyPaddingChildren(axis: AXIS, view: UIView) {
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
    private applyScroll(axis: AXIS, view: UIView, width: number) {
        if (view.attrs[axis].scroll) {
            var max = 0
            for (const child of view.getUIChildren()) {
                if (child.positions[axis].end > max) {
                    max = child.positions[axis].end
                }
            }
            if (max > width + view.positions[axis].start) {
                //check it here and not before because in the future we could change this state to not scroll without recalculate everything
                if (!view.positions[axis].scrollApplied) {
                    //apply style to show scroll
                    var element = document.getElementById(view.id)
                    element.style.overflowX = "auto"

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
    private applySizeContent(axis: AXIS, view: UIView) {
        //if the size depends of children, calculate the position of children
        if (view.positions[axis].endChanged) {
            view.positions[axis].start = view.positions[axis].end - view.attrsCalc[axis].sizeValue
            view.positions[axis].startChanged = true
        } else if (view.positions[axis].startChanged) {
            view.positions[axis].end = view.positions[axis].start + view.attrsCalc[axis].sizeValue
            view.positions[axis].endChanged = true
            view.positions[axis].startChanged = true
        }
    }

    /**
     * Calculate the left or the right with the size of the children if the sizeWidth is "sc"
     * @param view View to set the size
     **/
    private applySizeChildren(
        axis: AXIS,
        view: UIView,
        arrayViews: UIView[],
        indexes: { [key: string]: number },
        viewsRestored: UIView[],
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
                if (child.attrsCalc[axis].sizeValue > sizeChildren) {
                    sizeChildren = child.attrsCalc[axis].sizeValue
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
            view.positions[axis].startChanged = true
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
                this.calculateView(axis, child, view, arrayViews, indexes, sizeChildren, viewsRestored)
            }
        }
    }

    /**
     * Apply percent to a view with a width setted
     * @param view View to set percent
     * @param parentView View of the parent to know its size
     * @param width width to apply if right was not applied
     **/
    private applyPercent(axis: AXIS, view: UIView, parentView: UIView, width: number) {
        if (view.positions[axis].endChanged && !view.positions[axis].startChanged) {
            view.positions[axis].start =
                view.positions[axis].end - (parentView.positions[axis].size * view.attrsCalc[axis].sizeValue) / 100
        } else {
            view.positions[axis].end =
                view.positions[axis].start + (parentView.positions[axis].size * view.attrsCalc[axis].sizeValue) / 100
        }

        //move the percent if necessary
        if (view.attrsCalc[axis].percentPos > 0) {
            var percentWidth = (view.positions[axis].end - view.positions[axis].start) * view.attrsCalc[axis].percentPos
            view.positions[axis].start += percentWidth
            view.positions[axis].end += percentWidth
        }

        //mark left and right as changed
        view.positions[axis].endChanged = true
        view.positions[axis].startChanged = true
    }

    /**
     * Assign gravity values to the view
     * @param view View to get and change values
     * @param size int
     **/
    private assignCenter(axis: AXIS, view: UIView, size: number) {
        //horizontal
        if (view.attrs[axis].center && size > 0) {
            var viewWidth = view.positions[axis].size > 0 ? view.positions[axis].size : view.attrsCalc[axis].sizeValue
            view.positions[axis].start = Math.max(0, (size - viewWidth) / 2)
            view.positions[axis].end = Math.min(size, view.positions[axis].start + viewWidth)
            view.positions[axis].startChanged = true
            view.positions[axis].endChanged = true
            view.positions[axis].size = view.positions[axis].end - view.positions[axis].start
        }
    }

    /**
     * Assign margin values to the view
     * @param view View to get and change values
     **/
    private assignMargins(axis: AXIS, view: UIView) {
        //get real margin values
        var viewMarginStart = view.positions[axis].marginStart
        var viewMarginEnd = view.positions[axis].marginEnd

        if (viewMarginStart != 0 && view.positions[axis].startChanged) {
            view.positions[axis].start += viewMarginStart
            if (!view.positions[axis].endChanged || view.attrs[axis].size == UI_SIZE.SCREEN) {
                view.positions[axis].end += viewMarginStart
            }
        }
        if (viewMarginEnd != 0 && view.positions[axis].endChanged) {
            view.positions[axis].end -= viewMarginEnd
            if (!view.positions[axis].startChanged || view.attrs[axis].size == UI_SIZE.SCREEN) {
                view.positions[axis].start -= viewMarginEnd
            }
        }
    }

    /**
     * Set left, top, right, bottom values for the reference received
     * @param view to set the values
     * @param parentView to check and get values
     * @param iReference index of reference to evaluate
     * @param viewDependency from wich get the value
     **/
    private evalDependence(
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

    private translateViewDependency(view: UIView, viewDependency: string, parentView: UIView): string {
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
