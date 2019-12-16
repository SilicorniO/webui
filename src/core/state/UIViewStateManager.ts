import UIView, { UIViewState, UIViewStateChange } from "../../model/UIView"
import { AXIS } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { WebUIListener } from "../../WebUI"

export default class UIViewStateManager {
    // state of the view
    private state: UIViewState = UIViewState.DOM

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
                case UIViewStateChange.SIZE_POS:
                    oldestView = this.changeStateSizePos(axis)
                case UIViewStateChange.START:
                    oldestView = this.changeStateStart(axis)
                case UIViewStateChange.END:
                    oldestView = this.changeStateEnd(axis)
                case UIViewStateChange.CENTER:
                    oldestView = this.changeStateCenter(axis)
                case UIViewStateChange.MARGIN_START:
                    oldestView = this.changeStateMarginStart(axis)
                case UIViewStateChange.MARGIN_END:
                    oldestView = this.changeStateMarginEnd(axis)
                case UIViewStateChange.PADDING_START:
                case UIViewStateChange.PADDING_END:
                    oldestView = this.changeStatePadding(axis)
                case UIViewStateChange.SCROLL:
                    oldestView = this.changeStateScroll(axis)
                default:
                    break
            }
        } else {
            // eval type of change
            switch (change) {
                case UIViewStateChange.VISIBILITY:
                    oldestView = this.changeStateVisibility()
                case UIViewStateChange.CHILD_NODE_ADDED:
                    oldestView = this.changeStateChildNodeAdded()
                case UIViewStateChange.CHILD_NODE_REMOVED:
                    oldestView = this.changeStateChildNodeRemoved()
                case UIViewStateChange.PARENT_RESIZED:
                    oldestView = this.changeStateParentResized()
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

        // // check state is not smaller, then we don't need to do the change
        // if (this.state <= state) {
        //     return
        // }
        // // change state of the view
        // this.state = state
        // // check how this change the state affect to parent
        // this.evalParentState(state)
        // // check how this change the state affect to children
        // this.evalChildrenState(state)
    }

    public setState(state: UIViewState) {
        this.state = state
    }

    public getState(): UIViewState {
        return this.state
    }

    // ----- PRIVATE ------

    private setLowerState(state: UIViewState) {
        // check this is lower state
        if (state >= this.state) {
            return
        }

        // set state
        this.state = state
    }

    private setParentLowerState(state: UIViewState) {
        // check this view has parent
        const viewParent = this.view.parent
        if (viewParent == null) {
            return
        }

        // check this is lower state
        if (state >= viewParent.getState()) {
            return
        }

        // set state
        viewParent.setState(state)
    }

    // private evalParentState(state: UIViewState) {
    //     // if no parent we stop
    //     if (this.view.parent == null) {
    //         return
    //     }

    //     // if parent has less state we stop
    //     if (this.view.parent.getState() <= state) {
    //         return
    //     }

    //     // continue changing state to parent
    //     this.view.parent.changeState(state)
    // }

    // private evalChildrenState(state: UIViewState) {
    //     // if no children we stop
    //     const children = this.view.getUIChildren()
    //     if (children.length === 0) {
    //         return
    //     }

    //     // change state of children if necessary
    //     for (const child of children) {
    //         // TODO eval how each child is affected by the change of state of the view
    //         child.changeState(state)
    //     }
    // }

    // ------ CHANGE STATE -----

    private changeStateAll(): UIView | null {
        // change state to organize and parent to calculate
        this.setLowerState(UIViewState.DOM)

        // if parent is size content, the size might change
        let view: UIView | null = this.view
        const parentView = this.view.parent
        if (parentView != null) {
            view = parentView.changeState(UIViewStateChange.ALL)
        }

        // return parent as first view to check
        return view
    }

    private changeStateSize(axis: AXIS): UIView | null {
        // change state to organize and parent to calculate
        this.setLowerState(UIViewState.CALCULATE)
        this.setParentLowerState(UIViewState.CALCULATE)

        // if parent is size content, the size might change
        const parentView = this.view.parent
        if (parentView != null && parentView.attrs[axis].size == UI_SIZE.SIZE_CONTENT) {
            parentView.changeState(UIViewStateChange.SIZE, axis)
        }

        // return parent as first view to check
        return parentView || this.view
    }

    private changeStateSizePos(axis: AXIS): UIView | null {
        this.changeState(UIViewStateChange.START, axis)

        return this.view
    }

    private changeStateStart(axis: AXIS): UIView | null {
        // change state to calculate and parent to organize
        this.setLowerState(UIViewState.CALCULATE)
        this.setParentLowerState(UIViewState.ORGANIZE)

        const parentView = this.view.parent
        return parentView || this.view
    }

    private changeStateEnd(axis: AXIS): UIView | null {
        // change state to calculate and parent to organize
        this.setLowerState(UIViewState.CALCULATE)
        this.setParentLowerState(UIViewState.ORGANIZE)

        const parentView = this.view.parent
        return parentView || this.view
    }

    private changeStateCenter(axis: AXIS): UIView | null {
        // change state of parent to calculate
        this.setParentLowerState(UIViewState.CALCULATE)

        return this.view
    }

    private changeStateMarginStart(axis: AXIS): UIView | null {
        return this.changeState(UIViewStateChange.START, axis)
    }

    private changeStateMarginEnd(axis: AXIS): UIView | null {
        return this.changeState(UIViewStateChange.END, axis)
    }

    private changeStatePadding(axis: AXIS): UIView | null {
        return this.changeState(UIViewStateChange.SIZE, axis)
    }

    private changeStateScroll(axis: AXIS): UIView | null {
        return this.changeState(UIViewStateChange.SIZE, axis)
    }

    private changeStateVisibility(): UIView | null {
        return this.view
    }

    private changeStateChildNodeAdded(): UIView | null {
        return this.view
    }

    private changeStateChildNodeRemoved(): UIView | null {
        return this.view
    }

    private changeStateParentResized(): UIView | null {
        return this.view
    }
}
