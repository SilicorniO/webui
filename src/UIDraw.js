
/** 
 * @constructor
*/
function UIDraw(){

}

/**
* Apply positions for the views
* @param views Array of views to apply position
* @return int maximum Y positon of a children
**/
UIDraw.prototype.applyPositions = function(views, viewColors){
    
    var maxX = 0;
	var maxY = 0;
    
    var paddingLeft = 0;
    var paddingRight = 0;
    var paddingTop = 0;
    var paddingBottom = 0;

	for(var i=0; i<views.length; i++){
		var view = views[i];
		var ele = document.getElementById(view.id);
		
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
		ele.style.left = view.left + "px";
		ele.style.top = view.top + "px";
		if(view.width>0){
			ele.style.width = (view.width-paddingLeft-paddingRight) + "px";
		}
		if(view.height>0){
			ele.style.height = (view.height-paddingTop-paddingBottom) + "px";
		}
		ele.style.position = "absolute";
        
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
		
        var childrenSize = this.applyPositions(view.children, viewColors);
        if(childrenSize.maxX>maxX){
            maxX = childrenSize.maxX;
        }
		if(childrenSize.maxY>maxY){
            maxY = childrenSize.maxY;
        }	
	}
	
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