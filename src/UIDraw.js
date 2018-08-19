
/** 
 * @constructor
*/
function UIDraw(){

}

/**
* Apply positions for the views
* @param {UIView} parentView to draw children
* @param {boolean} viewColors flag to show or not colors in views
* @param {boolean} parentGone flag to know if parent is not being displayed because is gone
* @return int maximum Y positon of a children
**/
UIDraw.prototype.applyPositions = function(parentView, viewColors){
    
    var maxX = 0;
	var maxY = 0;
    
    var paddingLeft = 0;
    var paddingRight = 0;
    var paddingTop = 0;
    var paddingBottom = 0;

	parentView.forEachChild((function(view){
		var ele = view.element;
		
        //initialize paddings
        paddingLeft = 0;
        paddingRight = 0;
        paddingTop = 0;
        paddingBottom = 0;
        
		//get paddings
        if(ele.childElementCount==0){
            var curStyle = window.getComputedStyle(ele);
            if(view.sizeWidth=='sc'){
                paddingLeft = parseInt(curStyle.paddingLeft, 10);
                paddingRight = parseInt(curStyle.paddingRight, 10);
            }
            if(view.sizeHeight=='sc'){
                paddingTop = parseInt(curStyle.paddingTop, 10);
                paddingBottom = parseInt(curStyle.paddingBottom, 10);
            }            
        }
        
        //set values necessary for framework
        ele.style.display = "inline-block";
        ele.style.margin = "auto";
        if(ele.childElementCount>0){
            ele.style.padding = "0px";
        }
		
        //set location
        var left = parseInt(view.left, 10);
        var top = parseInt(view.top, 10);
        var width = view.width > 0 ? (view.width-paddingLeft-paddingRight) : 0;
        var height = view.height > 0 ? (view.height-paddingTop-paddingBottom) : 0;
		ele.style.left = left + "px";
		ele.style.top = top + "px";
		if(width > 0){
			ele.style.width = width + "px";
		}
		if(height > 0){
			ele.style.height = height + "px";
        }
        ele.style.position = "absolute";

        //apply animation
        if (view.animationDurations.length > 0) {
            ele.style.transition = "all " + view.animationDurations[0] + "s ease 0s";
            ele.ui.animationDurations.splice(0, 1);

            //remove transition after the end of the animation
            var endTranstion = function (event) {
                log(event);
                ele.style.transition = '';
                ele.removeEventListener("transitionend", endTranstion)
            };
            ele.addEventListener("transitionend", endTranstion);
        }
        
        if(view.left+view.width>maxX){
            maxX = view.left+view.width;
        }
		if(view.top+view.height>maxY){
			maxY = view.top+view.height;
		}
        
        //apply view color if activated 
        if(viewColors){
            ele.style.backgroundColor = this.generateRandomViewColor();
        }
		
        var childrenSize = this.applyPositions(view, viewColors);
        if(childrenSize.maxX>maxX){
            maxX = childrenSize.maxX;
        }
		if(childrenSize.maxY>maxY){
            maxY = childrenSize.maxY;
        }	
	}).bind(this));
	
	return {maxX: maxX, maxY: maxY};
	
}

/**
* Apply visibility for the views
* @param {UIView} view to change visibility
* @param {UIView} parentView to know visibility of the parent
* @param {UIConfiguration} configuration to know time of animations
* @param {boolean} forceGone flag to know if parent is not being displayed because is gone
**/
UIDraw.prototype.applyVisibility = function(view, parentView, configuration, forceGone = false){
    var ele = view.element;

    //hide view if visibility is gone
    if (view.visibility == 'g' || forceGone) {
        ele.style.display = "none";  
        ele.style.opacity = '0';
    } else {
        ele.style.display = "inline-block";
        if (view.visibility == 'i' || (parentView && parentView.visibility == 'i') ) {
            // ele.style.visibility = "hidden";
            ele.style.opacity = '0';
        } else {
            // ele.style.visibility = "visible";
            ele.style.opacity = '1';
        }
    }
    if (configuration.animations.defaultOpacity) {
        ele.style.transition = "opacity " + configuration.animations.defaultTime + "s ease 0s";
    }

	view.forEachChild((function(childView){
		this.applyVisibility(childView, view, configuration, ele.style.display == "none");
	}).bind(this));
	
}
    
UIDraw.prototype.generateRandomViewColor = function(){
    var r = parseInt(Math.random()*255, 10);
    var g = parseInt(Math.random()*255, 10);
    var b = parseInt(Math.random()*255, 10);
    return 'rgba(' + r +',' + g + ',' + b + ',0.4)';
}

/**
* Check if we have to set a bigger height to the screen
* @param screenView View of screen using
* @param width int minimum width for the screen
* @param height int minimum height for the screen
**/
UIDraw.prototype.applySizeScreen = function(screenView, width, height){
    
    var ele = document.getElementById(screenView.id);
    if(screenView.id!="s" && ele!=null){
        if(screenView.sizeWidth=="s"){
            ele.style.width = screenView.width + "px";
        }else if(screenView.sizeWidth=="sp"){
            ele.style.width = screenView.widthValue + "%";
        }else{
            ele.style.width = width + "px";
        }
        if(screenView.sizeHeight=="s"){
            ele.style.height = screenView.height + "px";
        }else if(screenView.sizeHeight=="sp"){
            ele.style.height = screenView.heightValue + "%";
        }else{
            ele.style.height = height + "px";
        }
    }
	
}