import UIPrepare from "./UIPrepare"
import UIDraw from "./UIDraw"
import UIRedrawTimer from "./utils/UIRedrawTimer"
import UIConfiguration, { UIConfigurationData } from "./UIConfiguration"
import UICore from "./UICore"
import UILog from "./general/UILog"
import UIView from "./UIView"
import UIHTMLElement from "./UIHTMLElement"
import UIGeneralFuncs from "./general/UIGeneralFuncs"

/**
 * @constructor
 */
export default class WebUI {
    /** Configuration saved **/
    private uiConfiguration: UIConfiguration = new UIConfiguration()

    //size of scrollbars to use as padding when views have scrollbars visible
    private scrollWidth: number = 0
    private scrollHeight: number = 0

    //list of screens
    private screens: UIView[] = []

    //ids of nodes changed
    private nodesAdded: UIHTMLElement[] = []
    private nodesUpdated: UIHTMLElement[] = []
    private parentNodesRemoved: UIHTMLElement[] = []

    //controllers
    private uiPrepare: UIPrepare = new UIPrepare(this.refresh.bind(this))
    private uiDraw: UIDraw = new UIDraw()
    private uiCore: UICore | null = null

    //configuration
    private configuration: UIConfiguration = new UIConfiguration()

    //timer for repainting
    private redrawTimer: UIRedrawTimer = new UIRedrawTimer()

    //redraw function
    private redraw() {
        //prepare nodes
        var countNodesAdded = this.uiPrepare.addNodes(this.nodesAdded, this.screens, this.configuration)
        var countNodesRemoved = this.uiPrepare.removeNodes(this.parentNodesRemoved)
        var countNodesModified = this.uiPrepare.updateNodes(this.nodesUpdated, this.screens, this.configuration)
        UILog.log("Nodes added: " + countNodesAdded + " - Nodes removed: " + countNodesRemoved + " - Nodes modified: " + countNodesModified)

        this.redrawTimer.timer(() => {
            //draw
            UILog.log(" -- Redraw -- ")
            this.drawScreens()
        }, this.configuration.timeRedraw)
    }

    //window resize event
    private resize() {
        this.configuration.refreshScreenSize()
        this.redraw()
    }

    /**
     * Start running the webUI listening for dom changes and initial start
     * @param {UIConfiguration} configuration
     */
    public start(configuration: UIConfigurationData) {
        //clear to avoid problems if it was called previously
        this.clearUI()

        //calculate the size of scrollbars
        if (this.scrollWidth == 0) {
            this.scrollWidth = UIGeneralFuncs.getScrollWidth()
        }

        //save configuration
        this.configuration = new UIConfiguration(configuration)

        //apply global values for logs
        UILog.uiShowLogs = this.configuration.showLogs
        UILog.uiViewLogs = this.configuration.logsView

        //prepare core with the configuration
        this.uiCore = new UICore(this.scrollWidth)

        //start running on actual dom
        this.drawScreens()

        //listen dom events
        this.listenDomEvents()
    }

    private listenDomEvents() {
        //get the body element
        var bodyElement = document.getElementsByTagName("BODY")[0]

        //add event listener for window resize
        window.removeEventListener("resize", this.resize)
        window.addEventListener("resize", this.resize)

        // Options for the observer (which mutations to observe)
        var config = { characterData: true, attributes: true, childList: true, subtree: true }

        // Callback function to execute when mutations are observed
        var callback = (mutationsList: MutationRecord[]) => {
            for (var mutation of mutationsList) {
                if (mutation.type == "childList") {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        const nodeUi = UIHTMLElement.get(mutation.addedNodes[i])
                        if (nodeUi != null) {
                            this.nodesAdded.push(nodeUi)
                        }
                    }
                    for (var i = 0; i < mutation.removedNodes.length; i++) {
                        const nodeUi = UIHTMLElement.get(UIHTMLElement.get(mutation.target))
                        if (nodeUi != null) {
                            this.parentNodesRemoved.push(nodeUi)
                        }
                    }
                    this.redraw()
                } else if (mutation.type == "attributes") {
                    var attributeName = mutation.attributeName
                    if (
                        attributeName == "id" ||
                        attributeName == "class" ||
                        attributeName == this.configuration.attribute ||
                        this.configuration.attributes.includes(attributeName)
                    ) {
                        this.nodesUpdated.push(UIHTMLElement.get(mutation.target))
                        this.redraw()
                    }
                } else if (mutation.type == "characterData") {
                    if (mutation.target.parentNode) {
                        const nodeUi = UIHTMLElement.get(mutation.target.parentNode)
                        if (nodeUi != null) {
                            this.nodesUpdated.push(nodeUi)
                        }
                    }
                    this.redraw()
                }
            }
        }

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback)

        // Start observing the target node for configured mutations
        observer.observe(bodyElement, config)
    }

    private clearUI() {
        //delete the UI element and childrens
        var clearUI = (element: HTMLElement) => {
            const uiElement = UIHTMLElement.get(element)
            if (uiElement != null) {
                delete (element as any).ui
                var viewChildNodes = element.childNodes
                if (viewChildNodes) {
                    for (var i = 0; i < viewChildNodes.length; i++) {
                        clearUI(viewChildNodes[i] as HTMLElement)
                    }
                }
            }
        }

        //for each screen delete the UI element and its children
        if (this.screens) {
            this.screens.forEach(function(screen) {
                clearUI(screen.element)
            })

            //delete all screens
            this.screens = []
        }
    }

    /**
     * Refresh the UI framework with the identifier saved if there was one
     **/
    private refresh() {
        this.redraw()
    }

    /**
     * Execute UI
     **/
    private drawScreens() {
        //start genral counter
        UIGeneralFuncs.startCounter("drawScreens")

        //prepare all dom from body for the first time
        if (this.screens.length == 0) {
            var bodyElement = document.getElementsByTagName("BODY")[0]
            this.uiPrepare.generateUIViews(bodyElement as HTMLElement, this.configuration, this.screens, null)
        }

        //draw all screens
        for (var i = 0; i < this.screens.length; i++) {
            //finish rest of calculations
            this.drawUIScreen(this.screens[i])
        }

        UILog.log("Time drawing screens: " + UIGeneralFuncs.endCounter("drawScreens"))
    }

    private drawUIScreen(screen: UIView) {
        //timers variables
        var timerLoadSizes = 0
        var timerOrderViews = 0
        var timerPrepare = 0
        var timerCore = 0
        var timerDraw = 0
        var timerAll = 0

        //start genral counter
        UIGeneralFuncs.startCounter("all")

        //---- PREPARE -----
        UIGeneralFuncs.startCounter("prepare")
        UIGeneralFuncs.startCounter("loadSizes")

        //call to listener with start event
        this.configuration.sendStartEvent()

        if (screen.hasToBeCalculated()) {
            //update the size of the screen
            var screenSizeChanged = this.uiPrepare.loadSizeScreen(screen)

            //load sizes of views
            this.uiPrepare.loadSizes(screen.getChildElements(), this.configuration, screenSizeChanged)
            timerLoadSizes = UIGeneralFuncs.endCounter("loadSizes")

            //order views
            UIGeneralFuncs.startCounter("orderViews")
            this.uiPrepare.orderViews(screen)
            timerOrderViews = UIGeneralFuncs.endCounter("orderViews")

            timerPrepare = UIGeneralFuncs.endCounter("prepare")

            //---- CORE -----
            UIGeneralFuncs.startCounter("core")

            //assign position and sizes to screen
            this.uiCore.calculateScreen(screen)

            timerCore = UIGeneralFuncs.endCounter("core")
        }

        //---- DRAW -----
        UIGeneralFuncs.startCounter("draw")

        //apply position and sizes
        var childrenSizes = this.uiDraw.applyPositions(screen, this.configuration.viewColors)
        this.uiDraw.applyVisibility(screen, null, this.configuration, !screen.hasToBeCalculated())

        //resize screen if necessary
        this.uiDraw.applySizeScreen(screen, childrenSizes.maxX, childrenSizes.maxY)

        timerDraw = UIGeneralFuncs.endCounter("draw")

        //call to listener with end event
        this.configuration.sendEndEvent()

        //end counter
        timerAll = UIGeneralFuncs.endCounter("all")

        UILog.log(
            "[" +
                screen.id +
                "] All: " +
                timerAll +
                "ms - Prepare: " +
                timerPrepare +
                "ms - Core: " +
                timerCore +
                "ms - Draw: " +
                timerDraw +
                "ms - LoadSizes: " +
                timerLoadSizes +
                "ms - OrderViews: " +
                timerOrderViews +
                "ms",
        )
    }
}
