
/** 
 * @constructor
*/
function UIPrepare(refreshFunc){

	//save the refresh function
	this.refreshFunc = refreshFunc;

	/** Value to incremenet and create auto ids **/
	this.generatedId = 0;

	/** Flag to know if image events have been added **/
	this.imgEventsAdded = false;

}

/**
* Order the children of the parent view received
* @param {UIView} parent View to order the childrens
**/
UIPrepare.prototype.orderViews = function(parent){

	if(!parent.childrenInOrder){

		//clean dependencies of all views
		parent.forEachChild(function(child, index){
			child.dependenciesHor = [];
			child.dependenciesVer = [];
		});

		//then order all the views with parent screen
		parent.childrenOrderHor = this.orderViewsSameParent(parent, true);
		parent.childrenOrderVer = this.orderViewsSameParent(parent, false);

		//mark as parent with order
		parent.childrenInOrder = true;
	}
		
	//for each one, add the view and then its ordered children
	parent.forEachChild((function(child, index){
		if(child.getChildElements().length>0){
			this.orderViews(child);
		}
	}).bind(this));
}

/** 
* Order the views received with the dependencies of each view
* @private
* @param {UIView} parent Parent view
* @param {boolean} hor TRUE for horizontal dependencies, FALSE for vertical dependecies
* @return Array of views from params, in order
**/
UIPrepare.prototype.orderViewsSameParent = function(parent, hor){

	//get the elements of the parent for performance
	var childElements = parent.getChildElements();

	//prepare array to save the list of views
	var views = [];
	
	//prepare references in views
	var views0dependencies = 0;
	var lastChild = null;
	parent.forEachChild(function(child, index){
		var numDependencies = 0;
		
		var references = hor? child.getReferencesHor() : child.getReferencesVer();
		for(var n=0; n<references.length; n++){
			var reference = references[n];

			//update p and l references
			if (reference == 'p') {
				reference = parent.id;
			} else if (reference == 'l') {
				if (lastChild) {
					reference = lastChild.id;
				} else {
					reference = '';//parent.id;
				}
			}

			if(reference.length>0){
				if(hor){
					child.dependenciesHor.push(reference);
				}else{
					child.dependenciesVer.push(reference);
				}
				numDependencies++;
			}
		}
		if(numDependencies==0){
			child.orderNum = 0;	
			views0dependencies++;
		}else{
			child.orderNum = -1;
		}

		//add this child, only ui children
		views.push(child);

		//save last child for references
		lastChild = child;
	});
	
	//array of references of views to search them faster
	var indexes = UIViewUtilsInstance.generateIndexes(childElements);
	
	//search dependencies until we have all children with them
	var allViewsSet;
	var numViewsSet;
	do{
		//initialize values
		allViewsSet = true;
		numViewsSet = 0;
		
		//for each view check dependencies
		parent.forEachChild(function(child, index){
			if(child.orderNum==-1){
				var dependencies = hor? child.dependenciesHor : child.dependenciesVer;
				var sumDependencies = 0;
				for(var n=0; n<dependencies.length; n++){
					var orderNum = 0;
					if(indexes[dependencies[n]]!=null){
						orderNum = childElements[indexes[dependencies[n]]].ui.orderNum;
					}
					
					if(orderNum>-1){
						sumDependencies += orderNum + 1; 
					}else{
						sumDependencies = 0;
						break;
					}
				}
				
				//set value
				if(sumDependencies>0){
					child.orderNum = sumDependencies;
					numViewsSet++;
				}else{
					allViewsSet = false;
				}
			}
		});
		
	}while(!allViewsSet && numViewsSet>0);
	
	if(numViewsSet==0 && parent.hasUIChildren() && views0dependencies<childElements.length){
		logE("Check cycle references in " + (hor? "horizontal" : "vertical")  + " for parent " + parent.id);
	}
	
	//sort views after setting order num
	views.sort(function(a, b) {
		return a.orderNum-b.orderNum;
	});
		
	return views;
}

/**
* Load the sizes of all views and translate paddings and margins to dimens
* @param {Array<*>} elements Array of dom nodes to load size
* @param {UIConfiguration} coreConfig
* @param {boolean} forceSizeLoaded
**/
UIPrepare.prototype.loadSizes = function(elements, coreConfig, forceSizeLoaded = false){
	
	for(var i=0; i<elements.length; i++){
		var ele = elements[i];
		var view = ele.ui;
		if(view && view.hasToBeCalculated()){

			//show view if it is not visible
			if (ele.style.display == "none") {
				ele.style.display = "inline-block";
			}

			if(view.hasToBeCalculated() && (forceSizeLoaded || !view.sizeLoaded) ){

				if(view.sizeWidth=='sc' && !view.hasUIChildren()){
					view.widthValue = UIViewUtilsInstance.calculateWidthView(view, ele);
				}
				
				if(view.sizeHeight=='sc' && !view.hasUIChildren()){
					view.heightValue = UIViewUtilsInstance.calculateHeightView(view, ele);
				}
				
				//translate paddings and margins
				view.applyDimens(coreConfig);

				//mark the sizeLoaded flag of this view as true
				view.sizeLoaded = true;
			
			}
			
			this.loadSizes(view.getChildElements(), coreConfig, forceSizeLoaded || !view.sizeLoaded);
		}
		
	}

}

/**
* Load the size of the screenView
* @param {UIView} screen View with screen value (body)
* @return {boolean} flag to know if screen changed
**/
UIPrepare.prototype.loadSizeScreen = function(screen){

	//flag looking for changes
	var sizeChanged = false;

	//get the element
	var ele = screen.element;
	ele.style.position = 'absolute';

	//apply width and height if they are defined
	if(screen.sizeWidth!="sc"){
		
		if(screen.sizeWidth=="s"){
			ele.style.width = screen.widthValue + "px";
		}else if(screen.sizeWidth=="sp"){
			ele.style.width = screen.widthValue + "%";
		}
		
		var offsetWidth = ele.offsetWidth;
		if (offsetWidth != screen.width) {
			screen.width = offsetWidth;
			sizeChanged = true;
		}
	}
	if(screen.sizeHeight!="sc"){
		
		if(screen.sizeHeight=="s"){
			ele.style.height = screen.heightValue + "px";
		}else if(screen.sizeWidth=="sp"){
			ele.style.height = screen.heightValue + "%";
		}
		
		screen.height = ele.offsetHeight;
	}
	ele.style.position = 'relative';
	
	screen.right = screen.width;
	screen.bottom = screen.height;
	
	screen.rightChanged = true;
	screen.leftChanged = true;
	screen.bottomChanged = true;
	screen.topChanged = true;

	//mark size as loaded
	screen.sizeLoaded = true;

	//return the flag
	return sizeChanged;
}

/**
 * Generate a UIView
 * @param {*} element 
 * @param {UIView} parent 
 * @param {UIView} screen 
 * @param {UIConfiguration} config 
 * @return {UIView} generated view
 */
UIPrepare.prototype.generateUIView = function(element, parent, screen, config){
	
	//check if has already ui
	if(element.ui){
		return element.ui;
	}

	//generate an ui if necessary
	if(element.tagName!=null && element.getAttribute(config.attribute)!=null){

		//assign an id if necessary
		if(element.id.length==0){
			element.id = "_aID_" + this.generatedId;
			this.generatedId++;
		}

		//create the view and add it to the list of views
		var view = new UIView(element, parent, screen, config.attribute, config.attributes);
		if (view) {
			//initialize opacity to 0 to show it when it has the position
			element.style.opacity = '0';
		}

		//if it is an image we prepare to refresh when image is loaded
		if(element.tagName!=null && element.tagName.toLowerCase()=="img"){
			element.onload = (function(){
 
				//mark this view for reload
				element.sizeLoaded = false;
				this.refreshFunc();
				
			}).bind(this);
		}

		return view;

	}else{
		return null;
	}
}

/**
 * Generate all UIViews starting from the given element (node)
 * @param {*} element Node element to start to search
 * @param {UIConfiguration} config 
 * @param {Array<UIView>} aScreens Array of screens where all screens generated are returned
 * @param {UIView} parentScreen of this view 
 * @param {*=} parentElement 
 * @return {UIView} generated view
 */
UIPrepare.prototype.generateUIViews = function(element, config, aScreens, parentScreen, parentElement){

	//initialize array of screens if it is necessary
	if(!aScreens){
		aScreens = [];
	}

	//get the parent and the screen
	var parent = null;
	var screen = null;
	if(parentElement==null){
		parentElement = element.parentNode;

		//calculate the lastViewId
		var previousElement = element.previousSibling;
		if(previousElement!=null && previousElement.id){
			lastViewId = previousElement.id
		}
	}
	if(parentElement!=null && parentElement.ui){
		parent = element.parentNode.ui;
		screen = parent.screen? parent.screen : parent;
	}

	//genetate view of this element
	var view = this.generateUIView(element, parent, screen, config);

	//add the view as a screen if there is not parent
	if(view && !parent){

		//calculate the position where to add the screen
		var index = aScreens.length;
		if (parentScreen) {
			index = aScreens.indexOf(parentScreen);
		}

		//add the screen in the selected position
		aScreens.splice(index, 0, view);
		parentScreen = view;

		//set the position as relative because the children will be absolute
		element.style.position = "relative";
	}
	
	//call to all children
	var lastChildId = view? view.id : ""; //start with parent
	for(var i=0; i<element.childNodes.length; i++){
		var childElement = element.childNodes[i];

		var childView = this.generateUIViews(childElement, config, aScreens, parentScreen, element);

		//update the identifier of the last child if it is a ui node
		if(childView){
			lastChildId = childView.id;
		}
	}

	//return the view
	return view;

}

/**
 * Add the received nodes to the UI
 * @param {any} nodesAdded 
 * @param {array<UIView>} screens 
 * @param {UIConfiguration} configuration 
 * @return {number} Count of added nodes
 */
UIPrepare.prototype.addNodes = function(nodesAdded, screens, configuration) {

	//counter to know how many nodes were added
	var countNodesAdded = 0;
	
	//when a node is added we have to check the relationship with the rest of views
	while(nodesAdded.length>0){
		countNodesAdded += 1;
		
		//get first node and remove from list
		var node = nodesAdded[0];
		nodesAdded.splice(0,1);

		//get the previous screen 
		var parentScreen = UIUtilsInstance.getPreviousUIScreen(node);

		//1. Search and add UI elements from this node. Adding newscreens to the list
		this.generateUIViews(node, configuration, screens, parentScreen);

		//get the parent if has one
		var parentElement = node.parentNode;
		if(parentElement && parentElement.ui){
			var parentView = parentElement.ui;

			//2. Order views in parent
			parentView.childrenInOrder = false;

			//3. Check if parent has size content, to mark it as modified
			if(parentView.sizeWidth=='sc' || parentView.sizeHeight=='sc'){
				parentView.cleanSizeLoaded();
			}

		}

	}

	return countNodesAdded;
}

/**
 * Update the received nodes because some childre were removed
 * @param {any} parentNodesRemoved 
 * @param {array<UIView>} screens 
 * @param {UIConfiguration} configuration 
 * @return {number} Count of modified nodes
 */
UIPrepare.prototype.removeNodes = function(parentNodesRemoved) {

	//counter to know how many nodes were added
	var countNodesRemoved = 0;
	
	//when a node is removed we have to check the relationship of the parent
	while(parentNodesRemoved.length>0){
		countNodesRemoved += 1;
		
		//get first node and remove from list
		var parentNode = parentNodesRemoved[0];
		parentNodesRemoved.splice(0,1);

		//search the parent view with UI interface
		var refreshParent = function(node) {

			//check it has UI
			if(node && node.ui){
				var view = node.ui;

				//2. Order views in parent
				view.childrenInOrder = false;

				//3. Check if parent has size content, to mark it as modified
				if(view.sizeWidth=='sc' || view.sizeHeight=='sc'){
					view.cleanSizeLoaded();
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

	return countNodesRemoved;
}

/**
 * Update the received nodes because some childre were removed
 * @param {any} parentNodesRemoved 
 * @param {array<UIView>} screens 
 * @param {UIConfiguration} configuration 
 * @return {number} Count of modified nodes
 */
UIPrepare.prototype.updateNodes = function(nodesUpdated, screens, configuration) {

	//counter to know how many nodes were added
	var countNodesModified = 0;
	
	//when a node is removed we have to check the relationship of the parent
	var nodeIdsUpdated = [];
	while(nodesUpdated.length>0){
		
		//get first node and remove from list
		var node = nodesUpdated[0];
		nodesUpdated.splice(0,1);

		//check this id has not been already updated
		var view = node.ui;
		if (!view || !nodeIdsUpdated.includes(view.id)) {
			countNodesModified += 1;

			//try to generate the UI view
			if (!view) {

				//get the previous screen 
				var parentScreen = UIUtilsInstance.getPreviousUIScreen(node);

				view = this.generateUIViews(node, configuration, screens, parentScreen);
			} else {
				if (node.id != view.id) {
					view.id = node.id;
				}
				view.cleanUI();
				view.readUI(view.element, configuration.attribute, configuration.attributes);
				view.sizeLoaded = false;
				view.childrenInOrder = false;
			}

			//connect view with children
			view.forEachChild( function (child) {
				
				//search if the view was in the list of screens to delete it
				if (child.parent == null) {
					var screenIndex = screens.indexOf(child);
					if (screenIndex > -1) {
						screens.splice(screenIndex, 1);
					}
				}

				//assign the parent
				child.parent = view;

			});
				
			//update parent to re-calculate it
			if (view) {

				//save the id
				nodeIdsUpdated.push(view.id);

				//prepare parent for re-calculations
				var parent = view.parent;
				if (parent) {
					parent.childrenInOrder = false;
					parent.cleanSizeLoaded();
				}
			}
		}
	}

	return countNodesModified;

}