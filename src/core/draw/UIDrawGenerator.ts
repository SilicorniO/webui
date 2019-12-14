import { AXIS, UIAxis } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import UIPosition from "../../model/UIPosition"
import UIDraw, { UIDrawAnimation } from "../../model/UIDraw"
import UIViewAttrs from "../../model/UIViewAttrs"

export interface DrawGeneratorChildResult {
    maxPosition: UIAxis<number>
    draw: UIDraw
}

/**
 * @constructor
 */
export default class UIDrawGenerator {
    public static generateScreenDraw(
        attrs: UIViewAttrs,
        positions: UIAxis<UIPosition>,
        childrenSize: UIAxis<number>,
        viewColors: boolean,
    ): UIDraw {
        // generate the draw object to return
        const draw = new UIDraw()

        // apply all
        this.applyBackground(viewColors, draw)
        this.applyVisibility(attrs, draw)
        this.applySizeScreen(attrs, positions, childrenSize, draw)

        // return the draw object
        return draw
    }

    private static applySizeScreen(
        attrs: UIViewAttrs,
        positions: UIAxis<UIPosition>,
        childrenSize: UIAxis<number>,
        draw: UIDraw,
    ) {
        // apply size
        if (attrs[AXIS.X].size == UI_SIZE.SCREEN) {
            draw.width = positions[AXIS.X].size + "px"
        } else if (attrs[AXIS.X].size == UI_SIZE.PERCENTAGE) {
            draw.width = attrs[AXIS.X].sizeValue + "%"
        } else {
            draw.width = childrenSize.x + "px"
        }
        if (attrs[AXIS.Y].size == UI_SIZE.SCREEN) {
            draw.height = positions[AXIS.Y].size + "px"
        } else if (attrs[AXIS.Y].size == UI_SIZE.PERCENTAGE) {
            draw.height = attrs[AXIS.Y].sizeValue + "%"
        } else {
            draw.height = childrenSize.y + "px"
        }
    }

    public static generateChildDraw(
        attrs: UIViewAttrs,
        positions: UIAxis<UIPosition>,
        animations: UIDrawAnimation[],
        parentVisibility: UI_VISIBILITY,
        viewColors: boolean,
    ): DrawGeneratorChildResult {
        // generate the draw object to return
        const draw = new UIDraw()

        // apply all
        this.applyBackground(viewColors, draw)
        const maxPosition = this.applyPosition(positions, draw)
        this.applyVisibility(attrs, draw, parentVisibility)
        this.applyAnimation(animations, draw)

        // return the draw object
        return {
            maxPosition,
            draw,
        }
    }

    private static applyBackground(viewColors: boolean, draw: UIDraw) {
        if (!viewColors) {
            return
        }

        // apply background
        draw.backgroundColor = this.generateRandomViewColor()
    }

    private static applyAnimation(animations: UIDrawAnimation[], draw: UIDraw) {
        //apply animation
        if (animations.length > 0) {
            // read first animation and pop from stack
            const firstAnimation = animations[0]
            animations.splice(0, 1)

            // apply transition
            draw.transition = "all " + firstAnimation.duration + "s ease 0s"
            draw.onTransitionEnd = firstAnimation.onEnd
        }
    }

    private static applyPosition(positions: UIAxis<UIPosition>, draw: UIDraw): UIAxis<number> {
        //set location
        const left = positions[AXIS.X].start
        const top = positions[AXIS.Y].start
        const width = positions[AXIS.X].size > 0 ? positions[AXIS.X].size : 0
        const height = positions[AXIS.Y].size > 0 ? positions[AXIS.Y].size : 0
        draw.left = left + "px"
        draw.top = top + "px"
        draw.width = width + "px"
        draw.height = height + "px"

        return {
            x: left + width,
            y: top + height,
        }
    }

    /**
     * Apply visibility for the views
     * @param {UIView} view to change visibility
     * @param {UIView} parentView to know visibility of the parent
     * @param {UIConfiguration} configuration to know time of animations
     * @param {boolean} forceGone flag to know if parent is not being displayed because is gone
     **/
    public static applyVisibility(attrs: UIViewAttrs, draw: UIDraw, parentVisibility?: UI_VISIBILITY) {
        if (attrs.visibility == "g" || parentVisibility == UI_VISIBILITY.GONE) {
            draw.display = "none"
            draw.opacity = "0"
        } else {
            draw.display = "inline-block"
            if (attrs.visibility == UI_VISIBILITY.INVISIBLE || parentVisibility == UI_VISIBILITY.INVISIBLE) {
                draw.opacity = "0"
            } else {
                draw.opacity = "1"
            }
        }
    }

    private static generateRandomViewColor() {
        const r = parseInt("" + Math.random() * 255, 10)
        const g = parseInt("" + Math.random() * 255, 10)
        const b = parseInt("" + Math.random() * 255, 10)
        return "rgba(" + r + "," + g + "," + b + ",0.4)"
    }
}
