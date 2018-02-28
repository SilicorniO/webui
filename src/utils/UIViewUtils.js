
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