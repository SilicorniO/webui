import UIView from "../../model/UIView"
import Log from "../log/Log"
import { AXIS } from "../../model/UIAxis"

/**
 * @constructor
 */
export default class DomSizeUtils {
    /**
     * Update the width of the view received
     * @param view UIView to change the height
     * @param ele DOM element to calculate the width
     * @return width calculated
     **/
    public static calculateWidthView(ele: HTMLElement, height?: number): number {
        //get the height width much space
        ele.style.position = "fixed"

        // ele.style.display = 'inline-block';
        if (height) {
            ele.style.height = height + "px"
        }
        ele.style.width = "auto"
        // ele.style.height = 'auto';
        const rect = ele.getBoundingClientRect()

        return Math.ceil(rect.width)
    }

    /**
     * Update the height of the view received
     * @param view UIView to change the height
     * @param ele DOM element to calculate the height
     * @return height calculated
     **/
    public static calculateHeightView(ele: HTMLElement, width?: number): number {
        //get the width height much space
        ele.style.position = "fixed"

        if (width) {
            ele.style.width = width + "px"
        }
        ele.style.height = "auto"
        const rect = ele.getBoundingClientRect()

        return Math.ceil(rect.height)
    }

    // generate list of indexes
    public static generateIndexes(elements: UIView[]): { [key: string]: number } {
        var indexes: { [key: string]: number } = {}

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].id) {
                indexes[elements[i].id] = i
            }
        }

        return indexes
    }

    /**
     * Generate an array of views from one parent view
     * @param {UIView} view View to read, recursive by children
     * @param {Array<UIView>=} aViews Array of views used to add view
     * @return {Array<UIView>} array of views
     **/
    public static generateArrayViews(view: UIView, aViews?: UIView[]): UIView[] {
        if (aViews == null) {
            aViews = new Array()
        }

        //add the view
        aViews.push(view)

        //add the children
        for (const child of view.getUIChildren()) {
            this.generateArrayViews(child, aViews)
        }

        return aViews
    }
}
