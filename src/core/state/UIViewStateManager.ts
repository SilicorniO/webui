import UIView, { UIViewStateChange } from "../../model/UIView"
import { AXIS, AXIS_LIST } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { WebUIListener } from "../../WebUI"
import UIViewStateUtils from "./UIViewStateUtils"
import { UIViewState } from "../../model/UIViewState"

export default class UIViewStateManager {
    // state of the view
    private state: UIViewState = UIViewState.NONE

    // associated screen
    private view: UIView

    // associated listener for redraw events
    private webUIListener: WebUIListener

    constructor(view: UIView, webUIListener: WebUIListener) {
        this.view = view
        this.webUIListener = webUIListener
    }

    // ----- PUBLIC -----

    public changeState(change: UIViewStateChange, axis?: AXIS): UIView | null {
        // view to refresh
        let oldestView: UIView | null = null

        if (axis != null) {
            // eval type of change
            switch (change) {
                case UIViewStateChange.SIZE:
                    oldestView = this.changeStateSize(axis)
                    break
                case UIViewStateChange.SIZE_POS:
                    oldestView = this.changeStateSizePos(axis)
                    break
                case UIViewStateChange.START:
                    oldestView = this.changeStateStart(axis)
                    break
                case UIViewStateChange.END:
                    oldestView = this.changeStateEnd(axis)
                    break
                case UIViewStateChange.CENTER:
                    oldestView = this.changeStateCenter(axis)
                    break
                case UIViewStateChange.MARGIN_START:
                    oldestView = this.changeStateMarginStart(axis)
                    break
                case UIViewStateChange.MARGIN_END:
                    oldestView = this.changeStateMarginEnd(axis)
                    break
                case UIViewStateChange.PADDING_START:
                case UIViewStateChange.PADDING_END:
                    oldestView = this.changeStatePadding(axis)
                    break
                case UIViewStateChange.SCROLL:
                    oldestView = this.changeStateScroll(axis)
                    break
                default:
                    break
            }
        } else {
            // eval type of change
            switch (change) {
                case UIViewStateChange.VISIBILITY:
                    oldestView = this.changeStateVisibility()
                    break
                case UIViewStateChange.VISIBILITY_GONE:
                    oldestView = this.changeStateVisibilityGone()
                    break
                case UIViewStateChange.CHILD_NODE_ADDED:
                    oldestView = this.changeStateChildNodeAdded()
                    break
                case UIViewStateChange.CHILD_NODE_REMOVED:
                    oldestView = this.changeStateChildNodeRemoved()
                    break
                case UIViewStateChange.PARENT_RESIZED:
                    oldestView = this.changeStateParentResized()
                    break
                case UIViewStateChange.ATTRIBUTE_MODIFIED:
                    oldestView = this.changeStateAttributeModified()
                    break
                default:
                    break
            }
        }

        // check it is all
        if (change == UIViewStateChange.ALL) {
            oldestView = this.changeStateAll()
        }

        // refresh the view
        if (oldestView != null) {
            this.webUIListener.onViewRedraw(oldestView)
        }

        return oldestView
    }

    public setState(state: UIViewState) {
        this.state = state
    }

    public getState(): UIViewState {
        return this.state
    }

    // ----- PRIVATE ------

    private setViewLowerState(state: UIViewState): UIView | null {
        return UIViewStateUtils.setLowerState(this.view, state)
    }

    private setParentOrViewLowerState(state: UIViewState): UIView | null {
        const viewParent = this.view.parent
        if (viewParent != null) {
            UIViewStateUtils.setLowerState(viewParent, state)
            UIViewStateUtils.setLowerState(this.view, state)
            const mainView = UIViewStateUtils.setLowerStateToParents(viewParent, state)
            UIViewStateUtils.setLowerStateToChildren(mainView, UIViewState.ORGANIZE)
            return mainView
        } else {
            UIViewStateUtils.setLowerState(this.view, state)
            const mainView = UIViewStateUtils.setLowerStateToParents(this.view, state)
            UIViewStateUtils.setLowerStateToChildren(mainView, UIViewState.ORGANIZE)
            return this.view
        }
    }

    // ------ CHANGE STATE -----

    private changeStateAll(): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.NONE)
    }

    private changeStateSize(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStateSizePos(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStateStart(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.PREPARE)
    }

    private changeStateEnd(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.PREPARE)
    }

    private changeStateCenter(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStateMarginStart(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStateMarginEnd(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStatePadding(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.ORGANIZE)
    }

    private changeStateScroll(axis: AXIS): UIView | null {
        return this.setParentOrViewLowerState(UIViewState.PREPARE)
    }

    private changeStateVisibility(): UIView | null {
        // visibility of view has changed between invisible and visible
        return this.setViewLowerState(UIViewState.CALCULATE)
    }

    private changeStateVisibilityGone(): UIView | null {
        // visibility of view has changed between gone and visible or invisible
        return this.setParentOrViewLowerState(UIViewState.DOM)
    }

    private changeStateChildNodeAdded(): UIView | null {
        // change state of this view to DOM
        return this.setParentOrViewLowerState(UIViewState.NONE)
    }

    private changeStateChildNodeRemoved(): UIView | null {
        // change state of this view to DOM
        return this.setParentOrViewLowerState(UIViewState.NONE)
    }

    private changeStateParentResized(): UIView | null {
        // this view should be an screen, change state if size is percentage
        let percentageSize = false
        for (const axis of AXIS_LIST) {
            percentageSize = percentageSize || this.view.attrs[axis].size == UI_SIZE.PERCENTAGE
        }

        // if no percentage size, the size of the view didn't change
        if (!percentageSize) {
            return null
        }

        // calculate again with new space
        return this.setViewLowerState(UIViewState.CALCULATE)
    }

    private changeStateAttributeModified(): UIView | null {
        // change state of this view to DOM
        return this.setParentOrViewLowerState(UIViewState.NONE)
    }
}
