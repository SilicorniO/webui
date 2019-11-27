import _ from "lodash";
import WebUI from "./WebUI.js"

var WebUIInstance = new WebUI();
window['WebUI'] = WebUIInstance;
window['WebUI']['start'] = WebUIInstance.start;
window['WebUI']['refresh'] = WebUIInstance.refresh;