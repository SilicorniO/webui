
enum UILogType {
	INFO, WARNING, ERROR, DEBUG
}

export default class UILog {

	public static uiShowLogs = false
	public static uiViewLogs: any | null = null

	public static log(s: string) {
		UILog.logShow(UILogType.DEBUG, s);
	}

	public static logW(s: string) {
		UILog.logShow(UILogType.WARNING, s);
	}

	public static logE(s: string) {
		UILog.logShow(UILogType.ERROR, s);
	}

	public static logI(s: string) {
		UILog.logShow(UILogType.INFO, s);
	}

	public static logIView(prefix: string, view: UIView) {
		UILog.logI("[" + prefix + "] " + view.toString());
		view.forEachChild((child, index) => {
			UILog.logIView(prefix, child)
		});
	}

	public static logShow(type: UILogType, text: string) {
	
		if (!UILog.uiShowLogs){
			return;
		}
		
		//prepare log
		var log = text;
		switch (type){
			case UILogType.DEBUG: log = "DEBUG: " + log; break;
			case UILogType.WARNING: log = "WARNING: " + log; break;
			case UILogType.ERROR: log = "ERROR: " + log; break;
			case UILogType.INFO: log = "INFO: " + log; break;
		}
		
		//show in console
		console.log(log);
		
		//show in view if there is one
		if (UILog.uiViewLogs){
			UILog.uiViewLogs.innerHTML += log + '<BR />';
		}
		
	}
}
