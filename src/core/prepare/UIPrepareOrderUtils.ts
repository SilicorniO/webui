import UIView from "../../model/UIView"
import { AXIS } from "../../model/UIAxis"
import { UI_REF_LIST, UI_VIEW_ID } from "../../model/UIAttr"
import UIViewUtils from "../../utils/uiview/UIViewUtils"
import UIHTMLElement from "../../model/UIHTMLElement"
import Log from "../../utils/log/Log"

export default class UIPrepareOrderUtils {
    /**
     * Order the children of the parent view received
     * @param {UIView} parent View to order the childrens
     **/
    public static orderViews(parent: UIView) {
        if (!parent.childrenInOrder) {
            //clean dependencies of all views
            for (const child of parent.getUIChildren()) {
                child.dependencies[AXIS.X] = []
                child.dependencies[AXIS.Y] = []
            }

            //then order all the views with parent screen
            parent.childrenOrder[AXIS.X] = this.orderViewsSameParent(parent, true)
            parent.childrenOrder[AXIS.Y] = this.orderViewsSameParent(parent, false)

            //mark as parent with order
            parent.childrenInOrder = true
        }

        //for each one, add the view and then its ordered children
        for (const child of parent.getUIChildren()) {
            if (child.getChildElements().length > 0) {
                this.orderViews(child)
            }
        }
    }

    /**
     * Order the views received with the dependencies of each view
     * @private
     * @param {UIView} parent Parent view
     * @param {boolean} hor TRUE for horizontal dependencies, FALSE for vertical dependecies
     * @return Array of views from params, in order
     **/
    private static orderViewsSameParent(parent: UIView, hor: boolean) {
        //prepare array to save the list of views
        const views: UIView[] = []

        //prepare references in views
        let views0dependencies = 0
        let lastChild: UIView | null = null
        for (const child of parent.getUIChildren()) {
            var numDependencies = 0

            var attrsAxis = hor ? child.getAttrs(AXIS.X) : child.getAttrs(AXIS.Y)
            for (const key of UI_REF_LIST) {
                let reference = attrsAxis.getRef(key)

                //update p and l references
                if (reference == UI_VIEW_ID.PARENT) {
                    reference = parent.id
                } else if (reference == UI_VIEW_ID.LAST) {
                    if (lastChild) {
                        reference = lastChild.id
                    } else {
                        reference = UI_VIEW_ID.NONE
                    }
                }

                if (reference.length > 0) {
                    if (hor) {
                        child.dependencies[AXIS.X].push(reference)
                    } else {
                        child.dependencies[AXIS.Y].push(reference)
                    }
                    numDependencies++
                }
            }
            if (numDependencies == 0) {
                child.orderNum = 0
                views0dependencies++
            } else {
                child.orderNum = -1
            }

            //add this child, only ui children
            views.push(child)

            //save last child for references
            lastChild = child
        }

        //get the elements of the parent for performance
        const childElements = parent.getChildElements()

        //array of references of views to search them faster
        var indexes = UIViewUtils.generateIndexes(UIHTMLElement.convertToUIView(childElements))

        //search dependencies until we have all children with them
        let allViewsSet: boolean = true
        let numViewsSet: number = 0
        do {
            //initialize values
            allViewsSet = true
            numViewsSet = 0

            //for each view check dependencies
            for (const child of parent.getUIChildren()) {
                if (child.orderNum == -1) {
                    var dependencies = hor ? child.dependencies[AXIS.X] : child.dependencies[AXIS.Y]
                    var sumDependencies = 0
                    for (var n = 0; n < dependencies.length; n++) {
                        var orderNum = 0
                        if (indexes[dependencies[n]] != null) {
                            orderNum = childElements[indexes[dependencies[n]]].ui.orderNum
                        }

                        if (orderNum > -1) {
                            sumDependencies += orderNum + 1
                        } else {
                            sumDependencies = 0
                            break
                        }
                    }

                    //set value
                    if (sumDependencies > 0) {
                        child.orderNum = sumDependencies
                        numViewsSet++
                    } else {
                        allViewsSet = false
                    }
                }
            }
        } while (!allViewsSet && numViewsSet > 0)

        if (numViewsSet == 0 && parent.hasUIChildren() && views0dependencies < childElements.length) {
            Log.logE("Check cycle references in " + (hor ? "horizontal" : "vertical") + " for parent " + parent.id)
        }

        //sort views after setting order num
        views.sort(function(a, b) {
            return a.orderNum - b.orderNum
        })

        return views
    }
}
