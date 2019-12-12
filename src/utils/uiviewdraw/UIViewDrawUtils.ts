import Log from "../log/Log"
import UIView from "../../model/UIView"
import UIConfiguration from "../../UIConfiguration"
import { AXIS } from "../../model/UIAxis"
import { UI_SIZE, UI_VIEW_ID } from "../../model/UIAttr"
import { UI_VISIBILITY } from "../../model/UIVisibility"

export interface UIViewDrawPosition {
    maxX: number
    maxY: number
}

/**
 * @constructor
 */
export default class UIViewDrawUtils {
    /**
     * Apply positions for the views
     * @param {UIView} parentView to draw children
     * @param {boolean} viewColors flag to show or not colors in views
     * @return int maximum Y positon of a children
     **/
    public static applyPositions(parentView: UIView, viewColors: boolean): UIViewDrawPosition {
        var maxX = 0
        var maxY = 0

        var paddingLeft = 0
        var paddingRight = 0
        var paddingTop = 0
        var paddingBottom = 0

        //apply view color if activated
        if (viewColors) {
            parentView.element.style.backgroundColor = this.generateRandomViewColor()
        }

        const uiChildren = parentView.getUIChildren()
        for (const view of uiChildren) {
            var ele = view.element

            //initialize paddings
            paddingLeft = 0
            paddingRight = 0
            paddingTop = 0
            paddingBottom = 0

            //get paddings
            if (ele.childElementCount == 0) {
                var curStyle = window.getComputedStyle(ele)
                if (view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT) {
                    paddingLeft = parseInt(curStyle.paddingLeft, 10)
                    paddingRight = parseInt(curStyle.paddingRight, 10)
                }
                if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT) {
                    paddingTop = parseInt(curStyle.paddingTop, 10)
                    paddingBottom = parseInt(curStyle.paddingBottom, 10)
                }
            }

            //set values necessary for framework
            ele.style.display = "inline-block"
            ele.style.margin = "auto"
            if (ele.childElementCount > 0) {
                ele.style.padding = "0px"
            }

            //apply animation
            if (view.animationDurations.length > 0) {
                ele.style.transition = "all " + view.animationDurations[0] + "s ease 0s"
                ele.ui.animationDurations.splice(0, 1)

                //remove transition after the end of the animation
                var endTranstion = (event: any) => {
                    Log.log(event)
                    ele.style.transition = ""
                    ele.removeEventListener("transitionend", endTranstion)
                }
                ele.addEventListener("transitionend", endTranstion)
            }

            //set location
            var left = view.positions[AXIS.X].start
            var top = view.positions[AXIS.Y].start
            var width = view.positions[AXIS.X].size > 0 ? view.positions[AXIS.X].size - paddingLeft - paddingRight : 0
            var height = view.positions[AXIS.Y].size > 0 ? view.positions[AXIS.Y].size - paddingTop - paddingBottom : 0
            ele.style.left = left + "px"
            ele.style.top = top + "px"
            if (width > 0) {
                ele.style.width = width + "px"
            }
            if (height > 0) {
                ele.style.height = height + "px"
            }
            ele.style.position = "absolute"

            if (view.positions[AXIS.X].start + view.positions[AXIS.X].size > maxX) {
                maxX = view.positions[AXIS.X].start + view.positions[AXIS.X].size
            }
            if (view.positions[AXIS.Y].end + view.positions[AXIS.Y].size > maxY) {
                maxY = view.positions[AXIS.Y].start + view.positions[AXIS.Y].size
            }

            var childrenSize = this.applyPositions(view, viewColors)
            if (childrenSize.maxX > maxX) {
                maxX = childrenSize.maxX
            }
            if (childrenSize.maxY > maxY) {
                maxY = childrenSize.maxY
            }
        }

        return {
            maxX,
            maxY,
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
        view: UIView,
        parentView: UIView,
        configuration: UIConfiguration,
        forceGone: boolean = false,
    ) {
        var ele = view.element

        //hide view if visibility is gone
        var opacityOld = parseInt(ele.style.opacity, 10)
        var opacityNow = opacityOld
        if (view.visibility == "g" || forceGone) {
            ele.style.display = "none"
            opacityNow = 0
        } else {
            ele.style.display = "inline-block"
            if (
                view.visibility == UI_VISIBILITY.INVISIBLE ||
                (parentView && parentView.visibility == UI_VISIBILITY.INVISIBLE)
            ) {
                // ele.style.visibility = "hidden";
                opacityNow = 0
            } else {
                // ele.style.visibility = "visible";
                opacityNow = 1
            }
        }
        if (configuration.animations.defaultOpacity && opacityNow != opacityOld) {
            ele.style.transition = "opacity " + configuration.animations.defaultTime + "s ease 0s"
        }
        ele.style.opacity = "" + opacityNow

        for (const childView of view.getUIChildren()) {
            this.applyVisibility(childView, view, configuration, ele.style.display == "none")
        }
    }

    private static generateRandomViewColor() {
        var r = parseInt("" + Math.random() * 255, 10)
        var g = parseInt("" + Math.random() * 255, 10)
        var b = parseInt("" + Math.random() * 255, 10)
        return "rgba(" + r + "," + g + "," + b + ",0.4)"
    }

    /**
     * Check if we have to set a bigger height to the screen
     * @param screenView View of screen using
     * @param width int minimum width for the screen
     * @param height int minimum height for the screen
     **/
    public static applySizeScreen(screenView: UIView, width: number, height: number) {
        var ele = document.getElementById(screenView.id)
        if (screenView.id != UI_VIEW_ID.SCREEN && ele != null) {
            if (screenView.attrs[AXIS.X].size == UI_SIZE.SCREEN) {
                ele.style.width = screenView.positions[AXIS.X].size + "px"
            } else if (screenView.attrs[AXIS.X].size == UI_SIZE.PERCENTAGE) {
                ele.style.width = screenView.positions[AXIS.X].sizeValue + "%"
            } else {
                ele.style.width = width + "px"
            }
            if (screenView.attrs[AXIS.Y].size == UI_SIZE.SCREEN) {
                ele.style.height = screenView.positions[AXIS.Y].size + "px"
            } else if (screenView.attrs[AXIS.Y].size == UI_SIZE.PERCENTAGE) {
                ele.style.height = screenView.positions[AXIS.Y].sizeValue + "%"
            } else {
                ele.style.height = height + "px"
            }
        }
    }
}
