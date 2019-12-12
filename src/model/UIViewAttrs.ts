import UIAttr from "./UIAttr"
import { UI_VISIBILITY } from "./UIVisibility"
import { AXIS } from "./UIAxis"

export default class UIViewAttrs {
    // axis
    public x: UIAttr = new UIAttr()
    public y: UIAttr = new UIAttr()

    // visibility
    public visibility: UI_VISIBILITY = UI_VISIBILITY.VISIBLE

    public getAxis(axis: AXIS): UIAttr {
        switch (axis) {
            case AXIS.X:
                return this.x
            case AXIS.Y:
                return this.y
            default:
                return new UIAttr()
        }
    }

    public clean() {
        this.x.clean()
        this.y.clean()
        this.visibility = UI_VISIBILITY.VISIBLE
    }
}
