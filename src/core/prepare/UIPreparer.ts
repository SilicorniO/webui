import UIView from "../../model/UIView"
import DomSizeUtils from "../../utils/domsize/DomSizeUtils"
import UIConfiguration from "../../UIConfiguration"
import UIHTMLElement from "../../model/UIHTMLElement"
import { AXIS } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { UIViewState } from "../../model/UIViewState"

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
                        view.attrs[AXIS.X].sizeValue = DomSizeUtils.calculateWidthView(view, ele)
                    }

                    // get height of size content view
                    if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.Y].sizeValue = DomSizeUtils.calculateHeightView(view, ele)
                    }

                    // load children
                    this.loadSizes(view.getChildElements(), coreConfig)
                }

                //mark the sizeLoaded flag of this view as true
                view.setState(UIViewState.PREPARE)
            }
        }
    }

    /**
     * Load the size of the screenView
     * @param {UIView} screen View with screen value (body)
     * @return {boolean} flag to know if screen changed
     **/
    public static loadSizeScreen(screen: UIView): boolean {
        // flag looking for changes
        let sizeChanged = false

        // get the element
        const ele = screen.element
        ele.style.position = "absolute"

        // show view if it is not visible
        if (ele.style.display == "none") {
            ele.style.display = "inline-block"
        }

        // apply width and height if they are defined
        if (screen.attrs[AXIS.X].size != UI_SIZE.SIZE_CONTENT) {
            if (screen.attrs[AXIS.X].size == UI_SIZE.SCREEN) {
                ele.style.width = screen.attrs[AXIS.X].sizeValue + "px"
            } else if (screen.attrs[AXIS.X].size == UI_SIZE.PERCENTAGE) {
                ele.style.width = screen.attrs[AXIS.X].sizeValue + "%"
            }

            const offsetWidth = ele.offsetWidth
            if (offsetWidth != screen.positions[AXIS.X].size) {
                screen.positions[AXIS.X].size = offsetWidth
                sizeChanged = true
            }
        }
        if (screen.attrs[AXIS.Y].size != UI_SIZE.SIZE_CONTENT) {
            if (screen.attrs[AXIS.Y].size == UI_SIZE.SCREEN) {
                ele.style.height = screen.attrs[AXIS.Y].sizeValue + "px"
            } else if (screen.attrs[AXIS.Y].size == UI_SIZE.PERCENTAGE) {
                ele.style.height = screen.attrs[AXIS.Y].sizeValue + "%"
            }

            screen.positions[AXIS.Y].size = ele.offsetHeight
        }
        ele.style.position = "relative"

        screen.positions[AXIS.X].end = screen.positions[AXIS.X].size
        screen.positions[AXIS.Y].end = screen.positions[AXIS.Y].size

        screen.positions[AXIS.X].endChanged = true
        screen.positions[AXIS.X].startChanged = true
        screen.positions[AXIS.Y].endChanged = true
        screen.positions[AXIS.Y].startChanged = true

        //return the flag
        return sizeChanged
    }
}