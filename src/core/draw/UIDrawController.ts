import UIView, { UIViewState } from "../../model/UIView"
import UIDrawGenerator from "./UIDrawGenerator"
import { UIAxis, AXIS } from "../../model/UIAxis"
import UIConfiguration from "../../UIConfiguration"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import UIDrawer from "./UIDrawer"

export default class UIDrawController {
    public static generateDraws(view: UIView, configuration: UIConfiguration) {
        // check if screen has to generate again the draw
        if (view.getState() >= UIViewState.PAINT) {
            return
        }

        // get the maximum position of children
        const childrenMaxPosition: UIAxis<number> = {
            x: 0,
            y: 0,
        }

        // check if it is a screen, screen has special draw
        if (view.parent == null) {
            // generate draw for all children
            for (const child of view.getUIChildren()) {
                const childPosition = this.generateDrawOfView(child, view.attrs.visibility, configuration)

                // update children max positions
                childrenMaxPosition.x = Math.max(childrenMaxPosition.x, childPosition.x)
                childrenMaxPosition.y = Math.max(childrenMaxPosition.y, childPosition.y)
            }

            // generate draw for screen
            const screenDraw = UIDrawGenerator.generateScreenDraw(
                view.attrs,
                view.positions,
                childrenMaxPosition,
                configuration.viewColors,
            )

            // set draw to screen
            view.draw = screenDraw
        } else {
            // generate draw as a child
            this.generateDrawOfView(view, view.attrs.visibility, configuration)
        }

        // update state of screen
        view.setState(UIViewState.PAINT)
    }

    private static generateDrawOfView(
        view: UIView,
        screenVisibility: UI_VISIBILITY,
        configuration: UIConfiguration,
    ): UIAxis<number> {
        for (const child of view.getUIChildren()) {
            this.generateDrawOfView(child, screenVisibility, configuration)
        }

        // check draw is already generated
        if (view.getState() >= UIViewState.PAINT) {
            return {
                x: view.positions[AXIS.X].start + view.positions[AXIS.X].size,
                y: view.positions[AXIS.Y].start + view.positions[AXIS.Y].size,
            }
        }

        const childResult = UIDrawGenerator.generateChildDraw(
            view.attrs,
            view.positions,
            view.animations,
            screenVisibility,
            configuration.viewColors,
        )

        // set draw to child
        view.draw = childResult.draw

        // update state of view
        view.setState(UIViewState.PAINT)

        return childResult.maxPosition
    }

    public static applyDrawsToScreen(screen: UIView, configuration: UIConfiguration) {
        // apply draw to all children
        for (const child of screen.getUIChildren()) {
            this.applyDrawToView(child, configuration)
        }

        // apply draw to screen
        UIDrawer.drawScreen(screen.element, screen.draw, configuration.animations)
    }

    private static applyDrawToView(view: UIView, configuration: UIConfiguration) {
        // apply draw to all children
        for (const child of view.getUIChildren()) {
            this.applyDrawToView(child, configuration)
        }

        // apply to this child
        UIDrawer.drawView(view.element, view.draw, configuration.animations)
    }
}
