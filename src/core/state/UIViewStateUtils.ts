import UIView from "../../model/UIView"
import { UIViewState } from "../../model/UIViewState"
import { AXIS_LIST } from "../../model/UIAxis"

export default class UIViewStateUtils {
    public static setLowerState(view: UIView, state: UIViewState): UIView | null {
        // check this is lower state
        if (state >= view.getState()) {
            return null
        }

        // set state
        view.setState(state)

        return view
    }

    public static setLowerStateToChildren(view: UIView, state: UIViewState) {
        for (const viewChild of view.getUIChildren()) {
            // change state of child
            if (state < viewChild.getState()) {
                viewChild.setState(state)
            }

            // try to change state of its children
            UIViewStateUtils.setLowerStateToChildren(viewChild, state)
        }
    }

    public static setLowerStateToParents(view: UIView, state: UIViewState): UIView {
        // get parent, if no parent we stop
        const viewParent = view.parent
        if (viewParent == null) {
            return view
        }

        // check a child has depedencies with specific view
        let connectedBrothers = false
        for (const viewBrother of viewParent.getUIChildren()) {
            // discard self
            if (viewBrother.id != view.id) {
                for (const axis of AXIS_LIST) {
                    if (viewBrother.dependencies[axis].includes(view.id)) {
                        connectedBrothers = true
                        break
                    }
                }
            }
        }

        // no connected brothers, we return this view as final
        if (!connectedBrothers) {
            return view
        }

        // if there is a connected brother we set organize state to parent and continue to next parent
        if (state < viewParent.getState()) {
            viewParent.setState(state)
        }
        return UIViewStateUtils.setLowerStateToParents(viewParent, state)
    }
}
