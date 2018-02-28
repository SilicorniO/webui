
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

//generate list of indexes
UIPrepare.prototype.generateIndexes = function(views){
		
	var indexes = new Array();
		
	for(var i=0; i<views.length; i++){
		indexes[views[i].id] = i;
	}
	
	return indexes;
}

/**
* Generate an array of views from one parent view
* @param view View to read, recursive by children
**/
UIPrepare.prototype.generateArrayViews = function(view, aViews){
	if(aViews==null){
		aViews = new Array();
	}
	
	//add the view
	aViews.push(view);
	
	//add the children
	for(var i=0; i<view.children.length; i++){
		this.generateArrayViews(view.children[i], aViews);
	}
	
	return aViews;
}

/**
* Order the children of the parent view received
* @param parentView View to order the childrens
**/
UIPrepare.prototype.orderViews = function(parentView){
						
	//then order all the views with parent screen	
	parentView.childrenOrderHor = this.orderViewsSameParent(parentView.children, true);
	parentView.childrenOrderVer = this.orderViewsSameParent(parentView.children, false);
		
	//for each one, add the view and then its ordered children
	for(var i=0; i<parentView.children.length; i++){
		if(parentView.children[i].children.length>0){
			this.orderViews(parentView.children[i]);
		}
	}
				
}

/** 
* Order the views received with the dependencies of each view
* @param views Array of views
* @param hor Boolean TRUE for horizontal dependencies, FALSE for vertical dependecies
* @return Array of views from params, in order
**/
UIPrepare.prototype.orderViewsSameParent = function(views, hor){
  	
	//clonea array of views to not change it
	var oViews = views.slice();
	
	//prepare references in views
	var views0dependencies = 0;
	for(var i=0; i<oViews.length; i++){
		var dependencies = new Array();
		var references = hor? oViews[i].getReferencesHor() : oViews[i].getReferencesVer();
		for(var n=0; n<references.length; n++){
			var reference = references[n];
			if(reference.length>0){
				dependencies.push(reference);
			}
		}
		oViews[i].dependencies = dependencies;
		if(dependencies.length==0){
			oViews[i].orderNum = 0;	
			views0dependencies++;
		}else{
			oViews[i].orderNum = -1;
		}
	}
	
	//array of references of oViews to search them faster
	var indexes = this.generateIndexes(oViews);
	
	//search dependencies until we have all children with them
	var allViewsSetted;
	var numViewsSetted;
	do{
		//initialize values
		allViewsSetted = true;
		numViewsSetted = 0;
		
		//for each view check dependencies
		for(var i=0; i<oViews.length; i++){
			if(oViews[i].orderNum==-1){
				var dependencies = oViews[i].dependencies;
				var sumDependencies = 0;
				for(var n=0; n<dependencies.length; n++){
					var orderNum = 0;
					if(indexes[dependencies[n]]!=null){
						orderNum = oViews[indexes[dependencies[n]]].orderNum;
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
					oViews[i].orderNum = sumDependencies;
					numViewsSetted++;
				}else{
					allViewsSetted = false;
				}
			}
		}
		
	}while(!allViewsSetted && numViewsSetted>0);
	
	if(numViewsSetted==0 && oViews.length>0 && views0dependencies<oViews.length){
		logE("Check cycle references in " + (hor? "horizontal" : "vertical")  + " for parent " + oViews[0].parentId);
	}
	
	//sort oViews after setting order num
	oViews.sort(function(a, b) {
		return a.orderNum-b.orderNum;
	});
		
	return oViews;
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
	document.getElementsByTagName("BODY")[0].appendChild(infiniteParent);
	
	for(var i=0; i<views.length; i++){
		var view = views[i];
		var ele = document.getElementById(view.id);
		
		if(view.sizeWidth=='sc' && view.children.length==0){
			view.width = UIViewUtilsInstance.calculateWidthView(view, ele, infiniteParent);
		}
		
		if(view.sizeHeight=='sc' && view.children.length==0){
			view.height = UIViewUtilsInstance.calculateHeightView(view, ele, infiniteParent);
		}
		
		//translate paddings and margins
		view.applyDimens(coreConfig);
		
		if(view.children.length>0){
			this.loadSizes(view.children, coreConfig);
		}
	}

	//remove infinite parent
	document.getElementsByTagName("BODY")[0].removeChild(infiniteParent);

}

/**
* Load the size of the screenView
* @param screenView View with screen value (body)
* @param ele Element ref
**/
UIPrepare.prototype.loadSizeScreen = function(screenView, ele){

	//apply width and height if they are defined
	if(screenView.sizeWidth!="sc"){
		
		if(screenView.sizeWidth=="s"){
			ele.style.width = screenView.width + "px";
		}else if(screenView.sizeWidth=="sp"){
			ele.style.width = screenView.percentWidth + "%";
		}
		
		screenView.width = ele.offsetWidth;
	}
	if(screenView.sizeHeight!="sc"){
		
		if(screenView.sizeHeight=="s"){
			ele.style.height = screenView.height + "px";
		}else if(screenView.sizeWidth=="sp"){
			ele.style.height = screenView.percentHeight + "%";
		}
		
		screenView.height = ele.offsetHeight;
	}
	/*
	screenView.width = ele.offsetWidth>0? ele.offsetWidth : window.innerWidth;
	screenView.height = ele.offsetHeight>0? ele.offsetHeight : window.innerHeight;
	*/
	screenView.right = screenView.width;
	screenView.bottom = screenView.height;
	
	screenView.rightChanged = true;
	screenView.leftChanged = true;
	screenView.bottomChanged = true;
	screenView.topChanged = true;
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
* @param parentId String name of the parent
* @param parent Element from HTML
* @param coreConfig configuration of the core
* @return Array with the list of views
**/
UIPrepare.prototype.getChildrenViews = function(parentId, parent, coreConfig){
		
	//get the children
	var children = this.getChildrenViewsWithParentId(parentId, parent, coreConfig);
	
	//set the flag to false because all events have been added to the images
	this.imgEventsAdded = true;
	
	//return the children
	return children;
}

/**
* Get a list of children of the parent as views
* @param parentId String identifier of the parent, can be null
* @param parent Element from HTML
* @param coreConfig CoreConfig with configuration of core
* @return Array with the list of views
**/
UIPrepare.prototype.getChildrenViewsWithParentId = function(parentId, parent, coreConfig){

	var views = new Array();

	//get child nodes and parent id
	if(parent==null){
		parent = document.getElementsByTagName("BODY")[0];
        
        //hide scrollbars for body
        parent.style.overflow = 'hidden';
        
		parentId = "s";
	}else{
		parentId = parent.id;
	}
	
	//read the children
	var childNodes = parent.childNodes;
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
			var view = new UIView(element, parentId, lastViewId, coreConfig.attribute, coreConfig.attributes);
			views.push(view);
			
			//save last view for next one
			lastViewId = view.id;
			
			//add views of their children
			if(view.childrenUI){
				view.children = this.getChildrenViewsWithParentId(parentId, element, coreConfig);
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

UIPrepare.prototype.getAllScreens = function(parent, screens, attributeMain){

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
			this.getAllScreens(child, screens, attributeMain);
		}	
	}

	//return the array of found screens
	return screens;
}
