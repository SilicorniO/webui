import Log from "../../utils/log/Log"
import UIDraw from "../../model/UIDraw"
import { UIConfigurationDataAnimations } from "../../model/UIConfigurationData"

export interface UIViewDrawPosition {
    maxX: number
    maxY: number
}

/**
 * @constructor
 */
export default class UIDrawer {
    public static drawScreen(
        element: HTMLElement,
        draw: UIDraw,
        configurationAnimations: UIConfigurationDataAnimations,
    ) {
        this.drawBackground(element, draw)
        this.drawSize(element, draw)
        this.drawVisibility(element, draw, configurationAnimations)
    }

    public static drawView(element: HTMLElement, draw: UIDraw, configurationAnimations: UIConfigurationDataAnimations) {
        this.drawBackground(element, draw)
        this.drawChildCommon(element, draw)
        this.drawTransition(element, draw)
        this.drawPosition(element, draw)
        this.drawSize(element, draw)
        this.drawOverflow(element, draw)
        this.drawVisibility(element, draw, configurationAnimations)
    }

    private static drawBackground(element: HTMLElement, draw: UIDraw) {
        // apply background
        if (draw.backgroundColor.length > 0) {
            element.style.backgroundColor = draw.backgroundColor
        }
    }

    private static drawChildCommon(element: HTMLElement, draw: UIDraw) {
        //set values necessary for framework
        element.style.display = draw.display
        element.style.margin = "auto"
        if (element.childElementCount > 0) {
            element.style.padding = "0px"
        }
    }

    private static drawTransition(element: HTMLElement, draw: UIDraw) {
        // flag to know if view is with transition
        const transitionRunning = element.style.transition.length > 0

        // apply transition
        if (draw.transition.length > 0 || !transitionRunning) {
            element.style.transition = draw.transition
        }

        // remove transition if necessary
        if (draw.transition.length > 0 && !transitionRunning) {
            //remove transition after the end of the animation
            const endTransition = (event: any) => {
                // remove transition
                element.style.transition = ""
                element.removeEventListener("transitionend", endTransition)

                // call to listener if we have one
                if (draw.onTransitionEnd != null) {
                    setTimeout(() => {
                        if (draw.onTransitionEnd != null) {
                            draw.onTransitionEnd()
                        }
                    }, 0)
                }
            }
            element.addEventListener("transitionend", endTransition)
        }
    }

    private static drawPosition(element: HTMLElement, draw: UIDraw) {
        element.style.left = draw.left
        element.style.top = draw.top
        element.style.position = "absolute"
    }

    private static drawSize(element: HTMLElement, draw: UIDraw) {
        element.style.width = draw.width
        element.style.height = draw.height
    }

    private static drawOverflow(element: HTMLElement, draw: UIDraw) {
        element.style.overflowX = draw.overflowX
        element.style.overflowY = draw.overflowY
    }

    public static drawVisibility(
        element: HTMLElement,
        draw: UIDraw,
        configurationAnimations: UIConfigurationDataAnimations,
    ) {
        //hide view if visibility is gone
        const opacityOld = element.style.opacity
        if (configurationAnimations.defaultOpacity && draw.opacity != opacityOld) {
            element.style.transition = "opacity " + configurationAnimations.defaultTime + "s ease 0s"
        }
        element.style.opacity = draw.opacity
    }
}
