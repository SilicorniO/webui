import UIView from "../../model/UIView"
import UIViewUtils from "../../utils/uiview/UIViewUtils"
import UIConfiguration from "../../UIConfiguration"
import UIHTMLElement from "../../model/UIHTMLElement"
import { AXIS } from "../../model/UIAxis"
import { UI_SIZE } from "../../model/UIAttr"
import { WebUIListener } from "../../WebUI"

export default class UIPrepare {
    /**
     * Load the sizes of all views and translate paddings and margins to dimens
     * @param {Array<*>} elements Array of dom nodes to load size
     * @param {UIConfiguration} coreConfig
     * @param {boolean} forceSizeLoaded
     **/
    public static loadSizes(elements: UIHTMLElement[], coreConfig: UIConfiguration, forceSizeLoaded: boolean = false) {
        for (var i = 0; i < elements.length; i++) {
            var ele = elements[i]
            var view = ele.ui
            if (view && view.hasToBeCalculated()) {
                // show view if it is not visible
                if (ele.style.display == "none") {
                    ele.style.display = "inline-block"
                }

                if (view.hasToBeCalculated() && (forceSizeLoaded || !view.sizeLoaded)) {
                    if (view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.X].sizeValue = UIViewUtils.calculateWidthView(view, ele)
                    }

                    if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.attrs[AXIS.Y].sizeValue = UIViewUtils.calculateHeightView(view, ele)
                    }

                    //translate paddings and margins
                    view.applyDimens(coreConfig)

                    //mark the sizeLoaded flag of this view as true
                    view.sizeLoaded = true
                }

                this.loadSizes(view.getChildElements(), coreConfig, forceSizeLoaded || !view.sizeLoaded)
            }
        }
    }

    /**
     * Load the size of the screenView
     * @param {UIView} screen View with screen value (body)
     * @return {boolean} flag to know if screen changed
     **/
    public static loadSizeScreen(screen: UIView): boolean {
        //flag looking for changes
        var sizeChanged = false

        //get the element
        var ele = screen.element
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

            var offsetWidth = ele.offsetWidth
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

        //mark size as loaded
        screen.sizeLoaded = true

        //return the flag
        return sizeChanged
    }

    public static generateUIViews(
        element: HTMLElement,
        config: UIConfiguration,
        webUIListener: WebUIListener,
        parent?: UIView,
        screen?: UIView,
    ) {
        // parent and screen to send
        let parentChildren: UIView | undefined = undefined
        let screenChildren: UIView | undefined = undefined

        // check if it has UI attribute
        if (element.hasAttribute(config.attribute)) {
            // generate UIView to this element
            parentChildren = new UIView(element, config, webUIListener, parent, screen)

            // save screen
            if (screen != null) {
                screenChildren = screen
            } else {
                screenChildren = parentChildren
            }
        }

        // generate views of all children
        element.childNodes.forEach(child => {
            if (child instanceof HTMLElement) {
                UIPrepare.generateUIViews(child, config, webUIListener, parentChildren, screenChildren)
            }
        })

        // if it is an screen, all its children have been prepared so it is ready
        if (parentChildren != null && parentChildren.screen == null) {
            //set the position as relative because the children will be absolute
            element.style.position = "relative"

            // call to draw this screen
            webUIListener.onScreenRedraw(screenChildren)
        }
    }
}
