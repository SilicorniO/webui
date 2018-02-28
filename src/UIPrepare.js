
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
* @param parentView View to order the childrens
**/
UIPrepare.prototype.orderViews = function(parentView){
	
	if(!parentView.childrenInOrder){

		//clean dependencies of all views
		for(var i=0; i<parentView.children.length; i++){
			parentView.children[i].dependenciesHor = [];
			parentView.children[i].dependenciesVer = [];
		}

		//then order all the views with parent screen	
		parentView.childrenOrderHor = this.orderViewsSameParent(parentView, true);
		parentView.childrenOrderVer = this.orderViewsSameParent(parentView, false);

		//mark as parent with order
		parentView.childrenInOrder = true;

	}
		
	//for each one, add the view and then its ordered children
	for(var i=0; i<parentView.children.length; i++){
		if(parentView.children[i].children.length>0){
			this.orderViews(parentView.children[i]);
		}
	}
}

/** 
* Order the views received with the dependencies of each view
* @private
* @param parentView Parent view
* @param hor Boolean TRUE for horizontal dependencies, FALSE for vertical dependecies
* @return Array of views from params, in order
**/
UIPrepare.prototype.orderViewsSameParent = function(parentView, hor){
  	
	//clone array of views to not change it
	var views = parentView.children;
	
	//prepare references in views
	var views0dependencies = 0;
	for(var i=0; i<views.length; i++){
		var numDependencies = 0;
		var references = hor? views[i].getReferencesHor() : views[i].getReferencesVer();
		for(var n=0; n<references.length; n++){
			var reference = references[n];
			if(reference.length>0){
				if(hor){
					views[i].dependenciesHor.push(reference);
				}else{
					views[i].dependenciesVer.push(reference);
				}
				numDependencies++;
			}
		}
		if(numDependencies==0){
			views[i].orderNum = 0;	
			views0dependencies++;
		}else{
			views[i].orderNum = -1;
		}
	}
	
	//array of references of views to search them faster
	var indexes = UIViewUtilsInstance.generateIndexes(views);
	
	//search dependencies until we have all children with them
	var allViewsSetted;
	var numViewsSetted;
	do{
		//initialize values
		allViewsSetted = true;
		numViewsSetted = 0;
		
		//for each view check dependencies
		for(var i=0; i<views.length; i++){
			if(views[i].orderNum==-1){
				var dependencies = hor? views[i].dependenciesHor : views[i].dependenciesVer;
				var sumDependencies = 0;
				for(var n=0; n<dependencies.length; n++){
					var orderNum = 0;
					if(indexes[dependencies[n]]!=null){
						orderNum = views[indexes[dependencies[n]]].orderNum;
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
					views[i].orderNum = sumDependencies;
					numViewsSetted++;
				}else{
					allViewsSetted = false;
				}
			}
		}
		
	}while(!allViewsSetted && numViewsSetted>0);
	
	if(numViewsSetted==0 && views.length>0 && views0dependencies<views.length){
		logE("Check cycle references in " + (hor? "horizontal" : "vertical")  + " for parent " + parentView.id);
	}
	
	//sort views after setting order num
	var oViews = views.slice();
	oViews.sort(function(a, b) {
		return a.orderNum-b.orderNum;
	});
		
	return oViews;
}

/**
* Load the sizes of all views and translate paddings and margins to dimens
* @param views Array of views to load size
**/
UIPrepare.prototype.loadSizesSlow = function(views, coreConfig){
	
	for(var i=0; i<views.length; i++){
		var view = views[i];
		var ele = document.getElementById(view.id);
		
		if(!view.sizeLoaded){

			if(view.sizeWidth=='sc' && view.children.length==0){
				view.width = UIViewUtilsInstance.calculateWidthViewSlow(view, ele);
			}
			
			if(view.sizeHeight=='sc' && view.children.length==0){
				view.height = UIViewUtilsInstance.calculateHeightViewSlow(view, ele);
			}
			
			//translate paddings and margins
			view.applyDimens(coreConfig);

			//mark the sizeLoaded flag of this view as true
			view.sizeLoaded = true;
		}
		
		if(view.children.length>0){
			this.loadSizesSlow(view.children, coreConfig);
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
* @param screen View with screen value (body)
* @param ele Element ref
**/
UIPrepare.prototype.loadSizeScreen = function(screen, ele){

	//apply width and height if they are defined
	if(screen.sizeWidth!="sc"){
		
		if(screen.sizeWidth=="s"){
			ele.style.width = screen.width + "px";
		}else if(screen.sizeWidth=="sp"){
			ele.style.width = screen.percentWidth + "%";
		}
		
		screen.width = ele.offsetWidth;
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
* Get a list of children of the parent as views
* @param screenElement Element from HTML
* @param screen
* @param coreConfig configuration of the core
* @return Array with the list of views
**/
UIPrepare.prototype.getChildrenViews = function(screenElement, screen, coreConfig){
		
	//get the children
	var children = this.getChildrenViewsWithParent(screenElement, screen, screen, coreConfig);
	
	//set the flag to false because all events have been added to the images
	this.imgEventsAdded = true;
	
	//return the children
	return children;
}

/**
* Get a list of children of the parent as views
* @param parentElement Element from HTML
* @param {UIView} parent
* @param {UIView} screen
* @param {UIConfiguration} coreConfig with configuration of core
* @return Array with the list of views
**/
UIPrepare.prototype.getChildrenViewsWithParent = function(parentElement, parent, screen, coreConfig){

	var views = new Array();
	var parentId;

	//get child nodes and parent id
	if(parentElement==null){
		parentElement = document.getElementsByTagName("BODY")[0];
        
        //hide scrollbars for body
        parentElement.style.overflow = 'hidden';
        
		parentId = "s";
	}else{
		parentId = parentElement.id;
	}
	
	//read the children
	var childNodes = parentElement.childNodes;
	var lastViewId = parentId;
	for(var i=0; i<childNodes.length; i++){
		var element = childNodes[i];
		var checkingChildren = false;
        if(element.tagName!=null && element.getAttribute(coreConfig.attribute)!=null && element.style.display!='none'){
			
			//assign an id if necessary
			if(element.id.length==0){
				element.id = "_aID_" + this.generatedId;
				this.generatedId++;
			}
			
			//create the view and add it to the list of views
			var view = new UIView(element, parent, screen, lastViewId, coreConfig.attribute, coreConfig.attributes);
			views.push(view);
			
			//save last view for next one
			lastViewId = view.id;
			
			//add views of their children
			if(view.childrenUI){
				view.children = this.getChildrenViewsWithParent(element, view, screen, coreConfig);
				checkingChildren = true;
			}
		}
		
		//when an image is loaded we load the framework again
		if(!this.imgEventsAdded){
			this.addEventImages(element, !checkingChildren);
		}
	}
	
	//return the array of children read
	return views;
}

/**
* Add event onload to all images in the tree
* @param element to check 
* @param applyChildren boolean TRUE for continue all the tree, FALSE just set the onload to the element
**/
UIPrepare.prototype.addEventImages = function(element, applyChildren){
	
	if(element.tagName!=null && element.tagName.toLowerCase()=="img"){
		element.onload = (function(){
			this.refreshFunc();
		}).bind(this);
	}
	
	if(applyChildren){
		var children = element.childNodes;
		for(var i=0; i<children.length; i++){
			this.addEventImages(children[i], true);
		}
	}	
}

UIPrepare.prototype.getAllScreenIds = function(parent, screens, attributeMain){

	//if no parent received it is the first call and we have to get the body
	if(parent == null){
		parent = document.getElementsByTagName("BODY")[0];
	}
	//initialize array of screens if necessary
	if(screens == null){
		screens = [];
	}

	//search for a children with screen values
	var childNodes = parent.childNodes;
	for(var i=0; i<childNodes.length; i++){
		var child = childNodes[i];
		if(child && child.tagName!=null){
			if(child.getAttribute(attributeMain)!=null /*&& child.style.display!='none'*/){
				
				//check if parent had the attribute, else this is a screen
				if(parent.getAttribute(attributeMain)==null){
					
					//assign an id if it does not have one
					if(child.id.length==0){
						child.id = "_aID_" + this.generatedId;
						this.generatedId++;
					}

					//save the identifier of the screen
					screens.push(child.id);

				}
			}

			//search for more screens
			this.getAllScreenIds(child, screens, attributeMain);
		}	
	}

	//return the array of found screens
	return screens;
}
