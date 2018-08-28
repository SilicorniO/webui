
/**
 * @constructor
 * @param {Number} scrollWidth 
 */
function UICore(scrollWidth){

	this.scrollWidth = scrollWidth;

}

UICore.prototype.calculateScreen = function(screen){
	
	//generate list of views and indexes for quick access
	var arrayViews = UIViewUtilsInstance.generateArrayViews(screen);
	var indexes = UIViewUtilsInstance.generateIndexes(arrayViews);
    
    var viewsRestored;
	
    do{
        
        //clean array
        viewsRestored = new Array();
        
        //clean all views except the screen
        for(var i=1; i<arrayViews.length; i++){
			arrayViews[i].clean();
        }

		//calculate views
		this.calculateViewsHor(screen.childrenOrderHor, screen, arrayViews, indexes, screen.width, viewsRestored);
		this.calculateViewsVer(screen.childrenOrderVer, screen, arrayViews, indexes, screen.height, viewsRestored);
        
    }while(viewsRestored.length>0);
}

UICore.prototype.calculateViewsHor = function(views, parentView, arrayViews, indexes, width, viewsRestored){
	for(var i=0; i<views.length; i++){
		if (views[i].hasToBeCalculated()) {
			this.calculateViewHor(views[i], parentView, arrayViews, indexes, width, viewsRestored);
		}
	}
}

UICore.prototype.calculateViewHor = function(view, parentView, arrayViews, indexes, width, viewsRestored){
		
	//eval references to try to calculate the width
	var numDependencies = 0;
	var references = view.getReferencesHor();
	for(var n=0; n<references.length; n++){
		var dependency = this.calculateViewDependency(view, references[n], parentView);
		if(dependency.length>0){
			this.evalDependenceHor(view, parentView, width, n, arrayViews[indexes[dependency]]);
			numDependencies += 1;
		}
	}

	//set left parent if there is not horizontal dependencies
	if (numDependencies == 0 && view.gravityHor != 'c') {
		view.left = 0;
		view.leftChanged = true;
	}
	
	//calculate width
	if(view.sizeWidth=='s'){
		
		//fixed width
		this.applyFixedSizeHor(view);
	
	}else if(view.sizeWidth=='sp'){
		
		//apply percent
		this.applyPercentHor(view, parentView, width);		
		
	}
	
	//apply margins to left and right
	this.assignMarginsHor(view);
			
	//calculate width if it is possible
	if(view.leftChanged && view.rightChanged){
		
		//calculate the width
		this.assignSizeHor(view, width);
		
		//check gravity
		this.assignGravityHor(view, width);
	
		//if there are children we eval them with width restrictions
		if(view.childrenOrderHor.length>0){
			
			//calculate the real width with padding
			var viewWidth = view.scrollHorizontal? 0 : view.width - view.paddingLeft - view.paddingRight;
			this.calculateViewsHor(view.childrenOrderHor, view, arrayViews, indexes, viewWidth, viewsRestored);
			
			//move left and right of all children using the paddingLeft
			this.applyPaddingChildrenHor(view);
			
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the width of the parent
		if(view.childrenOrderHor.length>0){
			
			//calculate the real width with padding
			var viewWidth = 0;//view.scrollHorizontal? 0 : width;
			this.calculateViewsHor(view.childrenOrderHor, view, arrayViews, indexes, viewWidth, viewsRestored);
			
			//move left and right of all children using the paddingLeft
			this.applyPaddingChildrenHor(view);
			
			//set the width of the children
			this.applySizeChildrenHor(view, arrayViews, indexes, viewsRestored);
			
		}else{
			//else if there are not children we calculate the content size
			this.applySizeContentHor(view);
			
		}
		
		//calculate the width
		this.assignSizeHor(view, width);
						
		//check gravity
		this.assignGravityHor(view, width);
				
	}
	
	//check if size of children if bigger than container to add vertical scroll
	if(this.applyScrollHor(view, width)){
                
        //apply the padding of the scroll to the element
        view.paddingBottom += this.scrollWidth;
        view.scrollHorizontalApplied = true;
        
        //save the view as one to recalculate
        viewsRestored.push(view);
    }
}

UICore.prototype.calculateViewsVer = function(views, parentView, arrayViews, indexes, height, viewsRestored){
	for(var i=0; i<views.length; i++){
		if (views[i].hasToBeCalculated()) {
			this.calculateViewVer(views[i], parentView, arrayViews, indexes, height, viewsRestored);
		}
	}
}

UICore.prototype.calculateViewVer = function(view, parentView, arrayViews, indexes, height, viewsRestored){
    
	//eval references to try to calculate the height
	var numDependencies = 0;
	var references = view.getReferencesVer();
	for(var n=0; n<references.length; n++){
		var dependency = this.calculateViewDependency(view, references[n], parentView);
		if(dependency.length>0){
			this.evalDependenceVer(view, parentView, height, n, arrayViews[indexes[dependency]]);
			numDependencies += 1;
		}
	}

	//set top parent if there is not vertical dependencies
	if (numDependencies == 0 && view.gravityVer != 'c') {
		view.top = 0;
		view.topChanged = true;
	}
	
	//calculate height
	if(view.sizeHeight=='s'){
		
		//fixed height
		this.applyFixedSizeVer(view);
	
	}else if(view.sizeHeight=='sp'){
		
		//apply percent
		this.applyPercentVer(view, parentView, height);		
		
	}
	
	//apply margins to top and bottom
	this.assignMarginsVer(view);
			
	//calculate width if it is possible
	if(view.topChanged && view.bottomChanged){
		
		//calculate the height
		this.assignSizeVer(view, height);
		
		//check gravity
		this.assignGravityVer(view, height);
	
		//if there are children we eval them with width restrictions
		if(view.childrenOrderVer.length>0){
			
			//calculate the real height with padding
			var viewHeight = view.scrollVertical? 0 : view.height - view.paddingTop - view.paddingBottom;
			this.calculateViewsVer(view.childrenOrderVer, view, arrayViews, indexes, viewHeight, viewsRestored);
			
			//move top and bottom of all children using the paddingTop
			this.applyPaddingChildrenVer(view);
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the height of the parent
		if(view.childrenOrderVer.length>0){
			
			//calculate the real height with padding
			var viewHeight = view.scrollVertical? 0 : height;
			
			//calculate the children height
            this.calculateViewsVer(view.childrenOrderVer, view, arrayViews, indexes, 0, viewsRestored);
			
			//move top and bottom of all children using the paddingTop
			this.applyPaddingChildrenVer(view);
			
			//set the width of the children
			this.applySizeChildrenVer(view, arrayViews, indexes, viewsRestored);
			
		}else{
			//else if there are not children we calculate the content size
			this.applySizeContentVer(view);
			
		}
		
		//calculate the width
		this.assignSizeVer(view, height);
		
		//check gravity
		this.assignGravityVer(view, height);
	}
			
	//check if size of children if bigger than container to add vertical scroll
	if(this.applyScrollVer(view, height)){
                
        //apply the padding of the scroll to the element
        view.paddingRight += this.scrollWidth;
        view.scrollVerticalApplied = true;
        
        //save the view as one to recalculate
        viewsRestored.push(view);
    }
}

UICore.prototype.assignSizeHor = function(view, width){

	//if parent has size we force the space to the parent
	if (width > 0) {
		if(view.right>width){
			view.right = width;	
		}
		if(view.left<0) {
			view.left = 0;
		}
	}
	view.width = view.right - view.left;
}

UICore.prototype.assignSizeVer = function(view, height){

	//if parent has size we force the space to the parent
	if (height > 0) {
		if (view.bottom>height){
			view.bottom = height;
		}
		if (view.top < 0) {
			view.top = 0;
		}
	}
	view.height = view.bottom - view.top;
}

UICore.prototype.applyFixedSizeHor = function(view){
	//set left and top if they are not setted
	if(view.rightChanged){
		view.left = view.right - view.widthValue;
		view.leftChanged = true;
	}else{
		view.right = view.left + view.widthValue;
		view.leftChanged = true;
		view.rightChanged = true;
	}
}

UICore.prototype.applyFixedSizeVer = function(view){
	//set bottom and top if they are not setted
	if(view.bottomChanged){
		view.top = view.bottom - view.heightValue;
		view.topChanged = true;
	}else{
		view.bottom = view.top + view.heightValue;
		view.topChanged = true;
		view.bottomChanged = true;
	}
}

/**
* Add the padding of the view to all its children
* @param view parent
**/
UICore.prototype.applyPaddingChildrenHor = function(view){
	if(view.paddingLeft!=0){
		view.forEachChild(function(child, index){
			child.left += view.paddingLeft;
			child.right += view.paddingLeft;
		});
	}
}

/**
* Add the padding of the view to all its children
* @param view parent
**/
UICore.prototype.applyPaddingChildrenVer = function(view){
	if(view.paddingTop!=0){
		view.forEachChild(function(child, index){
			child.top += view.paddingTop;
			child.bottom += view.paddingTop;
		});
	}
}

/**
* Apply scroll to the view if their children are widther than parent
* @param view View parent
**/
UICore.prototype.applyScrollHor = function(view, width){
	if(view.scrollHorizontal){
		var maxX = 0;
		view.forEachChild(function(child, index){
			if(child.right>maxX){
				maxX = child.right;
			}
		});
		if(maxX>width + view.paddingLeft){
            
            //check it here and not before because in the future we could change this state to not scroll without recalculate everything
            if(!view.scrollHorizontalApplied){
                //apply style to show horizontal scroll
                var element = document.getElementById(view.id);
                element.style.overflowX = "auto";

                //recalculate all the children
                return true;
            }
		}
	}
    
    //not applied
    return false;
}

/**
* Apply scroll to the view if their children are taller than parent
* @param view View parent
**/
UICore.prototype.applyScrollVer = function(view, height){
	if(view.scrollVertical){
		var maxY = 0;
		view.forEachChild(function(child, index){
			if(child.bottom>maxY){
				maxY = child.bottom;
			}
		});
		if(view.sizeHeight!='sc' || (maxY>height+view.paddingTop)){
            
            //check it here and not before because in the future we could change this state to not scroll without recalculate everything
            if(!view.scrollVerticalApplied){
                //apply style to show vertical scroll
                var element = document.getElementById(view.id);
                element.style.overflowY = "auto";

                //recalculate all the children
                return true;
            }
		}
	}
    
    //not applied
    return false;
}

/**
* Calculate the left and right values with the content
* @param view View to set size with content
**/
UICore.prototype.applySizeContentHor = function(view){
		
	//if the size depends of children, calculate the position of children
	if(view.rightChanged){
		view.left = view.right - view.widthValue;
		view.leftChanged = true;
	
	}else if (view.leftChanged) {
		view.right = view.left + view.widthValue;
		view.rightChanged = true;
		view.leftChanged = true;

	}
}

/**
* Calculate the left and right values with the content
* @param view View to set size with content
**/
UICore.prototype.applySizeContentVer = function(view){
	
	//if the size depends of children, calculate the position of children
	if(view.bottomChanged){
		view.top = view.bottom - view.heightValue;
		view.topChanged = true;
	
	} else if (view.topChanged) {
		
		var ele = view.element;
		ele.style.width = view.width + 'px';
		view.heightValue = ele.offsetHeight;
		
		view.bottom = view.top + view.heightValue;		
		view.bottomChanged = true;
	
	} else if (view.gravityVer == 'c') {
		var ele = view.element;
		ele.style.width = view.width + 'px';
		view.heightValue = ele.offsetHeight;
	}
}

/**
* Calculate the left or the right with the size of the children if the sizeWidth is "sc"
* @param view View to set the size
**/
UICore.prototype.applySizeChildrenHor = function(view, arrayViews, indexes, viewsRestored){
	
	var minX = 0;
	var maxX = 0;
	view.forEachChild(function(child, index){
		if (child.width > 0) {
			if(child.right > maxX) {
				maxX = child.right;
			} else if(child.left < minX) {
				minX = child.left;
			}
		}
	});
	var widthChildren = maxX - minX;

	//if no size it is becase there is any child with fixed size, so we get the bigger child
	if (widthChildren == 0) {
		view.forEachChild(function(child){
			if(child.widthValue > widthChildren){
				widthChildren = child.widthValue;
			}
		});
	} else if (minX < 0) {
		//move all the children to positive values
		view.forEachChild(function(child){
			if (child.leftChanged && child.rightChanged && child.width > 0) {
				child.left += -minX;
				child.right += -minX;
			}
		});
	}

	if(view.rightChanged){
		view.left = view.right - widthChildren - view.paddingLeft;
		view.leftChanged = true;
	}else{
		view.right = view.left + widthChildren + view.paddingRight;
		view.rightChanged = true;
		view.leftChanged = true;
	}
	view.width = view.right - view.left;
	
	//apply width of children if they were waiting to have the parent size
	//this is used for r:p and parent has no size defined
	view.forEachChild((child) => {
		if (!child.leftChanged || !child.rightChanged || child.width<=0) {
			child.cleanHor();
			this.calculateViewHor(child, view, arrayViews, indexes, widthChildren, viewsRestored);
		}
	});

}

/**
* Calculate the top or the bottom with the size of the children if the sizeWidth is "sc"
* @param view View to set the size
**/
UICore.prototype.applySizeChildrenVer = function(view, arrayViews, indexes, viewsRestored){
	
	var minY = 0;
	var maxY = 0;
	view.forEachChild(function(child){
		if (child.height > 0) {
			if(child.bottom > maxY) {
				maxY = child.bottom;
			} else if(child.top < minY) {
				minY = child.top;
			}
		}
	});
	var heightChildren = maxY - minY;

	//if no size it is becase there is any child with fixed size, so we get the bigger child
	if (heightChildren == 0) {
		view.forEachChild(function(child){
			if(child.heightValue > heightChildren){
				heightChildren = child.heightValue;
			}
		});
	} else if (minY < 0) {
		//move all the children to positive values
		view.forEachChild(function(child){
			if (child.topChanged && child.bottomChanged && child.height > 0) {
				child.left += -minY;
				child.right += -minY;
			}
		});
	}

	if(view.bottomChanged){
		view.top = view.bottom - heightChildren - view.paddingTop;
		view.topChanged = true;
	}else{
		view.bottom = view.top + heightChildren + view.paddingBottom;
		view.bottomChanged = true;
	}
	view.height = view.bottom - view.top;
	
	//apply height of children if they were waiting to have the parent size
	//this is used for b:p and parent has no size defined
	//and gv:c or gv:b
	view.forEachChild((child) => {
		if (!child.topChanged || !child.bottomChanged || child.height<=0) {
			child.cleanVer();
			this.calculateViewVer(child, view, arrayViews, indexes, heightChildren, viewsRestored);
		}
	});
			
}

/**
* Apply percent to a view with a width setted
* @param view View to set percent
* @param parentView View of the parent to know its size
* @param width width to apply if right was not applied
**/
UICore.prototype.applyPercentHor = function(view, parentView, width){
	
	if(view.rightChanged && !view.leftChanged){
		view.left = view.right - ((parentView.width * view.widthValue) / 100);
	}else{
		view.right = view.left + ((parentView.width * view.widthValue) / 100);
	}

	//move the percent if necessary
	if(view.percentWidthPos>0){
		var percentWidth = (view.right-view.left) * (view.percentWidthPos);
		view.left += percentWidth;
		view.right += percentWidth;
	}

	//mark left and right as changed
	view.rightChanged = true;
	view.leftChanged = true;
}

/**
* Apply percent to a view with a width setted
* @param view View to set percent
* @param parentView View of the parent to know its size
* @param height height to apply if top was not applied
**/
UICore.prototype.applyPercentVer = function(view, parentView, height){
	
	if(view.bottomChanged && !view.topChanged){
		view.top = view.bottom - ((parentView.height * view.heightValue) / 100);
	}else{
		view.bottom = view.top + ((parentView.height * view.heightValue) / 100);
	}
	

	//move the percent if necessary
	if(view.percentHeightPos>0){
		var percentHeight = (view.bottom-view.top) * (view.percentHeightPos);
		view.top += percentHeight;
		view.bottom += percentHeight;
	}

	//masrk right and left as changed
	view.bottomChanged = true;
	view.topChanged = true;
}

/**
* Assign gravity values to the view
* @param view View to get and change values
* @param width int
**/
UICore.prototype.assignGravityHor = function(view, width){
	
	//horizontal
	if(view.gravityHor!='n'){
		if(view.gravityHor=='l'){
			view.left = 0;
			view.leftChanged = true;
		}else if(view.gravityHor=='r' && width > 0){
			view.right = width;
			view.left = view.right - view.width;
		}else if(view.gravityHor=='c' && width > 0){
			var viewWidth = view.width > 0 ? view.width : view.widthValue;
			view.left = Math.max(0, (width - viewWidth) / 2);
			view.right = Math.min(width, view.left + viewWidth);
			view.leftChanged = true;
			view.rightChanged = true;
			view.width = view.right - view.left;
		}
	}
	
}

/**
* Assign gravity values to the view
* @param view View to get and change values
* @param height int
**/
UICore.prototype.assignGravityVer = function(view, height){
	
	//horizontal
	if(view.gravityVer!='n'){
		if(view.gravityVer=='t'){
			view.top = 0;
			view.topChanged = true;
		}else if(view.gravityVer=='b' && height > 0){
			view.bottom = height;
			view.top = view.bottom - view.height;
		}else if(view.gravityVer=='c' && height > 0){
			var viewHeight = view.height > 0 ? view.height : view.heightValue;
			view.top = Math.max(0, (height - viewHeight) / 2);
			view.bottom = Math.min(height, view.top + viewHeight);
			view.topChanged = true;
			view.bottomChanged = true;
			view.height = view.bottom - view.top;
		}
	}
	
}

/**
* Assign margin values to the view
* @param view View to get and change values
**/
UICore.prototype.assignMarginsHor = function(view){
	
	//get real margin values
	var viewMarginLeft = view.marginLeft;
	var viewMarginRight = view.marginRight;
		
	if(viewMarginLeft!=0 && view.leftChanged){
		view.left += viewMarginLeft;
		if(!view.rightChanged || view.sizeWidth=='s'){
			view.right += viewMarginLeft;
		}
	}
	if(viewMarginRight!=0 && view.rightChanged){
		view.right -= viewMarginRight;
		if(!view.leftChanged || view.sizeWidth=='s'){
			view.left -= viewMarginRight;
		}
	}
}

/**
* Assign margin values to the view
* @param view View to get and change values
**/
UICore.prototype.assignMarginsVer = function(view){
	
	//save margin to apply to their children
	var viewMarginTop = view.marginTop;
	var viewMarginBottom = view.marginBottom;
	
	if(view.marginTop!=0 && view.topChanged){
		view.top += viewMarginTop;
		if(!view.bottomChanged || view.sizeHeight=='s'){
			view.bottom += viewMarginTop;
		}
	}
	if(view.marginBottom!=0 && view.bottomChanged){
		view.bottom -= viewMarginBottom;
		if(!view.topChanged || view.sizeHeight=='s'){
			view.top -= viewMarginBottom;
		}
	}
}


/**
* Set left, top, right, bottom values for the reference received
* @param view to set the values
* @param parentView to check and get values
* @param iReference index of reference to evaluate
* @param viewDependency from wich get the value
**/
UICore.prototype.evalDependenceHor = function(view, parentView, width, iReference, viewDependency){
	
	if(viewDependency==null){
		logE("The view '" + view.id + "' has a wrong reference");
		return;
	}
	
	switch(iReference){
	case 0: //leftLeft
		if(parentView!=viewDependency){
			view.left = viewDependency.left;
		}
		view.leftChanged = true;
		break;
	case 1: //leftRight
		view.left = viewDependency.rightChanged? viewDependency.right : viewDependency.left + viewDependency.width; 
		view.leftChanged = true;
		break;
	case 2: //rightRight
		if(parentView==viewDependency){
			if(parentView.rightChanged){
				view.right = width;
			}else{
				view.right = 0;
				break;
			}
		}else{
			view.right = viewDependency.rightChanged? viewDependency.right : viewDependency.left + viewDependency.width;
		}
		view.rightChanged = true;
		break;
	case 3: //rightLeft
		view.right = viewDependency.left;
		view.rightChanged = true;
		break;
	}
	
}

/**
* Set left, top, right, bottom values for the reference received
* @param view to set the values
* @param parentView to check and get values
* @param iReference index of reference to evaluate
* @param viewDependency from wich get the value
**/
UICore.prototype.evalDependenceVer = function(view, parentView, height, iReference, viewDependency){
	
	if(viewDependency==null){
		logE("The view '" + view.id + "' has a wrong reference");
		return;
	}
	
	switch(iReference){
	case 0: //topTop
		if(parentView!=viewDependency){
			view.top = viewDependency.top;
		}
		view.topChanged = true;
		break;
	case 1: //topBottom
		view.top = viewDependency.bottomChanged? viewDependency.bottom : viewDependency.top + viewDependency.height;
		view.topChanged = true;
		break;
	
	case 2: //bottomBottom
		if(parentView==viewDependency){
			if(parentView.bottomChanged){
				view.bottom = height;
			}else{
				view.bottom = 0;
				break;
			}
		}else{
			view.bottom = viewDependency.bottomChanged? viewDependency.bottom : viewDependency.top + viewDependency.height;
		}
		view.bottomChanged = true;
		break;
	case 3: //bottomTop
		view.bottom = viewDependency.top;
		view.bottomChanged = true;
		break;
	}
	
}

UICore.prototype.calculateViewDependency = function(view, viewDependency, parentView) {
	
	//replace parent or last viewDependency
	if (viewDependency == 'p') {
		return parentView.id;
	} else if (viewDependency == 'l') {

		//get previous view and check is null to set as parent
		var previousView = view.getPreviousView();
		if (previousView == null) {
			return '';//parentView.id;
		} else {
			return previousView.id;
		}
	} else {
		return viewDependency;
	}

}