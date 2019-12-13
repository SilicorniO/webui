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
        this.drawVisibility(element, draw, configurationAnimations)
    }

    private static drawBackground(element: HTMLElement, draw: UIDraw) {
        // apply background
        element.style.backgroundColor = draw.backgroundColor
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
        // apply transition
        element.style.transition = draw.transition

        // remove transition if necessary
        if (draw.transition.length > 0 && !draw.transitionForever) {
            //remove transition after the end of the animation
            var endTranstion = (event: any) => {
                Log.log(event)
                element.style.transition = ""
                element.removeEventListener("transitionend", endTranstion)
            }
            element.addEventListener("transitionend", endTranstion)
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

    public static drawVisibility(
        element: HTMLElement,
        draw: UIDraw,
        configurationAnimations: UIConfigurationDataAnimations,
    ) {
        //hide view if visibility is gone
        var opacityOld = element.style.opacity
        if (configurationAnimations.defaultOpacity && draw.opacity != opacityOld) {
            element.style.transition = "opacity " + configurationAnimations.defaultTime + "s ease 0s"
        }
        element.style.opacity = draw.opacity
    }
}
