import UIView, { UIViewStateChange } from "../../model/UIView"
import UIConfiguration from "../../UIConfiguration"
import Log from "../../utils/log/Log"
import UIAttrReader, { ATTR } from "../dom/UIAttrReader"
import UIViewEventsUtils from "./UIViewEventsUtils"
import UIViewAttrs from "../../model/UIViewAttrs"

export default class UIViewEventsManager {
    // associated screen
    private view: UIView

    // associated configuration
    private configuration: UIConfiguration

    // flag to disable next ui attribute mutation
    private dismissNextUiAttributeMutation: boolean = false

    constructor(view: UIView, configuration: UIConfiguration) {
        this.view = view
        this.configuration = configuration
    }

    // ----- PUBLIC -----

    public onChangeAttribute(attribute: ATTR, previousAttributes: UIViewAttrs, value?: string | number | boolean) {
        // update ui attribute
        this.dismissNextUiAttributeMutation = true
        this.view.element.setAttribute(this.configuration.attribute, UIAttrReader.generateUiAttr(this.view.attrs))

        // launch change of state
        const aStateChangeAndAxis = UIViewEventsUtils.convertAttrToStateChangeWithAxis(
            attribute,
            previousAttributes,
            value,
        )
        for (const stateChangeAndAxis of aStateChangeAndAxis) {
            this.view.changeState(stateChangeAndAxis.stateChange, stateChangeAndAxis.axis)
        }
    }

    public onLoadElement() {
        this.view.changeState(UIViewStateChange.ELEMENT_LOADED)
    }

    // ----- PRIVATE -----

    public evalAttributeModified(attributeName: string) {
        // check if we have to dismiss it because it is our change
        if (attributeName == this.configuration.attribute && this.dismissNextUiAttributeMutation) {
            this.dismissNextUiAttributeMutation = false
            return
        }

        Log.log(`Event 'attributes' being processed for view ${this.view.id}`)
        this.view.changeState(UIViewStateChange.ATTRIBUTE_MODIFIED)
    }
}
