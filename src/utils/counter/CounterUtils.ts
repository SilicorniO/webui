import Log from "../log/Log"

export default class CounterUtils {
    //----- COUNTERS -----

    private static counters: { [key: string]: number } = {}

    public static startCounter(name: string) {
        const now = new Date().getTime()
        CounterUtils.counters[name] = now
    }

    public static endCounter(name: string) {
        const now = new Date().getTime()
        return now - CounterUtils.counters[name]
    }

    public static endCounterLog(name: string) {
        Log.log("Counter[" + name + "]: " + CounterUtils.endCounter(name) + "ms")
    }
}
