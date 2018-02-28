
/**
 * @constructor
 * @param uiConf 
 */
function UIConfiguration(uiConf){

	this.attribute = 'ui';
	this.attributes = [];
	this.dimens = {};
	this.timeRedraw = 20;

	//show colors to know the size of the views
	this.viewColors = false;

	//show or hide logs of WebUI
	this.showLogs = false;

	//view where to show the logs in screen
	this.logsView = null;

	//if no configuration received we use default values
	if(!uiConf){
		return;
	}

	if(uiConf['viewColors']){
        this.viewColors = true;
    }
	
	if(uiConf['showLogs']){
		this.showLogs = true;
		if(uiConf.viewLogs){
			this.logsView = document.getElementById(uiConf.viewLogs);
		}
	}

	if(uiConf['timeRedraw']!=null && !isNaN(uiConf['timeRedraw'])){
		this.timeRedraw = parseInt(uiConf['timeRedraw'], 10);
	}

	//set attribute
	if(uiConf['attribute']){
		this.attribute = uiConf['attribute'];
	}
	
	//initialize dimens
	this.dimens = {};
	if(uiConf['dimens']){
		//copy all values
		var dimenKeys = Object.keys(uiConf['dimens']);
		for(var i=0;i<dimenKeys.length;i++){
			this.dimens[dimenKeys[i]] = uiConf['dimens'][dimenKeys[i]];
		}
	}

	//save screen modes
	this.screenModes = uiConf['screenModes'];
	
	this.refreshScreenSize();
}

UIConfiguration.prototype.refreshScreenSize = function(){

	//initialize array of attributes
	var aAttributes = [];
	var dimens = this.dimens;

	var widthScreen = window.innerWidth;
	var heightScreen = window.innerHeight;
	
	log('screen-width: ' + widthScreen);
	log('screen-height: ' + heightScreen);
	
	if(this.screenModes){
		for(var i=0; i<this.screenModes.length; i++){
			
			//get the screenMode
			var screenMode = this.screenModes[i];
			
			//check each screenMode 
			if(	(!screenMode['widthStart'] || screenMode['widthStart']==0 || screenMode['widthStart']<widthScreen) && 
				(!screenMode['widthEnd'] || screenMode['widthEnd']==0 || screenMode['widthEnd']>widthScreen) && 
				(!screenMode['heightStart'] || screenMode['heightStart']==0 || screenMode['heightStart']<heightScreen) && 
				(!screenMode['heightEnd'] || screenMode['heightEnd']==0 || screenMode['heightEnd']<heightScreen) 
			){
				aAttributes.push(screenMode['attribute']);
				log('SHOWING ATTRIBUTE: ' + screenMode['attribute']);
				//add dimens of this screen mode overriding existing
				if(screenMode['dimens']){
					var dimenKeys = Object.keys(screenMode['dimens']);
					for(var n=0;n<dimenKeys.length;n++){
						dimens[dimenKeys[n]] = screenMode['dimens'][dimenKeys[n]];
					}
				}
			}
		}	
	}
	
	//set attributes and dimens
	this.attributes = aAttributes;
	this.selectedDimens = dimens;
}

UIConfiguration.prototype.getDimen = function(name){
	
	if(this.selectedDimens[name]){
		return parseInt(this.selectedDimens[name], 10);
	}else if(name && !isNaN(parseInt(name))){
		return parseInt(name, 10);
	}else{
		logE('The dimension "' + name + '" is not valid or it is not defined');
		return 0;
	}

}