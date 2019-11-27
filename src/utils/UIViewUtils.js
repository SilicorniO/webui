
/** 
 * @constructor
*/
function UIViewUtils(){

}

/**
* Update the width of the view received
* @param view UIView to change the height
* @param ele DOM element to calculate the width
* @return width calculated
**/
UIViewUtils.prototype.calculateWidthView = function(view, ele, index, infiniteParent){
	
	//prepare parent to give the son a lot of space for calculation
	// var parent = ele.parentElement;
    // var parentWidth = parent.offsetWidth;
    // var parentScrollLeft = parent.scrollLeft;
	// parent.style.width = 10000;
    	
	//get the height width much space
	ele.style.position = 'fixed';
	// ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    // ele.style.height = 'auto';
	var width = ele.offsetWidth;
	
    //increment for text calculations error
	if(width>0){
		width++;
	}
    
    //set values of parent back 
    // parent.style.width = parentWidth;
	// parent.scrollLeft = parentScrollLeft;
	
	return width;
}

/**
* Update the height of the view received
* @param view UIView to change the height
* @param ele DOM element to calculate the height
* @return height calculated
**/
UIViewUtils.prototype.calculateHeightView = function(view, ele, index, infiniteParent){
        
    //prepare parent to give the son a lot of space for calculation
	// var parent = ele.parentElement;
    // var parentHeight = parent.offsetHeight;
    // var parentScrollTop = parent.scrollTop;
    // parent.style.height = 10000;
    	    
	//get the width height much space
	ele.style.position = 'fixed';
	// ele.style.display = 'inline-block';
    // ele.style.width = 'auto';
    ele.style.height = 'auto';
	var height = ele.offsetHeight;
    	
    //increment for text calculations error
	if(height>0){
		height++;
	}
    
    //set values of parent back 
    // parent.style.height = parentHeight;
	// parent.scrollTop = parentScrollTop;

	return height;
}

/**
* Update the width of the view received
* @param view View to change the height
* @param ele DOM element to calculate the width
**/
UIViewUtils.prototype.calculateWidthViewSlow = function(view, ele){
			
	//prepare parent to give the son a lot of space for calculation
	var parent = ele.parentElement;
    var parentWidth = parent.offsetWidth;
    var parentScrollLeft = parent.scrollLeft;
	parent.style.width = 10000;
    	
	//get the height width much space
	ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    ele.style.height = 'auto';
	var width = ele.offsetWidth;
	
    //increment for text calculations error
	if(width>0){
		width++;
	}
    
    //set values of parent back 
    parent.style.width = parentWidth;
	parent.scrollLeft = parentScrollLeft;
	
	return width;
}

/**
* Update the height of the view received
* @param view View to change the height
* @param ele DOM element to calculate the height
**/
UIViewUtils.prototype.calculateHeightViewSlow = function(view, ele){
        
    //prepare parent to give the son a lot of space for calculation
	var parent = ele.parentElement;
    var parentHeight = parent.offsetHeight;
    var parentScrollTop = parent.scrollTop;
    parent.style.height = 10000;
    	    
    //get the width height much space
	ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    ele.style.height = 'auto';
	var height = ele.offsetHeight;
    	
    //increment for text calculations error
	if(height>0){
		height++;
	}
    
    //set values of parent back 
    parent.style.height = parentHeight;
	parent.scrollTop = parentScrollTop;

	return height;
}

//generate list of indexes
UIViewUtils.prototype.generateIndexes = function(elements){
		
	var indexes = new Array();
		
	for(var i=0; i<elements.length; i++){
		if(elements[i].id){
			indexes[elements[i].id] = i;
		}
	}
	
	return indexes;
}

/**
* Generate an array of views from one parent view
* @param {UIView} view View to read, recursive by children
* @param {Array<UIView>=} aViews Array of views used to add view
* @return {Array<UIView>} array of views
**/
UIViewUtils.prototype.generateArrayViews = function(view, aViews){
	
	if(aViews==null){
		aViews = new Array();
	}
	
	//add the view
	aViews.push(view);
	
	//add the children
	view.forEachChild((function(child, index){
		this.generateArrayViews(child, aViews);
	}).bind(this));
	
	return aViews;
}

/**
 * Search views wich have the given view as dependency. 
 * Only search in same parent views
 * @param {UIView} view UIView reference
 * @param {boolean} hor TRUE for searching horizontal dependency
 * @param {boolean} ver TRUE for searching vertical dependency
 * @return {Array<UIView>} Array of views with dependency of the given view
 */
UIViewUtils.prototype.getViewsWithDependencyForView = function(view, hor, ver){

	//generate the array with the views to return
	var dependencyViews = [];

	//check has parent, else we return empty array
	if(!view.parent){
		return dependencyViews;
	}

	//get the views of the parent
	var viewId = view.id;
	view.parent.forEachChild(function(parentChild, index){
		
		if(
			(hor && parentChild.dependenciesHor.includes(viewId)) || 
			(ver && parentChild.dependenciesVer.includes(viewId))
		){
			dependencyViews.push(parentChild);
		}

	});

	//return the list of views with dependencies
	return dependencyViews;

}

export default UIViewUtils = new UIViewUtils()