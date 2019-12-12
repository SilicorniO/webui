import UIAttr from "./UIAttr"
import { UI_VISIBILITY } from "./UIVisibility"

export default class UIViewAttrs {
    // axis
    public x: UIAttr = new UIAttr()
    public y: UIAttr = new UIAttr()

    // visibility
    public visibility: UI_VISIBILITY = UI_VISIBILITY.VISIBLE

    public clean() {
        this.x.clean()
        this.y.clean()
        this.visibility = UI_VISIBILITY.VISIBLE
    }
}
