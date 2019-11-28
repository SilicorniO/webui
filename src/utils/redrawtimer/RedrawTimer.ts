export default class RedrawTimer {
    private time: number | null = null

    /**
     * Catch a lot of requests and call to callback once after timeout
     * @param cb Callback to call when it is time to redraw
     * @param timeMillis milliseconds to wait
     **/
    public timer(cb: () => void, timeMillis: number) {
        if (!timeMillis) {
            timeMillis = 20
        }

        //check if it is running
        var running = this.time != null

        //update the time
        this.time = new Date().getTime() + timeMillis

        //start the timer if not started
        if (!running) {
            this.timerLauncher(timeMillis, cb)
        }
    }

    private timerLauncher(timeInMillis: number, cb: () => void) {
        setTimeout(
            function() {
                //check time is after timer
                var now = new Date().getTime()
                if (now > this.time) {
                    //clean the timer
                    this.time = null

                    //redraw
                    cb()
                } else {
                    //run timer again with rest of milliseconds
                    this.timerLauncher(this.time - now, cb)
                }
            }.bind(this),
            timeInMillis,
        )
    }
}
