
/**
* Generate a new CoreConfig for the UIconfig object
* @constructor
* @param uiConf Object to read values
* @return CoreConfig generated
**/
function createCoreConfig(uiConf){
		
	var coreConfig = {
		suffixs: [],
		dimens: {},
		
		getDimen: function(name){
			if(typeof this.dimens[name] !== 'undefined'){
				return parseInt(this.dimens[name]);
			}else{
				return parseInt(name);
			}
		}
	};
	
	if(!uiConf){
		return coreConfig;
	}
	
	//initialize array of suffix
	var aSuffix = [];
	
	//initialize dimens
	var dimens = {};
	if(uiConf['dimens']){
		//copy all values
		var dimenKeys = Object.keys(uiConf['dimens']);
		for(var i=0;i<dimenKeys.length;i++){
			dimens[dimenKeys[i]] = uiConf['dimens'][dimenKeys[i]];
		}
	}
	
	var widthScreen = window.innerWidth;
	var heightScreen = window.innerHeight;
	
	log('screen-width: ' + widthScreen);
	log('screen-height: ' + heightScreen);
	
	if(uiConf['screenModes']){
		for(var i=0; i<uiConf['screenModes'].length; i++){
			
			//get the screenMode
			var screenMode = uiConf['screenModes'][i];
			
			//check each screenMode 
			if(	(!screenMode['widthStart'] || screenMode['widthStart']==0 || screenMode['widthStart']<widthScreen) && 
				(!screenMode['widthEnd'] || screenMode['widthEnd']==0 || screenMode['widthEnd']>widthScreen) && 
				(!screenMode['heightStart'] || screenMode['heightStart']==0 || screenMode['heightStart']<heightScreen) && 
				(!screenMode['heightEnd'] || screenMode['heightEnd']==0 || screenMode['heightEnd']<heightScreen) 
			){
				aSuffix.push(screenMode['suffix']);
				log('SHOWING SUFFIX: ' + screenMode['suffix']);
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
	
	//set values
	coreConfig.suffixs = aSuffix;
	coreConfig.dimens = dimens;
	
	return coreConfig;
}