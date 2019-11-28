import UILog from "./general/UILog"

export interface UIDataEvent {
	name: string
	attributes?: string[]
}

export interface UIConfigurationDataScreenMode {
	attribute?: string
	widthStart?: number
	widthEnd?: number
	heightStart?: number
	heightEnd?: number
	dimens?: { [key: string]: number }
}

export interface UIConfigurationDataAnimations {
	defaultTime?: number
	defaultOpacity?: boolean
}

export interface UIConfigurationData {
	viewColors?: boolean
	showLogs?: boolean
	viewLogs?: string
	attribute?: string
	animations?: UIConfigurationDataAnimations
	dimens?: { [key: string]: number }
	screenModes?: UIConfigurationDataScreenMode[]
	timeRedraw?: number
	events?: (event: UIDataEvent) => void
}

export default class UIConfiguration {

	private static readonly ATTRIBUTE_DEFAULT = "ui"
	private static readonly ANIMATION_TIME_DEFAULT = 0.3
	private static readonly ANIMATION_OPACITY_DEFAULT = false

	private static readonly EVENT_START = "start"
	private static readonly EVENT_END = "end"

	public attribute: string = UIConfiguration.ATTRIBUTE_DEFAULT
	public attributes: string[] = []
	private dimens: { [key: string]: number } = {}
	private selectedDimens: { [key: string]: number } = {}
	public timeRedraw = 20

	// show colors to know the size of the views
	public viewColors: boolean = false

	// show or hide logs of WebUI
	public showLogs: boolean = false

	// view where to show the logs in screen
	public logsView?: HTMLElement

	// scren modes
	private screenModes: UIConfigurationDataScreenMode[] = []

	// listener to send events
	private events?: (event: UIDataEvent) => void

	// animations
	public animations: UIConfigurationDataAnimations = {
		defaultTime: UIConfiguration.ANIMATION_TIME_DEFAULT,
		defaultOpacity: UIConfiguration.ANIMATION_OPACITY_DEFAULT
	}

	/**
	 * @constructor
	 * @param uiConf 
	 */
	constructor(uiConf?: UIConfigurationData){

		// if no configuration received we use default values
		if (uiConf == null){
			return
		}

		if (uiConf.viewColors == true){
			this.viewColors = true;
		}
		
		if (uiConf.showLogs == true){
			this.showLogs = true;
			if(uiConf.viewLogs){
				this.logsView = document.getElementById(uiConf.viewLogs);
			}
		}

		if (uiConf.events != null){
			this.events = uiConf.events
		}

		if (uiConf.animations != null) {
			var animations = uiConf.animations
			if (animations.defaultTime != null) {
				this.animations.defaultTime = animations.defaultTime
			}
			if (animations.defaultOpacity != null) {
				this.animations.defaultOpacity = animations.defaultOpacity
			}
		}

		if (uiConf.timeRedraw !=null && !isNaN(uiConf.timeRedraw)) {
			this.timeRedraw = uiConf.timeRedraw;
		}

		// set attribute
		if (uiConf.attribute) {
			this.attribute = uiConf.attribute
		}
		
		// initialize dimens
		this.dimens = {}
		if (uiConf.dimens) {
			// copy all values
			var dimenKeys = Object.keys(uiConf.dimens)
			for(var i=0; i < dimenKeys.length; i++){
				this.dimens[dimenKeys[i]] = uiConf.dimens[dimenKeys[i]];
			}
		}

		// save screen modes
		this.screenModes = uiConf.screenModes
		
		this.refreshScreenSize()
	}

	public refreshScreenSize() {

		//initialize array of attributes
		var aAttributes = [];
		var dimens = this.dimens;

		var widthScreen = window.innerWidth;
		var heightScreen = window.innerHeight;
		
		UILog.log('screen-width: ' + widthScreen);
		UILog.log('screen-height: ' + heightScreen);
		
		if(this.screenModes){
			for(var i=0; i<this.screenModes.length; i++){
				
				//get the screenMode
				var screenMode = this.screenModes[i];
				
				//check each screenMode 
				if(	(!screenMode.widthStart || screenMode.widthStart ==0 || screenMode.widthStart <widthScreen) && 
					(!screenMode.widthEnd || screenMode.widthEnd ==0 || screenMode.widthEnd >widthScreen) && 
					(!screenMode.heightStart || screenMode.heightStart ==0 || screenMode.heightStart <heightScreen) && 
					(!screenMode.heightEnd || screenMode.heightEnd ==0 || screenMode.heightEnd <heightScreen) 
				){
					aAttributes.push(screenMode['attribute'])
					UILog.log('SHOWING ATTRIBUTE: ' + screenMode['attribute'])
					//add dimens of this screen mode overriding existing
					if( screenMode.dimens ) {
						var dimenKeys = Object.keys(screenMode['dimens'])
						for(var n=0;n<dimenKeys.length;n++){
							dimens[dimenKeys[n]] = screenMode['dimens'][dimenKeys[n]]
						}
					}
				}
			}	
		}
		
		//set attributes and dimens
		this.attributes = aAttributes;
		this.selectedDimens = dimens;
	}

	public getDimen(name: string): number {
		
		if(this.selectedDimens[name]){
			return this.selectedDimens[name]
		}else if(name && !isNaN(parseInt(name, 10))){
			return parseInt(name, 10)
		}else{
			UILog.logE('The dimension "' + name + '" is not valid or it is not defined');
			return 0
		}

	}

	public sendStartEvent() {
		if(this.events){
			this.events({
				name: UIConfiguration.EVENT_START,
			})
		}
	}

	public sendEndEvent = function() {
		if(this.events){
			this.events({
				name: UIConfiguration.EVENT_END,
				attributes: this.attributes
			});
		}
	}

}
