
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
	var parent = ele.parentElement;
	parent.removeChild(ele);
	infiniteParent.appendChild(ele);
    	
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
	infiniteParent.removeChild(ele)
    parent.insertBefore(ele, parent.children[index]);
    
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
	var parent = ele.parentElement;
	parent.removeChild(ele);
	infiniteParent.appendChild(ele);
    	    
    //get the width height much space
	ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    ele.style.height = 'auto';
	var height = ele.offsetHeight;
    	
    //increment for text calculations error
	if(height>0){
		height++;
	}
    
	infiniteParent.removeChild(ele)
	parent.insertBefore(ele, parent.children[index]);

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
UIViewUtils.prototype.generateIndexes = function(views){
		
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
UIViewUtils.prototype.generateArrayViews = function(view, aViews){
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
	var parentChildren = view.parent.children;
	for(var i=0; i<parentChildren.length; i++){
		var child = parentChildren[i];
		
		if(
			(hor && child.dependenciesHor.includes(viewId)) || 
			(ver && child.dependenciesVer.includes(viewId))
		){
			dependencyViews.push(child);
		}

	}

	//return the list of views with dependencies
	return dependencyViews;

}