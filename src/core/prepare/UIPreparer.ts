import UIView from "../../model/UIView"
import DomSizeUtils from "../../utils/domsize/DomSizeUtils"
import UIConfiguration from "../../UIConfiguration"
import UIHTMLElement from "../../model/UIHTMLElement"
import { AXIS } from "../../model/UIAxis"
import UIAttr, { UI_SIZE } from "../../model/UIAttr"
import { UIViewState } from "../../model/UIViewState"
import UIPosition from "../../model/UIPosition"

export default class UIPreparer {
    public static prepareScreen(view: UIView, configuration: UIConfiguration) {
        // check this screen needs to be prepared
        if (view.getState() >= UIViewState.PREPARE) {
            return
        }

        // update the size of the screen
        if (view.parent == null) {
            UIPreparer.loadSizeScreen(view)
        }

        // load sizes of views
        UIPreparer.loadSizes(view.getChildElements(), configuration)

        // update state of the screen
        view.setState(UIViewState.PREPARE)
    }

    /**
     * Load the sizes of all views and translate paddings and margins to dimens
     * @param {Array<*>} elements Array of dom nodes to load size
     * @param {UIConfiguration} coreConfig
     * @param {boolean} forceSizeLoaded
     **/
    public static loadSizes(elements: UIHTMLElement[], coreConfig: UIConfiguration) {
        for (let i = 0; i < elements.length; i++) {
            const ele = elements[i]
            const view = ele.ui
            if (view.getState() < UIViewState.PREPARE) {
                if (!view.isGone()) {
                    // show view if it is not visible
                    if (ele.style.display == "none") {
                        ele.style.display = "inline-block"
                    }

                    // get width of size content view
                    if (view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.X].sizeValue = DomSizeUtils.calculateWidthView(ele)
                    }

                    // get height of size content view
                    if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.Y].sizeValue = DomSizeUtils.calculateHeightView(ele)
                    }

                    // load children
                    this.loadSizes(view.getChildElements(), coreConfig)
                }

                //mark the sizeLoaded flag of this view as true
                view.setState(UIViewState.PREPARE)
            }
        }
    }

    public static loadSizeScreen(screen: UIView) {
        // get the element
        const ele = screen.element

        // show view if it is not visible
        if (ele.style.display == "none") {
            ele.style.display = "inline-block"
        }

        // flag to know if screen has children
        const screenHasUIChildren = screen.hasUIChildren()

        // apply width and height if they are defined
        this.calculateScreenPosition(ele, AXIS.X, screen.attrs[AXIS.X], screen.positions[AXIS.X], screenHasUIChildren)
        this.calculateScreenPosition(ele, AXIS.Y, screen.attrs[AXIS.Y], screen.positions[AXIS.Y], screenHasUIChildren)

        // change position to relative because all screen are relative
        ele.style.position = "relative"
    }

    /**
     * Calculate screen position for an axis
     * @param element
     * @param axis
     * @param attr
     * @param position
     * @param hasUIChildren
     * @return sizeChanged as boolean
     */
    private static calculateScreenPosition(
        element: HTMLElement,
        axis: AXIS,
        attr: UIAttr,
        position: UIPosition,
        hasUIChildren: boolean,
    ) {
        // clean positionn because they are going to be calculated again
        position.clean()

        // if it is size content we calculate the size with the children
        if (attr.size == UI_SIZE.SIZE_CONTENT) {
            if (hasUIChildren) {
                return
            }

            // apply content size
            if (axis == AXIS.X) {
                position.size = DomSizeUtils.calculateWidthView(element)
            } else if (axis == AXIS.Y) {
                position.size = DomSizeUtils.calculateHeightView(element)
            }
        } else {
            let style = ""
            if (attr.size == UI_SIZE.SCREEN) {
                style = attr.sizeValue + "px"
            } else if (attr.size == UI_SIZE.PERCENTAGE) {
                style = attr.sizeValue + "%"
            }

            let offset = 0
            if (axis == AXIS.X) {
                element.style.width = style
                offset = Math.ceil(element.getBoundingClientRect().width)
            } else if (axis == AXIS.Y) {
                element.style.height = style
                offset = Math.ceil(element.getBoundingClientRect().height)
            }

            if (offset != position.size) {
                position.size = offset
            }
        }

        // set end with the size
        position.end = position.size

        // mark as changed
        position.endChanged = true
        position.startChanged = true
    }
}
