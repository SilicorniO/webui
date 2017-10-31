
/** Flag to set background color of UI views **/
var viewColors = false;

/** Configuration saved **/
var uiConfiguration;

//size of scrollbars to use as padding when views have scrollbars visible
var scrollWidth = 0;
var scrollHeight = 0;

/** Identifier to use when call to refresh the framework **/
var idUI = null;

window['configUI'] = configUI;
/**
* Configuration to apply
* @param configuration object with values to set up
**/
function configUI(configuration){
	
	uiConfiguration = configuration;
	    
    if(configuration['viewColors']){
        viewColors = true;
    }
	
	if(configuration['showLogs']){
		uiShowLogs = true;
		if(configuration.viewLogs){
			uiViewLogs = document.getElementById(configuration.viewLogs);
		}
	}
		
}

function init(){
    
    //calculate the size of scrollbars
    if(scrollWidth==0){
        scrollWidth = getScrollWidth();
    }  

	return createCoreConfig(uiConfiguration);
    
}

window['drawUI'] = drawUI;
/**
* Execute UI
**/
function drawUI(cbEvents){
    
	//start genral counter
	startCounter('all');
	
    //initialize variables
    var coreConfig = init();
			
	//read views from html
	var views = getChildrenViews(null, null, coreConfig.suffixs);
			
	//create screen and add it in the first position
	var screen = createScreen("s", null, views, coreConfig.suffixs);
	
	//save size of views
	screen.sizes = saveSizes(screen.view);
		
	//update the size of the screen
	loadSizeScreen(screen);
	
	//finish rest of calculations
	drawUIScreen(screen, coreConfig, cbEvents);
}

window['drawUIAll'] = drawUIAll;
/**
* Execute UI
**/
function drawUIAll(cbEvents){
    
	//start genral counter
	startCounter('all');
	
	//search all the screens
	var screens = getAllScreens(null, null);

	//draw all screens
	for(var i=0; i<screens.length; i++){
		drawUIForId(screens[i], cbEvents);
	}

}

window['drawUIForId'] = drawUIForId;
/**
* Execute UI for an ID
* @param id identifier of element in HTML
**/
function drawUIForId(id, cbEvents){
		
    //initialize variables
    var coreConfig = init();
		
	//get the element with the ID
	var ele = document.getElementById(id);
	if(ele == null){
		logE("Error getting element with ID: " + id);
		return;
	}
	
	//read views from html
	var views = getChildrenViews(id, ele, coreConfig.suffixs);
	
	//create screen and add it in the first position
	var screen = createScreen(id, ele, views, coreConfig.suffixs);
	
	//save size of views
	screen.sizes = saveSizes(screen.view);
	
	//update the size of the screen
	loadSizeScreen(screen, ele);
			
	//set the position of parent as relative because the children will be absolute
	ele.style.position = "relative";
	
	//finish rest of calculations
	drawUIScreen(screen, coreConfig, cbEvents);

}



function drawUIScreen(screen, coreConfig, cbEvents){
					
	//---- PREPARE -----
	startCounter('prepare');
						
	//load sizes of views
	loadSizes(screen.view.children, coreConfig);
				
	//order views
	orderViews(screen.view);
	
	endCounterLog('prepare');
	
	//---- CORE -----
	startCounter('core');
	
	//assign position and sizes to screen
	calculateScreen(screen.view, coreConfig);
	
	endCounterLog('core');
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = applyPositions(screen.view.children);
	
	//resize screen if necessary
	applySizeScreen(screen.view, childrenSizes.maxX, childrenSizes.maxY);

	endCounterLog('draw');

	//call to listener of events
	if(cbEvents){
		cbEvents({
			'name': 'end',
			'suffixs': coreConfig.suffixs
		});
	}
	
	//end counter
	endCounterLog('all');
}

/**
* Refresh the UI framework with the identifier saved if there was one
**/
function refreshUI(){
	if(idUI == null){
		drawUI();
	}else{
		drawUIForId(idUI);
	}
}

/**
* Return the list of suffix to apply for the width and height of the screen
* @return String[] sufixs to apply to UI attribute
**/
function getUiCoreConfig(){
	
	//initialize array of suffix
	var aSuffix = [];
	
	//initialize dimens
	var dimens = uiConfiguration.dimens;
	if(!dimens){
		dimens = {};
	}
	
	var widthScreen = document.body.clientWidth;
	var heightScreen = document.body.clientHeight;
	
	log('screen-width: ' + widthScreen);
	log('screen-height: ' + heightScreen);
	
	if(uiConfiguration.screenModes){
		for(var i=0; i<uiConfiguration.screenModes.length; i++){
			
			//get the screenMode
			var screenMode = uiConfiguration.screenModes[i];
			
			//check each screenMode 
			if(	(!screenMode.widthStart || screenMode.widthStart==0 || screenMode.widthStart<widthScreen) && 
				(!screenMode.widthEnd || screenMode.widthEnd==0 || screenMode.widthEnd>widthScreen) && 
				(!screenMode.heightStart || screenMode.heightStart==0 || screenMode.heightStart<heightScreen) && 
				(!screenMode.heightEnd || screenMode.heightEnd==0 || screenMode.heightEnd<heightScreen) 
			){
				aSuffix.push(screenMode.suffix);
				log('SHOWING SUFFIX: ' + screenMode.suffix);
				//add dimens of this screen mode overriding existing
				if(screenMode.dimens){
					var dimenKeys = Object.keys(screenMode.dimens);
					for(var n=0;n<dimenKeys.length;n++){
						dimens[dimenKeys[n]] = screenMode.dimens[dimenKeys[n]];
					}
				}
			}
		}	
	}
	
	return {
		suffixs: aSuffix,
		dimens: dimens
	};
	
}


