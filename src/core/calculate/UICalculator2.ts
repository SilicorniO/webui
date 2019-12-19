import UIView from "../../model/UIView"
import { AXIS, AXIS_LIST } from "../../model/UIAxis"
import UIAttr from "../../model/UIAttr"
import UIPosition from "../../model/UIPosition"
import { UIViewState } from "../../model/UIViewState"
import UIConfiguration from "../../UIConfiguration"
import UICalculatorContentRect from "./UICalculatorContentRect"
import UICalculatorView from "./UICalculatorView"

export default class UICalculator2 {
    public static calculate(view: UIView, configuration: UIConfiguration, scrollSize: number) {
        if (view.getState() >= UIViewState.CALCULATE) {
            return
        }

        // translate magins and paddings to all views
        this.translateMarginsAndPaddings(view, configuration)

        for (const axis of AXIS_LIST) {
            if (view.parent != null) {
                // if it is a view we calculate its parent as a screen
                this.calculateView(axis, view.parent, scrollSize, view.parent.positions[axis].size)
            } else {
                // if view is a screen we calculate it as screen
                this.calculateView(axis, view, scrollSize, view.positions[axis].size)
            }
        }
    }

    private static calculateView(axis: AXIS, view: UIView, scrollSize: number, parentSize: number) {
        // check if it is already calculated
        if (view.getState() >= UIViewState.CALCULATE) {
            return
        }

        const attr = view.attrs[axis]
        const position = view.positions[axis]

        // calculate children
        UICalculatorView.calculate(axis, view, parentSize, scrollSize)

        // if it is the last axis we mark it as calculated
        if (axis == AXIS_LIST[AXIS_LIST.length - 1]) {
            view.setState(UIViewState.CALCULATE)
        }
    }

    // ---- Translators-----

    private static translateMarginsAndPaddings(view: UIView, configuration: UIConfiguration) {
        // check if it is already calculated
        if (view.getState() >= UIViewState.CALCULATE) {
            return
        }

        // translate paddings and margins
        for (const axis of AXIS_LIST) {
            this.translateMargins(view.attrs[axis], configuration, view.positions[axis])
            this.translatePaddings(view.attrs[axis], configuration, view.positions[axis])
        }

        // translate children
        for (const child of view.getUIChildren()) {
            this.translateMarginsAndPaddings(child, configuration)
        }
    }

    private static translateMargins(attr: UIAttr, configuration: UIConfiguration, position: UIPosition) {
        position.marginStart = configuration.getDimen(attr.marginStart)
        position.marginEnd = configuration.getDimen(attr.marginEnd)
    }

    private static translatePaddings(attr: UIAttr, configuration: UIConfiguration, position: UIPosition) {
        position.paddingStart = configuration.getDimen(attr.paddingStart)
        position.paddingEnd = configuration.getDimen(attr.paddingEnd)
    }
}
