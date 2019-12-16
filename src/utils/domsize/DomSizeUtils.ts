import UIView from "../../model/UIView"

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
    public static calculateWidthView(view: UIView, ele: HTMLElement, height?: number): number {
        //prepare parent to give the son a lot of space for calculation
        // var parent = ele.parentElement;
        // var parentWidth = parent.offsetWidth;
        // var parentScrollLeft = parent.scrollLeft;
        // parent.style.width = 10000;

        //get the height width much space
        ele.style.position = "fixed"
        // ele.style.display = 'inline-block';
        if (height) {
            ele.style.height = height + "px"
        }
        ele.style.width = "auto"
        // ele.style.height = 'auto';
        var width = ele.offsetWidth

        //increment for text calculations error
        if (width > 0) {
            width += 1
        }

        //set values of parent back
        // parent.style.width = parentWidth;
        // parent.scrollLeft = parentScrollLeft;

        return width
    }

    /**
     * Update the height of the view received
     * @param view UIView to change the height
     * @param ele DOM element to calculate the height
     * @return height calculated
     **/
    public static calculateHeightView(view: UIView, ele: HTMLElement, width?: number): number {
        //prepare parent to give the son a lot of space for calculation
        // var parent = ele.parentElement;
        // var parentHeight = parent.offsetHeight;
        // var parentScrollTop = parent.scrollTop;
        // parent.style.height = 10000;

        //get the width height much space
        ele.style.position = "fixed"
        // ele.style.display = 'inline-block';
        // ele.style.width = 'auto';
        if (width) {
            ele.style.width = width + "px"
        }
        ele.style.height = "auto"
        var height = ele.offsetHeight

        //increment for text calculations error
        if (height > 0) {
            height += 1
        }

        //set values of parent back
        // parent.style.height = parentHeight;
        // parent.scrollTop = parentScrollTop;

        return height
    }

    /**
     * Update the width of the view received
     * @param view View to change the height
     * @param ele DOM element to calculate the width
     **/
    public static calculateWidthViewSlow(view: UIView, ele: HTMLElement): number {
        //prepare parent to give the son a lot of space for calculation
        var parent = ele.parentElement
        if (parent == null) {
            return 0
        }
        var parentWidth = "" + parent.offsetWidth
        var parentScrollLeft = parent.scrollLeft
        parent.style.width = "10000"

        //get the height width much space
        ele.style.display = "inline-block"
        ele.style.width = "auto"
        ele.style.height = "auto"
        var width = ele.offsetWidth

        //increment for text calculations error
        if (width > 0) {
            width += 1
        }

        //set values of parent back
        parent.style.width = parentWidth
        parent.scrollLeft = parentScrollLeft

        return width
    }

    /**
     * Update the height of the view received
     * @param view View to change the height
     * @param ele DOM element to calculate the height
     **/
    public static calculateHeightViewSlow(view: UIView, ele: HTMLElement): number {
        //prepare parent to give the son a lot of space for calculation
        var parent = ele.parentElement
        if (parent == null) {
            return 0
        }
        var parentHeight = "" + parent.offsetHeight
        var parentScrollTop = parent.scrollTop
        parent.style.height = "10000"

        //get the width height much space
        ele.style.display = "inline-block"
        ele.style.width = "auto"
        ele.style.height = "auto"
        var height = ele.offsetHeight

        //increment for text calculations error
        if (height > 0) {
            height += 1
        }

        //set values of parent back
        parent.style.height = parentHeight
        parent.scrollTop = parentScrollTop

        return height
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
