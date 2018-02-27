

function UIViewUtils(){

}

/**
* Update the width of the view received
* @param view UIView to change the height
* @param ele DOM element to calculate the width
* @return width calculated
**/
UIViewUtils.prototype.calculateWidthView = function(view, ele, infiniteParent){
	
	//prepare parent to give the son a lot of space for calculation
	var parent = ele.parentElement;
	parent.removeChild(ele);
	infiniteParent.appendChild(ele);
    // var parentWidth = parent.offsetWidth;
    // var parentScrollLeft = parent.scrollLeft;
    // parent.style.width = VIEW_SIZE_LIMIT;
    	
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
    // parent.style.width = parentWidth;
	// parent.scrollLeft = parentScrollLeft;
	infiniteParent.removeChild(ele)
    parent.appendChild(ele);
    
    return width;
}

/**
* Update the height of the view received
* @param view UIView to change the height
* @param ele DOM element to calculate the height
* @return height calculated
**/
UIViewUtils.prototype.calculateHeightView = function(view, ele, infiniteParent){
        
    //prepare parent to give the son a lot of space for calculation
	var parent = ele.parentElement;
	parent.removeChild(ele);
	infiniteParent.appendChild(ele);
    // var parentHeight = parent.offsetHeight;
    // var parentScrollTop = parent.scrollTop;
    // parent.style.height = VIEW_SIZE_LIMIT;
    	    
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
    // parent.style.height = parentHeight;
	// parent.scrollTop = parentScrollTop;
	infiniteParent.removeChild(ele)
	parent.appendChild(ele);

	return height;
}