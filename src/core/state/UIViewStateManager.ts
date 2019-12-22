import UIView, { UIViewStateChange } from "../../model/UIView"
import { AXIS, AXIS_LIST } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { WebUIListener } from "../../WebUI"
import UIViewStateUtils from "./UIViewStateUtils"
import { UIViewState } from "../../model/UIViewState"
import Log from "../../utils/log/Log"

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
                case UIViewStateChange.OVERFLOW:
                    oldestView = this.changeStateOverflow(axis)
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
                case UIViewStateChange.CHILD_NODE_MODIFIED:
                    oldestView = this.changeStateChildNodeModified()
                    break
                case UIViewStateChange.PARENT_RESIZED:
                    oldestView = this.changeStateParentResized()
                    break
                case UIViewStateChange.ATTRIBUTE_MODIFIED:
                    oldestView = this.changeStateAttributeModified()
                    break
                case UIViewStateChange.ELEMENT_LOADED:
                    oldestView = this.changeStateElementLoaded()
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

    private static setViewLowerState(view: UIView, state: UIViewState): UIView | null {
        // apply state to view
        UIViewStateUtils.setLowerState(view, state)

        const viewParent = view.parent
        if (viewParent != null) {
            // if (UIViewStateUtils.hasParentDependencyOfView(view) || UIViewStateUtils.hasBrothersDependencOfView(view)) {
            return this.setParentOrViewLowerState(viewParent, state)
            // } else {
            //     return view
            // }
        } else {
            return view
        }
    }

    private static setParentOrViewLowerState(view: UIView, state: UIViewState): UIView | null {
        // apply state to view
        UIViewStateUtils.setLowerState(view, state)

        const viewParent = view.parent
        if (viewParent != null) {
            return UIViewStateManager.setViewLowerState(viewParent, state)
        } else {
            return view
        }
    }

    // ------ CHANGE STATE -----

    private changeStateAll(): UIView | null {
        const view = UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.NONE)
        UIViewStateUtils.setLowerStateToChildren(view || this.view, UIViewState.NONE)
        return view
    }

    private changeStateSize(axis: AXIS): UIView | null {
        // if it is an screen we have to resize the screen
        if (this.view.parent == null) {
            return UIViewStateManager.setViewLowerState(this.view, UIViewState.DOM)
        } else {
            return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
        }
    }

    private changeStateSizePos(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
    }

    private changeStateStart(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.PREPARE)
    }

    private changeStateEnd(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.PREPARE)
    }

    private changeStateCenter(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
    }

    private changeStateMarginStart(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
    }

    private changeStateMarginEnd(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
    }

    private changeStatePadding(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.ORGANIZE)
    }

    private changeStateOverflow(axis: AXIS): UIView | null {
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.PREPARE)
    }

    private changeStateVisibility(): UIView | null {
        // visibility of view has changed between invisible and visible
        return UIViewStateManager.setViewLowerState(this.view, UIViewState.CALCULATE)
    }

    private changeStateVisibilityGone(): UIView | null {
        // visibility of view has changed between gone and visible or invisible
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.DOM)
    }

    private changeStateChildNodeAdded(): UIView | null {
        // change state of this view to DOM
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.NONE)
    }

    private changeStateChildNodeRemoved(): UIView | null {
        // change state of this view to DOM
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.NONE)
    }

    private changeStateChildNodeModified(): UIView | null {
        // change state of this view to DOM
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.DOM)
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
        return UIViewStateManager.setViewLowerState(this.view, UIViewState.CALCULATE)
    }

    private changeStateAttributeModified(): UIView | null {
        // change state of this view to DOM
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.NONE)
    }

    private changeStateElementLoaded(): UIView | null {
        // change state of this view to DOM
        return UIViewStateManager.setParentOrViewLowerState(this.view, UIViewState.DOM)
    }
}
