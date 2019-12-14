import UIView, { UIViewState } from "../../model/UIView"
import DomSizeUtils from "../../utils/domsize/DomSizeUtils"
import UIConfiguration from "../../UIConfiguration"
import UIHTMLElement from "../../model/UIHTMLElement"
import { AXIS, AXIS_LIST } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"

export default class UIPreparer {
    public static prepareScreen(screen: UIView, configuration: UIConfiguration) {
        // check this screen needs to be prepared
        if (screen.getState() >= UIViewState.PREPARED) {
            return
        }

        //update the size of the screen
        const screenSizeChanged = UIPreparer.loadSizeScreen(screen)

        //load sizes of views
        UIPreparer.loadSizes(screen.getChildElements(), configuration, screenSizeChanged)

        // update state of the screen
        screen.setState(UIViewState.PREPARED)
    }

    /**
     * Load the sizes of all views and translate paddings and margins to dimens
     * @param {Array<*>} elements Array of dom nodes to load size
     * @param {UIConfiguration} coreConfig
     * @param {boolean} forceSizeLoaded
     **/
    public static loadSizes(elements: UIHTMLElement[], coreConfig: UIConfiguration, forceSizeLoaded: boolean = false) {
        for (let i = 0; i < elements.length; i++) {
            const ele = elements[i]
            const view = ele.ui
            if (view && !view.isGone()) {
                // show view if it is not visible
                if (ele.style.display == "none") {
                    ele.style.display = "inline-block"
                }

                if (!view.isGone() && (forceSizeLoaded || view.getState() < UIViewState.PREPARED)) {
                    if (view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.X].sizeValue = DomSizeUtils.calculateWidthView(view, ele)
                    }

                    if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.Y].sizeValue = DomSizeUtils.calculateHeightView(view, ele)
                    }

                    //translate paddings and margins
                    this.applyDimensToView(view, coreConfig)

                    //mark the sizeLoaded flag of this view as true
                    view.setState(UIViewState.PREPARED)
                }

                this.loadSizes(
                    view.getChildElements(),
                    coreConfig,
                    forceSizeLoaded || view.getState() < UIViewState.PREPARED,
                )
            }
        }
    }

    private static applyDimensToView(view: UIView, configuration: UIConfiguration) {
        for (const axis of AXIS_LIST) {
            view.positions[axis].paddingStart = configuration.getDimen(view.attrs[axis].paddingStart)
            view.positions[axis].paddingEnd = configuration.getDimen(view.attrs[axis].paddingEnd)
            view.positions[axis].marginStart = configuration.getDimen(view.attrs[axis].marginStart)
            view.positions[axis].marginEnd = configuration.getDimen(view.attrs[axis].marginEnd)
        }
    }

    /**
     * Load the size of the screenView
     * @param {UIView} screen View with screen value (body)
     * @return {boolean} flag to know if screen changed
     **/
    public static loadSizeScreen(screen: UIView): boolean {
        //flag looking for changes
        let sizeChanged = false

        //get the element
        const ele = screen.element
        ele.style.position = "absolute"

        //show view if it is not visible
        if (ele.style.display == "none") {
            ele.style.display = "inline-block"
        }

        //apply width and height if they are defined
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
