import UIPrepare from "./UIPrepare"
import UIViewDrawUtils from "./utils/uiviewdraw/UIViewDrawUtils"
import RedrawTimer from "./utils/redrawtimer/RedrawTimer"
import UIConfiguration from "./UIConfiguration"
import UICore from "./UICore"
import Log from "./utils/log/Log"
import UIView from "./model/UIView"
import UIHTMLElement from "./model/UIHTMLElement"
import UIConfigurationData from "./model/UIConfigurationData"
import HtmlUtils from "./utils/html/HTMLUtils"
import CounterUtils from "./utils/counter/CounterUtils"

/**
 * @constructor
 */
class WebUI {
    //size of scrollbars to use as padding when views have scrollbars visible
    private scrollWidth: number = 0
    private scrollHeight: number = 0

    //list of screens
    private screens: UIView[] = []

    //ids of nodes changed
    private nodesAdded: HTMLElement[] = []
    private nodesUpdated: UIHTMLElement[] = []
    private parentNodesRemoved: UIHTMLElement[] = []

    //controllers
    private uiPrepare: UIPrepare = new UIPrepare(this.refresh.bind(this))
    private uiCore: UICore | null = null

    //configuration
    private configuration: UIConfiguration = new UIConfiguration()

    //timer for repainting
    private redrawTimer: RedrawTimer = new RedrawTimer()

    //redraw function
    private redraw() {
        //prepare nodes
        var countNodesAdded = this.uiPrepare.addNodes(this.nodesAdded, this.screens, this.configuration)
        var countNodesRemoved = this.uiPrepare.removeNodes(this.parentNodesRemoved)
        var countNodesModified = this.uiPrepare.updateNodes(this.nodesUpdated, this.screens, this.configuration)
        Log.log(
            "Nodes added: " +
                countNodesAdded +
                " - Nodes removed: " +
                countNodesRemoved +
                " - Nodes modified: " +
                countNodesModified,
        )

        this.redrawTimer.timer(() => {
            //draw
            Log.log(" -- Redraw -- ")
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
            this.scrollWidth = HtmlUtils.getScrollWidth()
        }

        //save configuration
        this.configuration = new UIConfiguration(configuration)

        //apply global values for logs
        Log.uiShowLogs = this.configuration.showLogs
        Log.uiViewLogs = this.configuration.logsView

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
                        const nodeUi = mutation.addedNodes[i]
                        if (nodeUi != null && nodeUi instanceof HTMLElement) {
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
        CounterUtils.startCounter("drawScreens")

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

        Log.log("Time drawing screens: " + CounterUtils.endCounter("drawScreens"))
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
        CounterUtils.startCounter("all")

        //---- PREPARE -----
        CounterUtils.startCounter("prepare")
        CounterUtils.startCounter("loadSizes")

        //call to listener with start event
        this.configuration.sendStartEvent()

        if (screen.hasToBeCalculated()) {
            //update the size of the screen
            var screenSizeChanged = this.uiPrepare.loadSizeScreen(screen)

            //load sizes of views
            this.uiPrepare.loadSizes(screen.getChildElements(), this.configuration, screenSizeChanged)
            timerLoadSizes = CounterUtils.endCounter("loadSizes")

            //order views
            CounterUtils.startCounter("orderViews")
            this.uiPrepare.orderViews(screen)
            timerOrderViews = CounterUtils.endCounter("orderViews")

            timerPrepare = CounterUtils.endCounter("prepare")

            //---- CORE -----
            CounterUtils.startCounter("core")

            //assign position and sizes to screen
            this.uiCore.calculateScreen(screen)

            timerCore = CounterUtils.endCounter("core")
        }

        //---- DRAW -----
        CounterUtils.startCounter("draw")

        //apply position and sizes
        var childrenSizes = UIViewDrawUtils.applyPositions(screen, this.configuration.viewColors)
        UIViewDrawUtils.applyVisibility(screen, null, this.configuration, !screen.hasToBeCalculated())

        //resize screen if necessary
        UIViewDrawUtils.applySizeScreen(screen, childrenSizes.maxX, childrenSizes.maxY)

        timerDraw = CounterUtils.endCounter("draw")

        //call to listener with end event
        this.configuration.sendEndEvent()

        //end counter
        timerAll = CounterUtils.endCounter("all")

        Log.log(
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

export default new WebUI()
