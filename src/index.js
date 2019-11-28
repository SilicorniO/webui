import WebUI from "./WebUI"

var WebUIInstance = new WebUI()
window["WebUI"] = WebUIInstance
window["WebUI"]["start"] = WebUIInstance.start
window["WebUI"]["refresh"] = WebUIInstance.refresh