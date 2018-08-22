
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

		this.redrawTimer.timer((function(){

			//when a node is added we have to check the relationship with the rest of views
			while(this.nodesAdded.length>0){
				
				//get first node and remove from list
				var node = this.nodesAdded[0];
				this.nodesAdded.splice(0,1);

				//1. Search and add UI elements from this node. Adding newscreens to the list
				this.uiPrepare.generateUIViews(node, this.configuration, this.screens);

				//get the parent if has one
				var parentElement = node.parentNode;
				if(parentElement && parentElement.ui){
					var parentView = parentElement.ui;

					//2. Order views in parent
					parentView.childrenInOrder = false;

					//3. Check if parent has size content, to mark it as modified
					if(parentView.sizeWidth=='sc' || parentView.sizeHeight=='sc'){
						parentView.sizeLoaded = false;
					}

				}
			}

			//when a node is removed we have to check the relationship of the parent
			while(this.parentNodesRemoved.length>0){
				
				//get first node and remove from list
				var parentNode = this.parentNodesRemoved[0];
				this.parentNodesRemoved.splice(0,1);

				//search the parent view with UI interface
				var refreshParent = function(node) {

					//check it has UI
					if(node && node.ui){
						var view = node.ui;
	
						//2. Order views in parent
						view.childrenInOrder = false;
	
						//3. Check if parent has size content, to mark it as modified
						if(view.sizeWidth=='sc' || view.sizeHeight=='sc'){
							view.sizeLoaded = false;
						}
						return;
					} else {

						//search UI in parent
						var parentNode = node.parentNode;
						if (parentNode) {
							refreshParent(parentNode);
						}
					}

				}
				refreshParent(parentNode);				
			}

			//when a node is removed we have to check the relationship of the parent
			var nodeIdsUpdated = [];
			while(this.nodesUpdated.length>0){
				
				//get first node and remove from list
				var node = this.nodesUpdated[0];
				this.nodesUpdated.splice(0,1);

				//check this id has not been already updated
				if (!node.ui || !nodeIdsUpdated.includes(node.ui.id)) {

					//try to generate the UI view
					delete node.ui;
					view = this.uiPrepare.generateUIViews(node, this.configuration, this.screens);
						
					//update parent to re-calculate it
					if (view) {

						//save the id
						nodeIdsUpdated.push(view.id);

						//prepare parent for re-calculations
						var parent = view.parent;
						if (parent) {
							parent.childrenInOrder = false;
							parent.sizeLoaded = false;
						}
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
	
	var bodyElement = document.getElementsByTagName('BODY')[0];
	// bodyElement.addEventListener("DOMNodeInserted", function (event) {
	// 	self.nodesAdded.push(event.srcElement);
	// 	self.redraw();
	// }, false);

	// bodyElement.addEventListener("DOMNodeInsertedIntoDocument", function (event) {
	// 	log(event);
	// }, false);

	// bodyElement.addEventListener("DOMAttrModified", function (event) {
	// 	log(event);
	// }, false);

	// bodyElement.addEventListener("DOMSubtreeModified", function (event) {
	// 	log(event);
	// }, false);

	// bodyElement.addEventListener("DOMNodeRemoved", function (event) {
	// 	// self.nodesRemoved.push(event.srcElement);
	// 	self.parentNodesRemoved.push(event.relatedNode);
	// 	self.redraw();
	// }, false);

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
				if (mutation.attributeName == 'data-ui') {
					console.log(mutation);
					console.log(this.configuration.attribute);
					console.log(this.configuration.attributes);
				}
				var attributeName = mutation.attributeName;
				if (attributeName == 'id' || 
					attributeName == this.configuration.attribute ||
					this.configuration.attributes.includes(attributeName)) {
					this.nodesUpdated.push(mutation.target);
					this.redraw();
				}
				if (attributeName == 'style' && mutation.target.style.position == 'relative') {
					console.log('mutation style relative: ' + mutation.target.id);
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
	
	if (screen.hasToBeCalculated()) {

		//load sizes of views
		this.uiPrepare.loadSizes(screen.getChildElements(), this.configuration, screenSizeChanged);
		
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
	}
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = this.uiDraw.applyPositions(screen, this.configuration.viewColors, !screen.hasToBeCalculated());
	this.uiDraw.applyVisibility(screen, null, this.configuration, !screen.hasToBeCalculated());
	
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