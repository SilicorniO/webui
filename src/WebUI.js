
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
	this.nodesUpdated = [];
	this.parentNodesRemoved = [];

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

		//prepare nodes
		var countNodesAdded = this.uiPrepare.addNodes(this.nodesAdded, this.screens, this.configuration);
		var countNodesRemoved = this.uiPrepare.removeNodes(this.parentNodesRemoved);
		var countNodesModified = this.uiPrepare.updateNodes(this.nodesUpdated, this.screens, this.configuration);
		log("Nodes added: " + countNodesAdded + " - Nodes removed: " + countNodesRemoved + " - Nodes modified: " + countNodesModified);

		this.redrawTimer.timer((function(){

			//draw
			log(" -- Redraw -- ");
			this.drawScreens();

		}).bind(this), this.configuration.timeRedraw);
	}).bind(this);

	//window resize event
	this.resize = (function() {
		this.configuration.refreshScreenSize();
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
	
	//get the body element
	var bodyElement = document.getElementsByTagName('BODY')[0];

	//add event listener for window resize
	window.removeEventListener("resize", this.resize); 
	window.addEventListener("resize", this.resize);

	// Options for the observer (which mutations to observe)
	var config = { attributes: true, childList: true, subtree: true };

	// Callback function to execute when mutations are observed
	var callback = (function(mutationsList) {
		for(var mutation of mutationsList) {
			if (mutation.type == 'childList') {

				for(var i=0; i<mutation.addedNodes.length; i++) {
					this.nodesAdded.push(mutation.addedNodes[i]);
				}
				for(var i=0; i<mutation.removedNodes.length; i++) {
					this.parentNodesRemoved.push(mutation.target);
				}
				this.redraw();
			}
			else if (mutation.type == 'attributes') {
				var attributeName = mutation.attributeName;
				if (attributeName == 'id' || 
					attributeName == this.configuration.attribute ||
					this.configuration.attributes.includes(attributeName)) {
					this.nodesUpdated.push(mutation.target);
					this.redraw();
				}
				
			}
		}
	}).bind(this);

	// Create an observer instance linked to the callback function
	var observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(bodyElement, config);
	
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
	startCounter('drawScreens');

	//prepare all dom from body for the first time
	if(this.screens.length==0){
		var bodyElement = document.getElementsByTagName("BODY")[0];
		this.uiPrepare.generateUIViews(bodyElement, this.configuration, this.screens, null);
	}
	
	//draw all screens
	for(var i=0; i<this.screens.length; i++){
		
		//finish rest of calculations
		this.drawUIScreen(this.screens[i]);
	}

	log("Time drawing screens: " + endCounter('drawScreens'));
}

WebUI.prototype.drawUIScreen = function(screen){

	//timers variables
	var timerLoadSizes = 0;
	var timerOrderViews = 0;
	var timerPrepare = 0;
	var timerCore = 0;
	var timerDraw = 0;
	var timerAll = 0;

	//start genral counter
	startCounter('all');

	//---- PREPARE -----
	startCounter('prepare');
	startCounter('loadSizes');

	//call to listener with start event
	this.configuration.sendStartEvent();

	//update the size of the screen
	var screenSizeChanged = this.uiPrepare.loadSizeScreen(screen);
	
	if (screen.hasToBeCalculated()) {

		//load sizes of views
		this.uiPrepare.loadSizes(screen.getChildElements(), this.configuration, screenSizeChanged);
		timerLoadSizes = endCounter('loadSizes');
		
		//order views
		startCounter('orderViews');
		this.uiPrepare.orderViews(screen);
		timerOrderViews = endCounter('orderViews');

		timerPrepare = endCounter('prepare');
		
		//---- CORE -----
		startCounter('core');
		
		//assign position and sizes to screen
		this.uiCore.calculateScreen(screen);
		
		timerCore = endCounter('core');
	}
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = this.uiDraw.applyPositions(screen, this.configuration.viewColors, !screen.hasToBeCalculated());
	this.uiDraw.applyVisibility(screen, null, this.configuration, !screen.hasToBeCalculated());
	
	//resize screen if necessary
	this.uiDraw.applySizeScreen(screen, childrenSizes.maxX, childrenSizes.maxY);

	timerDraw = endCounter('draw');

	//call to listener with end event
	this.configuration.sendEndEvent();
	
	//end counter
	timerAll = endCounter('all');

	log("[" + screen.id + "] All: " + timerAll + "ms - Prepare: " + timerPrepare + "ms - Core: " + timerCore + "ms - Draw: " + timerDraw + 
			"ms - LoadSizes: " + timerLoadSizes + "ms - OrderViews: " + timerOrderViews + "ms");
}

var WebUIInstance = new WebUI();
window['WebUI'] = WebUIInstance;
window['WebUI']['start'] = WebUIInstance.start;
window['WebUI']['refresh'] = WebUIInstance.refresh;