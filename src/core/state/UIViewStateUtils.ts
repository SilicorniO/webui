import UIView from "../../model/UIView"
import { UIViewState } from "../../model/UIViewState"
import { AXIS_LIST, AXIS } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"

export default class UIViewStateUtils {
    public static setLowerState(view: UIView, state: UIViewState): boolean {
        // check this is lower state
        if (state >= view.getState()) {
            return false
        }

        // set state
        view.setState(state)

        return true
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

    public static hasParentDependencyOfView(view: UIView): boolean {
        // get parent, if no parent we stop
        const viewParent = view.parent
        if (viewParent == null) {
            return false
        }

        // if parent is size content then it can have dependency
        return (
            viewParent.attrs[AXIS.X].size === UI_SIZE.SIZE_CONTENT ||
            viewParent.attrs[AXIS.Y].size === UI_SIZE.SIZE_CONTENT
        )
    }

    public static hasBrothersDependencOfView(view: UIView): boolean {
        // get parent, if no parent we stop
        const viewParent = view.parent
        if (viewParent == null) {
            return false
        }

        // check a child has depedencies with specific view
        for (const viewBrother of viewParent.getUIChildren()) {
            // discard self
            if (viewBrother.id != view.id) {
                for (const axis of AXIS_LIST) {
                    if (viewBrother.dependencies[axis].includes(view.id)) {
                        return true
                    }
                }
            }
        }

        // return if connected brothers
        return false
    }
}
