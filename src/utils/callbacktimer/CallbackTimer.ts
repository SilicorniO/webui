export default class CallbackTimer {
    private static readonly DELAY_DEFAULT = 20

    // time to execute
    private timeNextExecution: number | null = null

    // delay to apply between executions
    private delay: number

    // callback to call when it's time to execute
    private cbExecution: () => void

    // timeout being used
    private timeoutRunning: boolean = false

    constructor(cbExecution: () => void, delay: number = CallbackTimer.DELAY_DEFAULT) {
        this.cbExecution = cbExecution
        this.delay = delay
    }

    public execute() {
        // check we have execution
        if (this.timeNextExecution == null || this.delay == 0) {
            this.callToExecute()
            return
        }

        // check time is after execution
        const timeNow = new Date().getTime()
        if (timeNow > this.timeNextExecution) {
            this.callToExecute()
            return
        }

        // check we have not a timeout running
        if (this.timeoutRunning) {
            return
        }

        // can't be executed at this moment, we add a timeout
        this.timeoutRunning = true
        setTimeout(() => {
            // cancel timeout
            this.timeoutRunning = false

            // execute
            this.execute()
        }, this.timeNextExecution - timeNow)
    }

    private callToExecute() {
        // save time for next execution
        this.timeNextExecution = new Date().getTime() + this.delay

        // execute
        this.cbExecution()
    }
}
