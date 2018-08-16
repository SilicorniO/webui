
/** 
 * @constructor
*/
function UIDraw(){

}

/**
* Apply positions for the views
* @param {UIView} view to draw children
* @param {boolean} viewColors flag to show or not colors in views
* @return int maximum Y positon of a children
**/
UIDraw.prototype.applyPositions = function(view, viewColors){
    
    var maxX = 0;
	var maxY = 0;
    
    var paddingLeft = 0;
    var paddingRight = 0;
    var paddingTop = 0;
    var paddingBottom = 0;

	view.forEachChild((function(view, index){
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
        ele.style.transition = "all " + view.animationDuration + "s ease 0s";
        
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
            ele.style.width = screenView.percentWidth + "%";
        }else{
            ele.style.width = width + "px";
        }
        if(screenView.sizeHeight=="s"){
            ele.style.height = screenView.height + "px";
        }else if(screenView.sizeHeight=="sp"){
            ele.style.height = screenView.percentHeight + "%";
        }else{
            ele.style.height = height + "px";
        }
    }
	
}