import UIView from "./model/UIView"
import Log from "./utils/log/Log"
import UIViewUtils from "./utils/uiview/UIViewUtils"
import UIUtils from "./utils/ui/UIUtils"
import UIConfiguration from "./UIConfiguration"
import UIHTMLElement from "./model/UIHTMLElement"
import { AXIS } from "./model/UIAxis"
import { UI_REF_LIST, UI_VIEW_ID, UI_SIZE } from "./model/UIAttr"

export default class UIPrepare {
    //save the refresh function
    private refreshFunc: () => void

    // Value to incremenet and create auto ids
    private generatedId: number = 0

    // Flag to know if image events have been added
    private imgEventsAdded: boolean = false

    /**
     * @constructor
     */
    constructor(refreshFunc: () => void) {
        //save the refresh function
        this.refreshFunc = refreshFunc
    }

    /**
     * Order the children of the parent view received
     * @param {UIView} parent View to order the childrens
     **/
    public orderViews(parent: UIView) {
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
    private orderViewsSameParent(parent: UIView, hor: boolean) {
        //prepare array to save the list of views
        const views: UIView[] = []

        //prepare references in views
        let views0dependencies = 0
        let lastChild: UIView | null = null
        for (const child of parent.getUIChildren()) {
            var numDependencies = 0

            var referencesAxis = hor ? child.getAttrs(AXIS.X) : child.getAttrs(AXIS.Y)
            for (const key of UI_REF_LIST) {
                let reference = referencesAxis[key]

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

    /**
     * Load the sizes of all views and translate paddings and margins to dimens
     * @param {Array<*>} elements Array of dom nodes to load size
     * @param {UIConfiguration} coreConfig
     * @param {boolean} forceSizeLoaded
     **/
    public loadSizes(elements: UIHTMLElement[], coreConfig: UIConfiguration, forceSizeLoaded: boolean = false) {
        for (var i = 0; i < elements.length; i++) {
            var ele = elements[i]
            var view = ele.ui
            if (view && view.hasToBeCalculated()) {
                //show view if it is not visible
                if (ele.style.display == "none") {
                    ele.style.display = "inline-block"
                }

                if (view.hasToBeCalculated() && (forceSizeLoaded || !view.sizeLoaded)) {
                    if (view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.positions[AXIS.X].sizeValue = UIViewUtils.calculateWidthView(view, ele)
                    }

                    if (view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT && !view.hasUIChildren()) {
                        view.positions[AXIS.Y].sizeValue = UIViewUtils.calculateHeightView(view, ele)
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
    public loadSizeScreen(screen: UIView): boolean {
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
                ele.style.width = screen.positions[AXIS.X].sizeValue + "px"
            } else if (screen.attrs[AXIS.X].size == UI_SIZE.PERCENTAGE) {
                ele.style.width = screen.positions[AXIS.X].sizeValue + "%"
            }

            var offsetWidth = ele.offsetWidth
            if (offsetWidth != screen.positions[AXIS.X].size) {
                screen.positions[AXIS.X].size = offsetWidth
                sizeChanged = true
            }
        }
        if (screen.attrs[AXIS.Y].size != UI_SIZE.SIZE_CONTENT) {
            if (screen.attrs[AXIS.Y].size == UI_SIZE.SCREEN) {
                ele.style.height = screen.positions[AXIS.Y].sizeValue + "px"
            } else if (screen.attrs[AXIS.Y].size == UI_SIZE.PERCENTAGE) {
                ele.style.height = screen.positions[AXIS.Y].sizeValue + "%"
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

    /**
     * Generate a UIView
     * @param {*} element
     * @param {UIView} parent
     * @param {UIView} screen
     * @param {UIConfiguration} config
     * @return {UIView} generated view
     */
    private generateUIView(element: HTMLElement, parent: UIView, screen: UIView, config: UIConfiguration): UIView {
        //check if has already ui
        const elementUi = UIHTMLElement.get(element)
        if (elementUi != null) {
            return elementUi.ui
        }

        //generate an ui if necessary
        if (element.tagName != null && element.getAttribute(config.attribute) != null) {
            //assign an id if necessary
            if (element.id.length == 0) {
                element.id = "_aID_" + this.generatedId
                this.generatedId++
            }

            //create the view and add it to the list of views
            var view = new UIView(element, parent, screen, config.attribute, config.attributes)
            if (view) {
                //initialize opacity to 0 to show it when it has the position
                element.style.opacity = "0"
            }

            //if it is an image we prepare to refresh when image is loaded
            if (element.tagName != null && element.tagName.toLowerCase() == "img") {
                element.onload = function() {
                    //mark this view for reload
                    view.sizeLoaded = false
                    this.refreshFunc()
                }.bind(this)
            }

            return view
        } else {
            return null
        }
    }

    /**
     * Generate all UIViews starting from the given element (node)
     * @param {*} element Node element to start to search
     * @param {UIConfiguration} config
     * @param {Array<UIView>} aScreens Array of screens where all screens generated are returned
     * @param {UIView} parentScreen of this view
     * @param {*=} parentElement
     * @return {UIView} generated view
     */
    public generateUIViews(
        element: HTMLElement,
        config: UIConfiguration,
        aScreens: UIView[],
        parentScreen: UIView,
        parentElement?: UIHTMLElement,
    ): UIView {
        //initialize array of screens if it is necessary
        if (!aScreens) {
            aScreens = []
        }

        //get the parent and the screen
        var parent: UIView | null = null
        var screen: UIView | null = null
        if (parentElement == null) {
            parentElement = UIHTMLElement.get(element.parentNode) || undefined
        }
        if (parentElement != null) {
            parent = parentElement.ui
            screen = parent.screen ? parent.screen : parent
        }

        //genetate view of this element
        var view = this.generateUIView(element, parent, screen, config)

        //add the view as a screen if there is not parent
        if (view && !parent) {
            //calculate the position where to add the screen
            var index = aScreens.length
            if (parentScreen) {
                index = aScreens.indexOf(parentScreen)
            }

            //add the screen in the selected position
            aScreens.splice(index, 0, view)
            parentScreen = view

            //set the position as relative because the children will be absolute
            element.style.position = "relative"
        }

        //call to all children
        var lastChildId = view ? view.id : "" //start with parent
        for (var i = 0; i < element.childNodes.length; i++) {
            var childElement = element.childNodes[i]

            if (childElement != null) {
                var childView = this.generateUIViews(
                    childElement as HTMLElement,
                    config,
                    aScreens,
                    parentScreen,
                    view != null ? view.element : undefined,
                )

                //update the identifier of the last child if it is a ui node
                if (childView) {
                    lastChildId = childView.id
                }
            }
        }

        //return the view
        return view
    }

    /**
     * Add the received nodes to the UI
     * @param {any} nodesAdded
     * @param {array<UIView>} screens
     * @param {UIConfiguration} configuration
     * @return {number} Count of added nodes
     */
    public addNodes(nodesAdded: HTMLElement[], screens: UIView[], configuration: UIConfiguration): number {
        //counter to know how many nodes were added
        var countNodesAdded = 0

        //when a node is added we have to check the relationship with the rest of views
        while (nodesAdded.length > 0) {
            countNodesAdded += 1

            //get first node and remove from list
            var node = nodesAdded[0]
            nodesAdded.splice(0, 1)

            //get the previous view and screen
            var previousUIView = UIUtils.getPreviousUIView(node)
            var previousUIScreen = UIUtils.getPreviousUIScreen(previousUIView)

            // var parentScreen = UIUtils.getPreviousUIScreen(node);

            //1. Search and add UI elements from this node. Adding newscreens to the list
            this.generateUIViews(node, configuration, screens, previousUIScreen)

            if (previousUIView) {
                previousUIView.childrenInOrder = false
                previousUIView.cleanSizeLoaded()
            }
            if (previousUIScreen) {
                previousUIScreen.cleanSizeLoaded()
            }

            // //get the parent if has one
            // var parentElement = node.parentNode;
            // if(parentElement && parentElement.ui){
            // 	var parentView = parentElement.ui;

            // 	//2. Order views in parent
            // 	parentView.childrenInOrder = false;

            // 	//3. Check if parent has size content, to mark it as modified
            // 	if(parentView.sizeWidth=='sc' || parentView.sizeHeight=='sc'){
            // 		parentView.cleanSizeLoaded();
            // 	}

            // }
        }

        return countNodesAdded
    }

    /**
     * Update the received nodes because some childre were removed
     * @param {any} parentNodesRemoved
     * @param {array<UIView>} screens
     * @param {UIConfiguration} configuration
     * @return {number} Count of modified nodes
     */
    public removeNodes(parentNodesRemoved: UIHTMLElement[]): number {
        //counter to know how many nodes were added
        var countNodesRemoved = 0

        //when a node is removed we have to check the relationship of the parent
        while (parentNodesRemoved.length > 0) {
            countNodesRemoved += 1

            //get first node and remove from list
            var parentNode = parentNodesRemoved[0]
            parentNodesRemoved.splice(0, 1)

            //search the parent view with UI interface
            var refreshParent = (node: UIHTMLElement) => {
                //check it has UI
                if (node && node.ui) {
                    var view = node.ui

                    //2. Order views in parent
                    view.childrenInOrder = false

                    //3. Check if parent has size content, to mark it as modified
                    if (
                        view.attrs[AXIS.X].size == UI_SIZE.SIZE_CONTENT ||
                        view.attrs[AXIS.Y].size == UI_SIZE.SIZE_CONTENT
                    ) {
                        view.cleanSizeLoaded()
                    }
                    return
                } else {
                    //search UI in parent
                    var parentNode = UIHTMLElement.get(node.parentNode)
                    if (parentNode) {
                        refreshParent(parentNode)
                    }
                }
            }
            refreshParent(parentNode)
        }

        return countNodesRemoved
    }

    /**
     * Update the received nodes because some childre were removed
     * @param {any} parentNodesRemoved
     * @param {array<UIView>} screens
     * @param {UIConfiguration} configuration
     * @return {number} Count of modified nodes
     */
    public updateNodes(nodesUpdated: UIHTMLElement[], screens: UIView[], configuration: UIConfiguration) {
        //counter to know how many nodes were added
        let countNodesModified = 0

        //when a node is removed we have to check the relationship of the parent
        const nodeIdsUpdated: string[] = []
        while (nodesUpdated.length > 0) {
            //get first node and remove from list
            const node = nodesUpdated[0]
            nodesUpdated.splice(0, 1)

            //check this id has not been already updated
            var view = node.ui
            if (!view || !nodeIdsUpdated.includes(view.id)) {
                countNodesModified += 1

                //try to generate the UI view
                if (!view) {
                    //get the previous screen
                    var parentScreen = UIUtils.getPreviousUIScreen(node.ui)

                    view = this.generateUIViews(node, configuration, screens, parentScreen)
                } else {
                    if (node.id != view.id) {
                        view.id = node.id
                    }
                    view.cleanUI()
                    view.readUI(view.element, configuration.attribute, configuration.attributes)
                    view.sizeLoaded = false
                    view.childrenInOrder = false
                }

                //update parent to re-calculate it
                if (view) {
                    //connect view with children
                    for (const child of view.getUIChildren()) {
                        //search if the view was in the list of screens to delete it
                        if (child.parent == null) {
                            var screenIndex = screens.indexOf(child)
                            if (screenIndex > -1) {
                                screens.splice(screenIndex, 1)
                            }
                        }

                        //assign the parent
                        child.parent = view
                    }

                    //save the id
                    nodeIdsUpdated.push(view.id)

                    //prepare parent for re-calculations
                    var parent = view.parent
                    if (parent) {
                        parent.childrenInOrder = false
                        parent.cleanSizeLoaded()
                    }
                }

                //mark parent screen for recalculations
                var previousUIView = UIUtils.getPreviousUIView(node)
                var previousUIScreen = UIUtils.getPreviousUIScreen(previousUIView)
                if (previousUIScreen) {
                    previousUIScreen.cleanSizeLoaded()
                }
            }
        }

        return countNodesModified
    }
}
