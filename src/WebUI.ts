import UIPreparer from "./core/prepare/UIPreparer"
import CallbackTimer from "./utils/callbacktimer/CallbackTimer"
import UIConfiguration from "./UIConfiguration"
import Log from "./utils/log/Log"
import UIView from "./model/UIView"
import UIConfigurationData from "./model/UIConfigurationData"
import HtmlUtils from "./utils/html/HTMLUtils"
import CounterUtils from "./utils/counter/CounterUtils"
import UIDrawController from "./core/draw/UIDrawController"
import UIDomPreparer from "./core/dom/UIDomPreparer"
import UIOrganizer from "./core/organize/UIOrganizer"
import WebUIEventsManager from "./core/events/WebUIEventsManager"
import UICalculator from "./core/calculate/UICalculator"

export type WebUIRedraw = (screen: UIView) => void

export interface WebUIListener {
    onElementDiscover: (element: HTMLElement) => void
    onViewRedraw: (view: UIView) => void
}

/**
 * @constructor
 */
export default class WebUI implements WebUIListener {
    //size of scrollbars to use as padding when views have scrollbars visible
    private scrollSize: number = 0

    //configuration
    private configuration: UIConfiguration = new UIConfiguration()

    //timer for repainting
    private redrawTimer: CallbackTimer

    // events manager for dom
    private eventsManager: WebUIEventsManager = new WebUIEventsManager(this)

    private elementsToDiscover: HTMLElement[] = []
    private viewsToDraw: { [key: string]: UIView } = {}

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
        const bodyElement = document.getElementsByTagName("BODY")[0] as HTMLElement

        //calculate the size of scrollbars
        if (this.scrollSize == 0) {
            this.scrollSize = HtmlUtils.getScrollWidth()
        }

        //call to listener with start event
        this.configuration.sendStartEvent()

        // discover screens from body
        this.discoverAndDraw(bodyElement)

        // listen the body to discover screens later
        this.eventsManager.init(bodyElement, this.configuration)

        //call to listener with end event
        this.configuration.sendEndEvent()
    }

    private discoverAndDraw(element: HTMLElement) {
        // start processing
        Log.log("[WebUI] Start processing")
        CounterUtils.startCounter("drawScreens")

        // discover screens
        UIDomPreparer.discoverScreens(element, this.configuration, this, (screen) => {
            // draw the screen
            this.drawUIView(screen)
        })

        Log.log(`[WebUI] End processing(${CounterUtils.endCounter("drawScreens")})`)
    }

    private drawUIView(view: UIView) {
        Log.log(`[${view.id}] Start processing screen`)

        //timers variables
        let timerDom = 0
        let timerPrepare = 0
        let timerOrganize = 0
        let timerCalculate = 0
        let timerDraw = 0
        let timerAll = 0

        //start genral counter
        CounterUtils.startCounter("all")

        // ----- PREPARE DOM -----
        CounterUtils.startCounter("dom")
        UIDomPreparer.prepareDom(view.element, this.configuration, this, view, view)
        timerDom = CounterUtils.endCounter("dom")

        // ----- PREPARE -----
        CounterUtils.startCounter("prepare")
        UIPreparer.prepareScreen(view, this.configuration)
        timerPrepare = CounterUtils.endCounter("prepare")

        // ----- ORGANIZE -----
        CounterUtils.startCounter("organize")
        UIOrganizer.organize(view)
        timerOrganize = CounterUtils.endCounter("organize")

        // ----- CALCULATE -----
        CounterUtils.startCounter("calculate")
        UICalculator.calculate(view, this.configuration, this.scrollSize)
        timerCalculate = CounterUtils.endCounter("calculate")

        // ---- DRAW -----
        CounterUtils.startCounter("draw")
        UIDrawController.generateDraws(view, this.configuration)
        UIDrawController.applyDraws(view, this.configuration)
        timerDraw = CounterUtils.endCounter("draw")

        // show counter logs
        timerAll = CounterUtils.endCounter("all")
        Log.log(
            `[${view.id}] End processing:` +
                ` All(${timerAll})` +
                ` Dom(${timerDom})` +
                ` Prepare(${timerPrepare})` +
                ` Organize(${timerOrganize})` +
                ` Calculate(${timerCalculate})` +
                ` Draw(${timerDraw})`,
        )
    }

    // ----- REDRAW -----

    onElementDiscover(element: HTMLElement) {
        // add the element to the list of elements to search
        if (this.elementsToDiscover.includes(element)) {
            return
        }

        // append the element
        this.elementsToDiscover.push(element)

        // call to redraw
        this.redrawTimer.execute()
    }

    onViewRedraw(view: UIView) {
        // add to the list of screens to draw
        this.viewsToDraw[view.id] = view

        // call to redraw
        this.redrawTimer.execute()
    }

    //redraw function
    private redraw() {
        // get a copy of the elements to discover
        const elements = this.elementsToDiscover.slice(0)
        this.elementsToDiscover = []

        // get a copy of the screens to draw
        const views: UIView[] = []
        for (const id of Object.keys(this.viewsToDraw)) {
            views.push(this.viewsToDraw[id])
        }
        this.viewsToDraw = {}

        //draw
        Log.log("[WebUI] Start redrawing")
        CounterUtils.startCounter("redraw")

        // discoverting
        for (const element of elements) {
            this.discoverAndDraw(element)
        }

        // drawing
        for (const view of views) {
            // draw this screen
            this.drawUIView(view)
        }
        Log.log(`[WebUI] End redraw(${CounterUtils.endCounter("redraw")})`)
    }
}
