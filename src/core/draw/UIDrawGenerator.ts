import { AXIS, UIAxis } from "../../model/UIAxis"
import { UI_SIZE, UI_OVERFLOW } from "../../model/UIAttr"
import { UI_VISIBILITY } from "../../model/UIVisibility"
import UIPosition from "../../model/UIPosition"
import UIDraw, { UIDrawAnimation } from "../../model/UIDraw"
import UIViewAttrs from "../../model/UIViewAttrs"
import { UIViewUserStyles } from "../../model/UIView"

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
        userStyles: UIViewUserStyles,
        viewColors: boolean,
    ): UIDraw {
        // generate the draw object to return
        const draw = new UIDraw()

        // apply all
        this.applyBackground(viewColors, draw)
        this.applyVisibility(attrs, draw, userStyles)
        this.applySize(positions, draw)
        this.applyOverflow(attrs, draw)

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
            draw.width = Math.max(0, positions[AXIS.X].end - positions[AXIS.X].start) + "px"
        } else if (attrs[AXIS.X].size == UI_SIZE.PERCENTAGE) {
            draw.width = attrs[AXIS.X].sizeValue + "%"
        } else {
            if (childrenSize.x > 0) {
                draw.width = childrenSize.x + "px"
            } else {
                draw.width = positions[AXIS.X].size + "px"
            }
        }
        if (attrs[AXIS.Y].size == UI_SIZE.SCREEN) {
            draw.height = Math.max(0, positions[AXIS.Y].end - positions[AXIS.Y].start) + "px"
        } else if (attrs[AXIS.Y].size == UI_SIZE.PERCENTAGE) {
            draw.height = attrs[AXIS.Y].sizeValue + "%"
        } else {
            if (childrenSize.y > 0) {
                draw.height = childrenSize.y + "px"
            } else {
                draw.height = positions[AXIS.Y].size + "px"
            }
        }
    }

    public static generateChildDraw(
        attrs: UIViewAttrs,
        positions: UIAxis<UIPosition>,
        animations: UIDrawAnimation[],
        parentVisibility: UI_VISIBILITY,
        userStyles: UIViewUserStyles,
        viewColors: boolean,
    ): DrawGeneratorChildResult {
        // generate the draw object to return
        const draw = new UIDraw()

        // apply all
        this.applyBackground(viewColors, draw)
        const maxPosition = this.applyPosition(positions, draw)
        this.applyVisibility(attrs, draw, userStyles, parentVisibility)
        this.applyAnimation(animations, draw)
        this.applyOverflow(attrs, draw)

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

    private static applySize(positions: UIAxis<UIPosition>, draw: UIDraw) {
        //set location
        const width = Math.max(0, positions[AXIS.X].end - positions[AXIS.X].start)
        const height = Math.max(0, positions[AXIS.Y].end - positions[AXIS.Y].start)
        draw.width = width + "px"
        draw.height = height + "px"
    }

    private static applyPosition(positions: UIAxis<UIPosition>, draw: UIDraw): UIAxis<number> {
        //set location
        const left = positions[AXIS.X].start
        const top = positions[AXIS.Y].start
        const width = Math.max(0, positions[AXIS.X].end - positions[AXIS.X].start)
        const height = Math.max(0, positions[AXIS.Y].end - positions[AXIS.Y].start)
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
    public static applyVisibility(
        attrs: UIViewAttrs,
        draw: UIDraw,
        userStyles: UIViewUserStyles,
        parentVisibility?: UI_VISIBILITY
    ) {
        if (attrs.visibility == "g" || parentVisibility == UI_VISIBILITY.GONE) {
            draw.display = "none"
            draw.opacity = "0"
        } else {
            draw.display = "inline-block"
            if (attrs.visibility == UI_VISIBILITY.INVISIBLE || parentVisibility == UI_VISIBILITY.INVISIBLE) {
                draw.opacity = "0"
            } else {
                draw.opacity = userStyles.opacity || "1"
            }
        }
    }

    /**
     * Apply visibility for the views
     * @param {UIView} view to change visibility
     * @param {UIView} parentView to know visibility of the parent
     * @param {UIConfiguration} configuration to know time of animations
     * @param {boolean} forceGone flag to know if parent is not being displayed because is gone
     **/
    public static applyOverflow(attrs: UIViewAttrs, draw: UIDraw) {
        const overflowX = attrs[AXIS.X].overflow
        const overflowY = attrs[AXIS.Y].overflow

        switch (overflowX) {
            case UI_OVERFLOW.VISIBLE:
                draw.overflowX = "visible"
                break
            case UI_OVERFLOW.SCROLL:
                draw.overflowX = "scroll"
                break
            case UI_OVERFLOW.HIDDEN:
            default:
                draw.overflowX = "hidden"
                break
        }

        switch (overflowY) {
            case UI_OVERFLOW.VISIBLE:
                draw.overflowY = "visible"
                break
            case UI_OVERFLOW.SCROLL:
                draw.overflowY = "scroll"
                break
            case UI_OVERFLOW.HIDDEN:
            default:
                draw.overflowY = "hidden"
                break
        }
    }

    private static generateRandomViewColor() {
        const r = parseInt("" + Math.random() * 255, 10)
        const g = parseInt("" + Math.random() * 255, 10)
        const b = parseInt("" + Math.random() * 255, 10)
        return "rgba(" + r + "," + g + "," + b + ",0.4)"
    }
}
