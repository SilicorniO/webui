
var uiCoreConfig;

function calculateScreen(screenView, coreConfig){
	
	//save screenSizeRatio
	uiCoreConfig = coreConfig;
	
	//generate list of views and indexes for quick access
	var arrayViews = generateArrayViews(screenView);
	var indexes = generateIndexes(arrayViews);
    
    var viewsRestored;
	
    do{
        
        //clean array
        viewsRestored = new Array();
        
        //clean all views except the screen
        for(var i=1; i<arrayViews.length; i++){
			arrayViews[i].clean();
        }
    
        for(var i=0; i<screenView.childrenOrderHor.length; i++){
            calculateViewHor(screenView.childrenOrderHor[i], screenView, arrayViews, indexes, screenView.width, viewsRestored);
        }

        for(var i=0; i<screenView.childrenOrderVer.length; i++){
            var viewReturn = calculateViewVer(screenView.childrenOrderVer[i], screenView, arrayViews, indexes, screenView.height, viewsRestored);
        }
        
    }while(viewsRestored.length>0);
}

function calculateViewHor(view, parentView, arrayViews, indexes, width, viewsRestored){
		
	//eval references to try to calculate the width
	var references = view.getReferencesHor();
	for(var n=0; n<references.length; n++){
		var dependency = references[n];
		if(dependency.length>0){
			evalDependenceHor(view, parentView, width, n, arrayViews[indexes[dependency]]);
		}
	}
	
	//calculate width
	if(view.sizeWidth=='s'){
		
		//fixed width
		applyFixedSizeHor(view);
	
	}else if(view.sizeWidth=='sp'){
		
		//apply percent
		applyPercentHor(view, width);		
		
	}
	
	//apply margins to left and right
	assignMarginsHor(view);
			
	//calculate width if it is possible
	if(view.leftChanged && view.rightChanged){
		
		//calculate the width
		assignSizeHor(view, width);
		
		//check gravity
		assignGravityHor(view, width);
	
		//if there are children we eval them with width restrictions
		if(view.childrenOrderHor.length>0){
			
			//calculate the real width with padding
			var viewWidth = view.scrollHorizontal? 0 : view.width - view.paddingLeft - view.paddingRight;
			
			for(var i=0; i<view.childrenOrderHor.length; i++){
				calculateViewHor(view.childrenOrderHor[i], view, arrayViews, indexes, viewWidth, viewsRestored);
			}
			
			//move left and right of all children using the paddingLeft
			applyPaddingChildrenHor(view);
			
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the width of the parent
		if(view.childrenOrderHor.length>0){
			
			//calculate the real width with padding
			var viewWidth = view.scrollHorizontal? 0 : width;
			
			//calculate the children width
			for(var i=0; i<view.childrenOrderHor.length; i++){
				calculateViewHor(view.childrenOrderHor[i], view, arrayViews, indexes, viewWidth, viewsRestored);
			}
			
			//move left and right of all children using the paddingLeft
			applyPaddingChildrenHor(view);
			
			//set the width of the children
			applySizeChildrenHor(view);
			
		}else{
			//else if there are not children we calculate the content size
			applySizeContentHor(view);
			
		}
		
		//calculate the width
		assignSizeHor(view, width);
						
		//check gravity
		assignGravityHor(view, width);
				
	}
	
	//check if size of children if bigger than container to add vertical scroll
	if(applyScrollHor(view, width)){
                
        //apply the padding of the scroll to the element
        view.paddingBottom += scrollWidth;
        view.scrollHorizontalApplied = true;
        
        //save the view as one to recalculate
        viewsRestored.push(view);
    }
}

function calculateViewVer(view, parentView, arrayViews, indexes, height, viewsRestored){
	
    //save state of the view to restore it if it is necessary
//    var viewSaved = view.clone();
    
	//eval references to try to calculate the height
	var references = view.getReferencesVer();
	for(var n=0; n<references.length; n++){
		var dependency = references[n];
		if(dependency.length>0){
			evalDependenceVer(view, parentView, height, n, arrayViews[indexes[dependency]]);
		}
	}
	
	//calculate height
	if(view.sizeHeight=='s'){
		
		//fixed height
		applyFixedSizeVer(view);
	
	}else if(view.sizeHeight=='sp'){
		
		//apply percent
		applyPercentVer(view, height);		
		
	}
	
	//apply margins to top and bottom
	assignMarginsVer(view);
			
	//calculate width if it is possible
	if(view.topChanged && view.bottomChanged){
		
		//calculate the height
		assignSizeVer(view, height);
		
		//check gravity
		assignGravityVer(view, height);
	
		//if there are children we eval them with width restrictions
		if(view.childrenOrderVer.length>0){
			
			//calculate the real height with padding
			var viewHeight = view.scrollVertical? 0 : view.height - view.paddingTop - view.paddingBottom;
			
			for(var i=0; i<view.childrenOrderVer.length; i++){
				calculateViewVer(view.childrenOrderVer[i], view, arrayViews, indexes, viewHeight, viewsRestored);
			}
			
			//move top and bottom of all children using the paddingTop
			applyPaddingChildrenVer(view);
		}
		
	}else{
				
		//if there are children we calculate the size of the children
		//giving the width of the parent
		if(view.childrenOrderVer.length>0){
			
			//calculate the real height with padding
			var viewHeight = view.scrollVertical? 0 : height;
			
			//calculate the children height
			for(var i=0; i<view.childrenOrderVer.length; i++){
                calculateViewVer(view.childrenOrderVer[i], view, arrayViews, indexes, viewHeight, viewsRestored);
			}
			
			//move top and bottom of all children using the paddingTop
			applyPaddingChildrenVer(view);
			
			//set the width of the children
			applySizeChildrenVer(view);
			
		}else{
			//else if there are not children we calculate the content size
			applySizeContentVer(view);
			
		}
		
		//calculate the width
		assignSizeVer(view, height);
		
		//check gravity
		assignGravityVer(view, height);
	}
			
	//check if size of children if bigger than container to add vertical scroll
	if(applyScrollVer(view, height)){
                
        //apply the padding of the scroll to the element
        view.paddingRight += scrollWidth;
        view.scrollVerticalApplied = true;
        
        //save the view as one to recalculate
        viewsRestored.push(view);
    }
}

/**
* Replace the view received in the parent and in the array of views received
* @param view View cloned
* @param parentView View parent
* @param arrayViews Array views
* @param indexes Array of index of the arrayViews
**/
function replaceClonedView(view, parentView, arrayViews, indexes){
    
    //mark it as replaced
    view.replaced = true;
    
    //replace it in the parent
    parentView.replaceSon(view);
    
    //replace it in the array of views
    arrayViews[indexes[view.id]] = view;
}

function assignSizeHor(view, width){
	if(view.right>width && width>0){
		view.right = width;	
	}
	view.width = view.right - view.left;
}

function assignSizeVer(view, height){
	if(view.bottom>height && height>0){
		view.bottom = height;
	}
	view.height = view.bottom - view.top;
}

function applyFixedSizeHor(view){
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

function applyFixedSizeVer(view){
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
function applyPaddingChildrenHor(view){
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
function applyPaddingChildrenVer(view){
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
function applyScrollHor(view, width){
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
function applyScrollVer(view, height){
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
function applySizeContentHor(view){
		
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
function applySizeContentVer(view){
	
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
function applySizeChildrenHor(view){
	
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
function applySizeChildrenVer(view){
	
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
**/
function applyPercentHor(view, width){
	
	if(!view.rightChanged || !view.leftChanged){
		view.right = width;
	}
	view.right = view.left + (((view.right-view.left) * view.percentWidth) / 100);

	//move the percent if necessary
	var percentLeft = (view.right-view.left) * (view.percentLeft);
	view.left += percentLeft;
	view.right += percentLeft;

	//masrk right and left as changed
	view.rightChanged = true;
	view.leftChanged = true;
}

/**
* Apply percent to a view with a width setted
* @param view View to set percent
**/
function applyPercentVer(view, height){
	
	if(!view.bottomChanged || !view.topChanged){
		view.bottom = height;
	}
	view.bottom = view.top + ((view.bottom-view.top) * view.percentHeight / 100);

	//move the percent if necessary
	var percentTop = (view.bottom-view.top) * (view.percentTop);
	view.top += percentTop;
	view.bottom += percentTop;

	//masrk right and left as changed
	view.bottomChanged = true;
	view.topChanged = true;
}

/**
* Assign gravity values to the view
* @param view View to get and change values
* @param width int
**/
function assignGravityHor(view, width){
	
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
function assignGravityVer(view, height){
	
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
function assignMarginsHor(view){
	
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
function assignMarginsVer(view){
	
	//save margin to apply to their children
	var viewMarginTop = uiCoreConfig.getDimen(view.marginTop);
	var viewMarginBottom = uiCoreConfig.getDimen(view.marginBottom);
	
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
function evalDependenceHor(view, parentView, width, iReference, viewDependency){
	
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
function evalDependenceVer(view, parentView, height, iReference, viewDependency){
	
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
