
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
	parent.forEachChild(function(child, index){
		var numDependencies = 0;
		var references = hor? child.getReferencesHor() : child.getReferencesVer();
		for(var n=0; n<references.length; n++){
			var reference = references[n];
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
	});
	
	//array of references of views to search them faster
	var indexes = UIViewUtilsInstance.generateIndexes(childElements);
	
	//search dependencies until we have all children with them
	var allViewsSetted;
	var numViewsSetted;
	do{
		//initialize values
		allViewsSetted = true;
		numViewsSetted = 0;
		
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
					numViewsSetted++;
				}else{
					allViewsSetted = false;
				}
			}
		});
		
	}while(!allViewsSetted && numViewsSetted>0);
	
	if(numViewsSetted==0 && parent.hasUIChildren() && views0dependencies<childElements.length){
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
UIPrepare.prototype.loadSizesSlow = function(elements, coreConfig, forceSizeLoaded = false){
	
	for(var i=0; i<elements.length; i++){
		var ele = elements[i];
		var view = ele.ui;
		if(view){
			
			if(forceSizeLoaded || !view.sizeLoaded){

				if(view.sizeWidth=='sc' && !view.hasUIChildren()){
					view.width = UIViewUtilsInstance.calculateWidthViewSlow(view, ele);
				}
				
				if(view.sizeHeight=='sc' && !view.hasUIChildren()){
					view.height = UIViewUtilsInstance.calculateHeightViewSlow(view, ele);
				}
				
				//translate paddings and margins
				view.applyDimens(coreConfig);

				//mark the sizeLoaded flag of this view as true
				view.sizeLoaded = true;
			}
			
			this.loadSizesSlow(view.getChildElements(), coreConfig, forceSizeLoaded || !view.sizeLoaded);
		}
		
	}

}

/**
* Load the sizes of all views and translate paddings and margins to dimens
* @param views Array of views to load size
**/
UIPrepare.prototype.loadSizes = function(views, coreConfig){

	//generate an infinite parent for calculations
	var VIEW_SIZE_LIMIT = 100000;
	var infiniteParent = document.createElement('div');
	infiniteParent.style.display = 'inline-block';
	infiniteParent.style.width = VIEW_SIZE_LIMIT;
	infiniteParent.style.height = VIEW_SIZE_LIMIT;
	infiniteParent.style.backgroundColor = "black";
	infiniteParent.style.zIndex = -1;
	var bodyEle = document.getElementById("screen");
	bodyEle.appendChild(infiniteParent);
	
	var aViews = [];
	for(var i=0; i<views.length; i++){
		aViews.push(views[i]);
	}
	while(aViews.length>0){
		var view = aViews[0];
		aViews.splice(0, 1);
		var ele = document.getElementById(view.id);

		if(!view.sizeLoaded){
		
			if(view.sizeWidth=='sc' && view.children.length==0){
				view.width = UIViewUtilsInstance.calculateWidthView(view, ele, i, infiniteParent);
			}
			
			if(view.sizeHeight=='sc' && view.children.length==0){
				view.height = UIViewUtilsInstance.calculateHeightView(view, ele, i, infiniteParent);
			}
			
			//translate paddings and margins
			view.applyDimens(coreConfig);

			//mark the sizeLoaded flag of this view as true
			view.sizeLoaded = true;
		}
			
		if(view.children.length>0){
			for(var i=0; i<view.children.length; i++){
				aViews.push(view.children[i]);
			}
		}

	}

	//remove infinite parent
	bodyEle.removeChild(infiniteParent);

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

	//apply width and height if they are defined
	if(screen.sizeWidth!="sc"){
		
		if(screen.sizeWidth=="s"){
			ele.style.width = screen.width + "px";
		}else if(screen.sizeWidth=="sp"){
			ele.style.width = screen.percentWidth + "%";
		}
		
		var offsetWidth = ele.offsetWidth;
		if (offsetWidth != screen.width) {
			screen.width = offsetWidth;
			sizeChanged = true;
		}
	}
	if(screen.sizeHeight!="sc"){
		
		if(screen.sizeHeight=="s"){
			ele.style.height = screen.height + "px";
		}else if(screen.sizeWidth=="sp"){
			ele.style.height = screen.percentHeight + "%";
		}
		
		screen.height = ele.offsetHeight;
	}
	
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
* Restore the sizes of the views
* @param view parent view to apply sizes 
* @param viewsSizes Array of sizes
**/
UIPrepare.prototype.restoreSizes = function(view, viewsSizes){
		
	for(var i=0; i<view.children.length && i<viewsSizes.length; i++){
		view.children[i].width = viewsSizes[i].width;
		view.children[i].height = viewsSizes[i].height;
		this.restoreSizes(view.children[i], viewsSizes[i].children);
	}
}

/**
 * Generate a UIView
 * @param {*} element 
 * @param {UIView} parent 
 * @param {UIView} screen 
 * @param {UIConfiguration} config 
 * @param {string=} lastViewId the identifier of the last child added with the same parent, used for attribute 'l'
 * @return {UIView} generated view
 */
UIPrepare.prototype.generateUIView = function(element, parent, screen, config, lastViewId){
	
	//check if has already ui
	if(element.ui){
		return element.ui;
	}

	//generate a ui if necessary
	if(element.tagName!=null && element.getAttribute(config.attribute)!=null){

		//assign an id if necessary
		if(element.id.length==0){
			element.id = "_aID_" + this.generatedId;
			this.generatedId++;
		}

		//create the view and add it to the list of views
		var view = new UIView(element, parent, screen, lastViewId, config.attribute, config.attributes);

		//if it is an image we prepare to refresh when image is loaded
		if(element.tagName!=null && element.tagName.toLowerCase()=="img"){
			element.onload = (function(){
 
				//TODO mark this view for reload
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
 * @param {*=} parentElement 
 * @param {string=} lastViewId 
 * @return {UIView} generated view
 */
UIPrepare.prototype.generateUIViews = function(element, config, aScreens, parentElement, lastViewId){

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
	var view = this.generateUIView(element, parent, screen, config, lastViewId);

	//add the view as a screen if there is not parent
	if(view && !parent){
		aScreens.push(view);

		//set the position as relative because the children will be absolute
		element.style.position = "relative";
	}
	
	//call to all children
	var lastChildId = view? view.id : ""; //start with parent
	for(var i=0; i<element.childNodes.length; i++){
		var childElement = element.childNodes[i];

		var childView = this.generateUIViews(childElement, config, aScreens, element, lastChildId);

		//update the identifier of the last child if it is a ui node
		if(childView){
			lastChildId = childView.id;
		}
	}

	//return the view
	return view;

}