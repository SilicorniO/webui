
//Static classess
var UIViewUtilsInstance = new UIViewUtils();
var UIUtilsInstance = new UIUtils();

/**  
 * @constructor
*/
function WebUI(){

	/** Configuration saved **/
	this.uiConfiguration;

	//size of scrollbars to use as padding when views have scrollbars visible
	this.scrollWidth = 0;
	this.scrollHeight = 0;

	//list of screens
	this.screens = [];

	//ids of nodes changed
	this.nodesAdded = [];
	this.nodesRemoved = [];

	//controllers
	this.uiPrepare = new UIPrepare(this.refresh.bind(this));
	this.uiDraw = new UIDraw();
	this.uiCore = null;

	//configuration
	this.configuration = null;

	//timer for repainting
	this.redrawTimer = new UIRedrawTimer();

	//redraw function
	this.redraw = (function() {

		this.redrawTimer.timer((function(){

			//when a node is added we have to check the relationship with the rest of views
			while(this.nodesAdded.length>0){
				
				//get first node and remove from list
				var node = this.nodesAdded[0];
				this.nodesAdded.splice(0,1);

				//1. Search and add UI elements from this node. Adding newscreens to the list
				this.uiPrepare.generateUIViews(node, this.configuration, this.screens);

				//get the parent if has one
				var parent = node.ui? node.ui.parent : null;
				if(parent){

					//2. Order views in parent
					parent.childrenInOrder = false;

					//3. Check if parent has size content, to mark it as modified
					if(parent.sizeWidth=='sc' || parent.sizeHeight=='sc'){
						parent.sizeLoaded = false;
					}

				}
			}

			//draw
			this.drawScreens();

		}).bind(this), this.configuration.timeRedraw);
	}).bind(this);

	//window resize event
	this.resize = (function() {
		this.configuration.refreshScreenSize();
		this.clearUI();
		this.redraw();
	}).bind(this)
}

/**
 * Start running the webUI listening for dom changes and initial start
 * @param {UIConfiguration} configuration 
 */
WebUI.prototype.start = function(configuration){
	
	//clear to avoid problems if it was called previously
	this.clearUI();

	//calculate the size of scrollbars
    if(this.scrollWidth==0){
        this.scrollWidth = getScrollWidth();
    } 
	
	//save configuration
	this.configuration = new UIConfiguration(configuration);
	
	//apply global values for logs
	uiShowLogs = this.configuration.showLogs;
	uiViewLogs = this.configuration.logsView;
	
	//prepare core with the configuration
	this.uiCore = new UICore(this.scrollWidth);
	
	//start running on actual dom
	this.drawScreens();
	
	//listen dom events
	this.listenDomEvents();
	
}

WebUI.prototype.listenDomEvents = function(){
	
	var self = this;
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeInserted", function (event) {
		self.nodesAdded.push(event.srcElement);
		self.redraw();
	}, false);
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeRemoved", function (event) {
		// self.nodesRemoved.push(event.srcElement);
		// self.nodesRemoved.push(event.relatedNode);
		// self.redraw();
	}, false);

	//add event listener for window resize
	window.removeEventListener("resize", this.resize); 
	window.addEventListener("resize", this.resize);
	
}

WebUI.prototype.clearUI = function() {

	//delete the UI element and childrens
	var clearUI = function(element) {
		if (element.ui) {
			delete element.ui;
			var viewChildNodes = element.childNodes;
			if (viewChildNodes) {
				for (var i = 0; i < viewChildNodes.length ; i++) {
					clearUI(viewChildNodes[i]);
				}
			}
		}
	}

	//for each screen delete the UI element and its children
	if (this.screens) {
		this.screens.forEach( function(screen) {
			clearUI(screen.element);
		});

		//delete all screens
		this.screens = [];
	}
}

/**
* Refresh the UI framework with the identifier saved if there was one
**/
WebUI.prototype.refresh = function(){
	this.redraw();
}

/**
* Execute UI
**/
WebUI.prototype.drawScreens = function(){
    
	//start genral counter
	startCounter('all');

	//prepare all dom from body for the first time
	if(this.screens.length==0){
		var bodyElement = document.getElementsByTagName("BODY")[0];
		this.uiPrepare.generateUIViews(bodyElement, this.configuration, this.screens);
	}
	
	//draw all screens
	for(var i=0; i<this.screens.length; i++){
		
		//finish rest of calculations
		this.drawUIScreen(this.screens[i]);
	}

}

WebUI.prototype.drawUIScreen = function(screen){

	//---- PREPARE -----
	startCounter('prepare');
	startCounter('loadSizes');

	//call to listener with start event
	this.configuration.sendStartEvent();

	//update the size of the screen
	var screenSizeChanged = this.uiPrepare.loadSizeScreen(screen);
						
	//load sizes of views
	this.uiPrepare.loadSizesSlow(screen.getChildElements(), this.configuration, screenSizeChanged);

	endCounterLog('loadSizes');
	startCounter('orderViews');
	
	//order views
	this.uiPrepare.orderViews(screen);
	
	endCounterLog('orderViews');
	endCounterLog('prepare');
	
	//---- CORE -----
	startCounter('core');
	
	//assign position and sizes to screen
	this.uiCore.calculateScreen(screen);
	
	endCounterLog('core');
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = this.uiDraw.applyPositions(screen, this.configuration.viewColors);
	
	//resize screen if necessary
	this.uiDraw.applySizeScreen(screen, childrenSizes.maxX, childrenSizes.maxY);

	endCounterLog('draw');

	//call to listener with end event
	this.configuration.sendEndEvent();
	
	//end counter
	endCounterLog('all');
}

var WebUIInstance = new WebUI();
window['WebUI'] = WebUIInstance;
window['WebUI']['start'] = WebUIInstance.start;
window['WebUI']['refresh'] = WebUIInstance.refresh;