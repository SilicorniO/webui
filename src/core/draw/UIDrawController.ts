import UIView from "../../model/UIView"
import UIDrawGenerator from "./UIDrawGenerator"
import { UIAxis } from "../../model/UIAxis"
import UIConfiguration from "../../UIConfiguration"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import UIDrawer from "./UIDrawer"

export default class UIDrawController {
    public static generateDrawsOfScreen(screen: UIView, configuration: UIConfiguration) {
        // get the maximum position of children
        const childrenMaxPosition: UIAxis<number> = {
            x: 0,
            y: 0,
        }

        // generate draw for all children
        for (const child of screen.getUIChildren()) {
            const childPosition = this.generateDrawOfView(child, screen.attrs.visibility, configuration)

            // update children max positions
            childrenMaxPosition.x = Math.max(childrenMaxPosition.x, childPosition.x)
            childrenMaxPosition.y = Math.max(childrenMaxPosition.y, childPosition.y)
        }

        // generate draw for screen
        const screenDraw = UIDrawGenerator.generateScreenDraw(
            screen.attrs,
            screen.positions,
            childrenMaxPosition,
            configuration.viewColors,
        )

        // set draw to screen
        screen.draw = screenDraw
    }

    private static generateDrawOfView(
        view: UIView,
        screenVisibility: UI_VISIBILITY,
        configuration: UIConfiguration,
    ): UIAxis<number> {
        const childResult = UIDrawGenerator.generateChildDraw(
            view.attrs,
            view.positions,
            view.animationDurations,
            screenVisibility,
            configuration.viewColors,
        )

        // set draw to child
        view.draw = childResult.draw

        for (const child of view.getUIChildren()) {
            this.generateDrawOfView(child, screenVisibility, configuration)
        }

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
