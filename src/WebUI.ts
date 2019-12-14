import UIPreparer from "./core/prepare/UIPreparer"
import CallbackTimer from "./utils/callbacktimer/CallbackTimer"
import UIConfiguration from "./UIConfiguration"
import Log from "./utils/log/Log"
import UIView from "./model/UIView"
import UIConfigurationData from "./model/UIConfigurationData"
import HtmlUtils from "./utils/html/HTMLUtils"
import CounterUtils from "./utils/counter/CounterUtils"
import UICalculator from "./core/calculate/UICalculator"
import UIDrawController from "./core/draw/UIDrawController"
import UIDomPreparer from "./core/dom/UIDomPreparer"
import UIOrganizer from "./core/organize/UIOrganizer"

export type WebUIRedraw = (screen: UIView) => void

export interface WebUIListener {
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
    private redrawTimer: CallbackTimer

    private screensToDraw: { [key: string]: UIView } = {}

    /**
     * Start running the webUI listening for dom changes and initial start
     * @param {UIConfiguration} configuration
     */
    public start(configuration: UIConfigurationData) {
        //save configuration
        this.configuration = new UIConfiguration(configuration)

        // initialize callbackTimer
        this.redrawTimer = new CallbackTimer(this.redraw.bind(this), this.configuration.timeRedraw)

        //apply global values for logs
        Log.uiShowLogs = this.configuration.showLogs
        Log.uiViewLogs = this.configuration.logsView

        //get the body element
        var bodyElement = document.getElementsByTagName("BODY")[0] as HTMLElement

        //calculate the size of scrollbars
        if (this.scrollSize == 0) {
            this.scrollSize = HtmlUtils.getScrollWidth()
        }

        // start processing
        Log.log("[WebUI] Start processing")
        CounterUtils.startCounter("drawScreens")

        // discover screens
        UIDomPreparer.discoverScreens(bodyElement, this.configuration, this, screen => {
            this.drawUIScreen(screen)
        })

        Log.log(`[WebUI] End processing(${CounterUtils.endCounter("drawScreens")})`)
    }

    private drawUIScreen(screen: UIView) {
        Log.log(`[${screen.id}] Start processing`)

        //timers variables
        var timerDom = 0
        var timerPrepare = 0
        var timerOrganize = 0
        var timerCalculate = 0
        var timerDraw = 0
        var timerAll = 0

        //call to listener with start event
        this.configuration.sendStartEvent()

        //start genral counter
        CounterUtils.startCounter("all")

        // ----- PREPARE DOM -----
        CounterUtils.startCounter("dom")
        UIDomPreparer.prepareDom(screen.element, this.configuration, this, screen, screen)
        timerDom = CounterUtils.endCounter("dom")

        // ----- PREPARE -----
        CounterUtils.startCounter("prepare")
        UIPreparer.prepareScreen(screen, this.configuration)
        timerPrepare = CounterUtils.endCounter("prepare")

        // ----- ORGANIZE -----
        CounterUtils.startCounter("organize")
        UIOrganizer.organize(screen)
        timerOrganize = CounterUtils.endCounter("organize")

        // ----- CALCULATE -----
        CounterUtils.startCounter("calculate")
        UICalculator.calculate(screen, this.scrollSize)
        timerCalculate = CounterUtils.endCounter("calculate")

        // ---- DRAW -----
        CounterUtils.startCounter("draw")
        UIDrawController.generateDraws(screen, this.configuration)
        UIDrawController.applyDrawsToScreen(screen, this.configuration)
        timerDraw = CounterUtils.endCounter("draw")

        // show counter logs
        timerAll = CounterUtils.endCounter("all")
        Log.log(
            `[${screen.id}] End processing:` +
                ` All(${timerAll})` +
                ` Dom(${timerDom})` +
                ` Prepare(${timerPrepare})` +
                ` Organize(${timerOrganize})` +
                ` Calculate(${timerCalculate})` +
                ` Draw(${timerDraw})`,
        )

        // apply events
        screen.evalEvents()

        //call to listener with end event
        this.configuration.sendEndEvent()
    }

    // ----- REDRAW -----

    onScreenRedraw(screen: UIView) {
        // disable events from screen
        screen.disableEvents()

        // add to the list of screens to draw
        this.screensToDraw[screen.id] = screen

        // call to redraw
        this.redrawTimer.execute()
    }

    //redraw function
    private redraw() {
        // get a copy of the screens to draw
        const screens: UIView[] = []
        for (const id of Object.keys(this.screensToDraw)) {
            screens.push(this.screensToDraw[id])
        }
        this.screensToDraw = {}

        //draw
        Log.log("[WebUI] Start redrawing")
        CounterUtils.startCounter("redraw")
        for (const screen of screens) {
            // draw this screen
            this.drawUIScreen(screen)
        }
        Log.log(`[WebUI] End redraw(${CounterUtils.endCounter("redraw")})`)
    }
}

export default new WebUI()
