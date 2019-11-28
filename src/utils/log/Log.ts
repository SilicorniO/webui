import UIView from "../../model/UIView"

enum LogType {
    INFO,
    WARNING,
    ERROR,
    DEBUG,
}

export default class Log {
    public static uiShowLogs = false
    public static uiViewLogs: any | null = null

    public static log(s: string) {
        Log.logShow(LogType.DEBUG, s)
    }

    public static logW(s: string) {
        Log.logShow(LogType.WARNING, s)
    }

    public static logE(s: string) {
        Log.logShow(LogType.ERROR, s)
    }

    public static logI(s: string) {
        Log.logShow(LogType.INFO, s)
    }

    public static logIView(prefix: string, view: UIView) {
        Log.logI("[" + prefix + "] " + view.toString())
        view.forEachChild((child, _index) => {
            Log.logIView(prefix, child)
        })
    }

    public static logShow(type: LogType, text: string) {
        if (!Log.uiShowLogs) {
            return
        }

        //prepare log
        var log = text
        switch (type) {
            case LogType.DEBUG:
                log = "DEBUG: " + log
                break
            case LogType.WARNING:
                log = "WARNING: " + log
                break
            case LogType.ERROR:
                log = "ERROR: " + log
                break
            case LogType.INFO:
                log = "INFO: " + log
                break
        }

        //show in console
        console.log(log)

        //show in view if there is one
        if (Log.uiViewLogs) {
            Log.uiViewLogs.innerHTML += log + "<BR />"
        }
    }
}
