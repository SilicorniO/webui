import UIPreparer from "./core/prepare/UIPreparer"
import CallbackTimer from "./utils/callbacktimer/CallbackTimer"
import UIConfiguration from "./UIConfiguration"
import Log from "./utils/log/Log"
import UIView from "./model/UIView"
import UIConfigurationData from "./model/UIConfigurationData"
import HtmlUtils from "./utils/html/HTMLUtils"
import CounterUtils from "./utils/counter/CounterUtils"
import UICalculator from "./core/calculate/UICalculator"
import UIPrepareOrderUtils from "./core/prepare/UIPrepareOrderUtils"
import UIDrawController from "./core/draw/UIDrawController"

export type WebUIRedraw = (screen: UIView) => void

export interface WebUIListener {
    onScreenReinit: (screen: UIView) => void
    onScreenRedraw: (screen: UIView) => void
}

/**
 * @constructor
 */
class WebUI implements WebUIListener {
    //size of scrollbars to use as padding when views have scrollbars visible
    private scrollSize: number = 0

    //configuration
    private configuration: UIConfiguration = new UIConfiguration()

    //timer for repainting
    private redrawTimer: CallbackTimer = new CallbackTimer()

    private screensToDraw: { [key: string]: UIView } = {}

    onScreenReinit(screen: UIView) {
        // init screen
        this.initDom(screen.element)
    }

    onScreenRedraw(screen: UIView) {
        // disable events from screen
        screen.disableEvents()

        // if no time to redraw we draw at the moment
        if (this.configuration.timeRedraw === 0) {
            // draw this screen
            this.drawUIScreen(screen)
            return
        }

        // add to the list of screens to draw
        this.screensToDraw[screen.id] = screen

        // call to redraw
        this.redraw()
    }

    //redraw function
    private redraw() {
        // get a copy of the screens to draw
        const screens: UIView[] = []
        for (const id of Object.keys(this.screensToDraw)) {
            screens.push(this.screensToDraw[id])
        }
        this.screensToDraw = {}

        this.redrawTimer.timer(() => {
            //draw
            Log.log(" -- Redraw -- ")
            for (const screen of screens) {
                // draw this screen
                this.drawUIScreen(screen)
            }
        }, this.configuration.timeRedraw)
    }

    /**
     * Start running the webUI listening for dom changes and initial start
     * @param {UIConfiguration} configuration
     */
    public start(configuration: UIConfigurationData) {
        CounterUtils.startCounter("drawScreens")

        //get the body element
        var bodyElement = document.getElementsByTagName("BODY")[0] as HTMLElement

        //calculate the size of scrollbars
        if (this.scrollSize == 0) {
            this.scrollSize = HtmlUtils.getScrollWidth()
        }

        //save configuration
        this.configuration = new UIConfiguration(configuration)

        //apply global values for logs
        Log.uiShowLogs = this.configuration.showLogs
        Log.uiViewLogs = this.configuration.logsView

        // launch from body, only first time
        this.initDom(bodyElement)

        Log.log("Time drawing screens: " + CounterUtils.endCounter("drawScreens"))
    }

    private initDom(element: HTMLElement) {
        // clear to avoid problems if it was called previously
        WebUI.clearUI(element)

        // generate views
        UIPreparer.generateUIViews(element, this.configuration, this)
    }

    private static clearUI(element: Node) {
        //delete the UI element and childrens
        delete (element as any).ui

        // delete the UI from children
        element.childNodes.forEach(childNode => {
            WebUI.clearUI(childNode)
        })
    }

    private drawUIScreen(screen: UIView) {
        //timers variables
        var timerLoadSizes = 0
        var timerOrderViews = 0
        var timerPrepare = 0
        var timerCore = 0
        var timerDraw = 0
        var timerAll = 0

        Log.log(`Drawing screen '${screen.id}'`)

        //start genral counter
        CounterUtils.startCounter("all")

        //---- PREPARE -----
        CounterUtils.startCounter("prepare")
        CounterUtils.startCounter("loadSizes")

        //call to listener with start event
        this.configuration.sendStartEvent()

        if (screen.hasToBeCalculated()) {
            //update the size of the screen
            var screenSizeChanged = UIPreparer.loadSizeScreen(screen)

            //load sizes of views
            UIPreparer.loadSizes(screen.getChildElements(), this.configuration, screenSizeChanged)
            timerLoadSizes = CounterUtils.endCounter("loadSizes")

            //order views
            CounterUtils.startCounter("orderViews")
            UIPrepareOrderUtils.orderViews(screen)
            timerOrderViews = CounterUtils.endCounter("orderViews")

            timerPrepare = CounterUtils.endCounter("prepare")

            //---- CORE -----
            CounterUtils.startCounter("core")

            //assign position and sizes to screen
            UICalculator.calculateScreen(screen, this.scrollSize)

            timerCore = CounterUtils.endCounter("core")
        }

        //---- DRAW -----
        CounterUtils.startCounter("draw")

        // prepare to draw, generate draw objects
        UIDrawController.generateDrawsOfScreen(screen, this.configuration)

        // apply draw objects
        UIDrawController.applyDrawsToScreen(screen, this.configuration)

        // apply events
        screen.evalEvents()

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
