import WebUI from "./WebUI"

const WebUIInstance = new WebUI()
window["WebUI"] = WebUIInstance
window["WebUI"]["start"] = WebUIInstance.start

exports.WebUI = WebUIInstance
