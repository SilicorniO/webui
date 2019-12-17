import UIAttr, { UIAttrCleanOptions } from "./UIAttr"
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

    public clean(options: UIAttrCleanOptions) {
        this.x.clean(options)
        this.y.clean(options)
        this.visibility = UI_VISIBILITY.VISIBLE
    }

    public clone(): UIViewAttrs {
        const attrs = new UIViewAttrs()

        // axis
        attrs.x = this.x.clone()
        attrs.x = this.y.clone()

        // visibility
        attrs.visibility = this.visibility

        return attrs
    }
}
