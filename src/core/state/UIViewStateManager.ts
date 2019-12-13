import UIView, { UIViewState } from "../../model/UIView"

export default class UIViewStateManager {
    // state of the view
    private state: UIViewState = UIViewState.NOT_STARTED

    // associated screen
    private view: UIView

    constructor(view: UIView) {
        this.view = view
    }

    // ----- PUBLIC -----

    public changeState(state: UIViewState) {
        // check state is not smaller, then we don't need to do the change
        if (this.state <= state) {
            return
        }

        // change state of the view
        this.state = state

        // check how this change the state affect to parent
        this.evalParentState(state)

        // check how this change the state affect to children
        this.evalChildrenState(state)
    }

    public setState(state: UIViewState) {
        this.state = state
    }

    public getState(): UIViewState {
        return this.state
    }

    // ----- PRIVATE ------

    private evalParentState(state: UIViewState) {
        // if no parent we stop
        if (this.view.parent == null) {
            return
        }

        // if parent has less state we stop
        if (this.view.parent.getState() <= state) {
            return
        }

        // continue changing state to parent
        this.view.parent.changeState(state)
    }

    private evalChildrenState(state: UIViewState) {
        // if no children we stop
        const children = this.view.getUIChildren()
        if (children.length === 0) {
            return
        }

        // change state of children if necessary
        for (const child of children) {
            // TODO eval how each child is affected by the change of state of the view
            child.changeState(state)
        }
    }
}
