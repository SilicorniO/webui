
/**
 * @constructor
 * @param {UIConfiguration} coreConfig 
 * @param {Number} scrollWidth 
 */
function UICore(coreConfig, scrollWidth){

	this.uiCoreConfig = coreConfig;
	this.scrollWidth = scrollWidth;

}

UICore.prototype.calculateScreen = function(uiPrepare, screenView){
	
	//generate list of views and indexes for quick access
	var arrayViews = uiPrepare.generateArrayViews(screenView);
	var indexes = uiPrepare.generateIndexes(arrayViews);
    
    var viewsRestored;
	
    do{
        
        //clean array
        viewsRestored = new Array();
        
        //clean all views except the screen
        for(var i=1; i<arrayViews.length; i++){
			arrayViews[i].clean();
        }
    
        for(var i=0; i<screenView.childrenOrderHor.length; i++){
            this.calculateViewHor(screenView.childrenOrderHor[i], screenView, arrayViews, indexes, screenView.width, viewsRestored);
        }

        for(var i=0; i<screenView.childrenOrderVer.length; i++){
            var viewReturn = this.calculateViewVer(screenView.childrenOrderVer[i], screenView, arrayViews, indexes, screenView.height, viewsRestored);
        }
        
    }while(viewsRestored.length>0);
}

UICore.prototype.calculateViewHor = function(view, parentView, arrayViews, indexes, width, viewsRestored){
		
	//eval references to try to calculate the width
	var references = view.getReferencesHor();
	for(var n=0; n<references.length; n++){
		var dependency = references[n];
		if(dependency.length>0){
			this.evalDependenceHor(view, parentView, width, n, arrayViews[indexes[dependency]]);
		}
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
			
			for(var i=0; i<view.childrenOrderHor.length; i++){
				this.calculateViewHor(view.childrenOrderHor[i], view, arrayViews, indexes, viewWidth, viewsRestored);
			}
			
			//move left and right of all children using the paddingLeft
			this.applyPaddingChildrenHor(view);
			
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the width of the parent
		if(view.childrenOrderHor.length>0){
			
			//calculate the real width with padding
			var viewWidth = view.scrollHorizontal? 0 : width;
			
			//calculate the children width
			for(var i=0; i<view.childrenOrderHor.length; i++){
				this.calculateViewHor(view.childrenOrderHor[i], view, arrayViews, indexes, viewWidth, viewsRestored);
			}
			
			//move left and right of all children using the paddingLeft
			this.applyPaddingChildrenHor(view);
			
			//set the width of the children
			this.applySizeChildrenHor(view);
			
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

UICore.prototype.calculateViewVer = function(view, parentView, arrayViews, indexes, height, viewsRestored){
	
    //save state of the view to restore it if it is necessary
//    var viewSaved = view.clone();
    
	//eval references to try to calculate the height
	var references = view.getReferencesVer();
	for(var n=0; n<references.length; n++){
		var dependency = references[n];
		if(dependency.length>0){
			this.evalDependenceVer(view, parentView, height, n, arrayViews[indexes[dependency]]);
		}
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
			
			for(var i=0; i<view.childrenOrderVer.length; i++){
				this.calculateViewVer(view.childrenOrderVer[i], view, arrayViews, indexes, viewHeight, viewsRestored);
			}
			
			//move top and bottom of all children using the paddingTop
			this.applyPaddingChildrenVer(view);
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the width of the parent
		if(view.childrenOrderVer.length>0){
			
			//calculate the real height with padding
			var viewHeight = view.scrollVertical? 0 : height;
			
			//calculate the children height
			for(var i=0; i<view.childrenOrderVer.length; i++){
                this.calculateViewVer(view.childrenOrderVer[i], view, arrayViews, indexes, viewHeight, viewsRestored);
			}
			
			//move top and bottom of all children using the paddingTop
			this.applyPaddingChildrenVer(view);
			
			//set the width of the children
			this.applySizeChildrenVer(view);
			
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
	if(view.right>width && width>0){
		view.right = width;	
	}
	view.width = view.right - view.left;
}

UICore.prototype.assignSizeVer = function(view, height){
	if(view.bottom>height && height>0){
		view.bottom = height;
	}
	view.height = view.bottom - view.top;
}

UICore.prototype.applyFixedSizeHor = function(view){
	//set left and top if they are not setted
	if(view.rightChanged){
		view.left = view.right - view.width;
		view.leftChanged = true;
	}else{
		view.right = view.left + view.width;
		view.leftChanged = true;
		view.rightChanged = true;
	}
}

UICore.prototype.applyFixedSizeVer = function(view){
	//set bottom and top if they are not setted
	if(view.bottomChanged){
		view.top = view.bottom - view.height;
		view.topChanged = true;
	}else{
		view.bottom = view.top + view.height;
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
		for(var i=0; i<view.children.length; i++){
			view.children[i].left += view.paddingLeft;
			view.children[i].right += view.paddingLeft;
		}
	}
}

/**
* Add the padding of the view to all its children
* @param view parent
**/
UICore.prototype.applyPaddingChildrenVer = function(view){
	if(view.paddingTop!=0){
		for(var i=0; i<view.children.length; i++){
			view.children[i].top += view.paddingTop;
			view.children[i].bottom += view.paddingTop;
		}
	}
}

/**
* Apply scroll to the view if their children are widther than parent
* @param view View parent
**/
UICore.prototype.applyScrollHor = function(view, width){
	if(view.scrollHorizontal){
		var maxX = 0;
		for(var i=0; i<view.children.length; i++){
			var child = view.children[i];
			if(child.right>maxX){
				maxX = child.right;
			}
		}
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
		for(var i=0; i<view.children.length; i++){
			var child = view.children[i];
			if(child.bottom>maxY){
				maxY = child.bottom;
			}
		}
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
		view.left = view.right - view.width;
		view.leftChanged = true;
	
	}else if(view.right>=0){
		view.right = view.left + view.width;
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
		view.top = view.bottom - view.height;
		view.topChanged = true;
	
	}else if(view.bottom>=0){
		
		var ele = document.getElementById(view.id);
		ele.style.width = view.width + 'px';
		view.height = ele.offsetHeight;	
		
		view.bottom = view.top + view.height;		
		view.bottomChanged = true;
		view.topChanged = true;
	}
}

/**
* Calculate the left or the right with the size of the children if the sizeWidth is "sc"
* @param view View to set the size
**/
UICore.prototype.applySizeChildrenHor = function(view){
	
	var maxX = 0;
	for(var i=0; i<view.children.length; i++){
		var child = view.children[i];
		if(child.right>maxX){
			maxX = child.right;
		}
	}
	if(view.rightChanged){
		view.left = view.right - maxX - view.paddingLeft;
		view.leftChanged = true;
	}else{
		view.right = view.left + maxX + view.paddingRight;
		view.rightChanged = true;
		view.leftChanged = true;
	}
	
	//apply width of children if they were waiting to have the parent size
	//this is used for r:p and parent has no size defined
	for(var i=0; i<view.children.length; i++){
		var child = view.children[i];
		if(child.width<0){
			child.right = maxX;
			child.width = child.right - child.left;
		}
	}

}

/**
* Calculate the left or the right with the size of the children if the sizeWidth is "sc"
* @param view View to set the size
**/
UICore.prototype.applySizeChildrenVer = function(view){
	
	var maxY = 0;
	for(var i=0; i<view.children.length; i++){
		var child = view.children[i];
		if(child.bottom>maxY){
			maxY = child.bottom;
		}
	}
	if(view.bottomChanged){
		view.top = view.bottom - maxY - view.paddingTop;
		view.topChanged = true;
	}else{
		view.bottom = view.top + maxY + view.paddingBottom;
		view.bottomChanged = true;
	}
	
	//apply height of children if they were waiting to have the parent size
	//this is used for b:p and parent has no size defined
	for(var i=0; i<view.children.length; i++){
		var child = view.children[i];
		if(child.height<0){
			child.bottom = maxY;
			child.height = child.bottom - child.top;
		}
	}
			
}

/**
* Apply percent to a view with a width setted
* @param view View to set percent
* @param parentView View of the parent to know its size
* @param width width to apply if right was not applied
**/
UICore.prototype.applyPercentHor = function(view, parentView, width){
	
	if(view.rightChanged && !view.leftChanged){
		view.left = view.right - ((parentView.width * view.percentWidth) / 100);
	}else{
		view.right = view.left + ((parentView.width * view.percentWidth) / 100);
	}

	//move the percent if necessary
	if(view.percentLeft>0){
		var percentLeft = (view.right-view.left) * (view.percentLeft);
		view.left += percentLeft;
		view.right += percentLeft;
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
		view.top = view.bottom - ((parentView.height * view.percentHeight) / 100);
	}else{
		view.bottom = view.top + ((parentView.height * view.percentHeight) / 100);
	}
	

	//move the percent if necessary
	if(view.percentTop>0){
		var percentTop = (view.bottom-view.top) * (view.percentTop);
		view.top += percentTop;
		view.bottom += percentTop;
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
		}else if(view.gravityHor=='r'){
			view.right = width;
			view.left = view.right - view.width;
		}else if(view.gravityHor=='c'){
			view.left = (width - view.width) / 2;
			view.right = view.left + view.width;
			view.leftChanged = true;
			view.rightChanged = true;
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
		}else if(view.gravityVer=='b'){
			view.bottom = height;
			view.top = view.bottom - view.height;
		}else if(view.gravityVer=='c'){
			view.top = (height - view.height) / 2;
			view.bottom = view.top + view.height;
			view.topChanged = true;
			view.bottomChanged = true;
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
	var viewMarginTop = this.uiCoreConfig.getDimen(view.marginTop);
	var viewMarginBottom = this.uiCoreConfig.getDimen(view.marginBottom);
	
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
				view.right = -1;
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
				view.bottom = -1;
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