
/**
* Create a view object reading the HTML of the element 
* @constructor
* @param element where to read data
* @param {string=} parentId to assign to the view created
* @param {string=} lastViewId with the identifier of the view before
* @param {string=} attributeMain with the name of the attribute to read
* @param {Array<string>=} attributes with the name of the attributes to read as secondary
**/
function UIView(element, parentId, lastViewId, attributeMain, attributes){

	this.id = element.id;
	this.parentId = parentId;
	this.children = new Array();
	this.childrenOrderHor = new Array();
	this.childrenOrderVer = new Array();
	this.childrenUI = true; 
	
	this.order = 0;
	this.orderNum = 0;
	this.dependencies = new Array();
	
	this.leftLeft = '';
	this.leftRight = '';
	this.rightRight = '';
	this.rightLeft = '';
	this.topTop = '';
	this.topBottom = '';
	this.bottomBottom = '';
	this.bottomTop = '';
	
	this.sizeWidth = 'sc'; //size_content
	this.sizeHeight = 'sc'; //size_content
	
	this.left = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;
	
	this.leftChanged = false;
	this.topChanged = false;
	this.rightChanged = false;
	this.bottomChanged = false;
	
	this.width = 0;
	this.height = 0;
	
	this.scrollVertical = false;
	this.scrollHorizontal = false;
	
	this.scrollVerticalApplied = false;
	this.scrollHorizontalApplied = false;
	
	this.percentWidth = 0;
	this.percentHeight = 0;
	this.percentLeft = 0;
	this.percentTop = 0;
	
	this.gravityHor = 'n';
	this.gravityVer = 'n';

	this.marginLeftDimen = "0";
	this.marginTopDimen = "0";
	this.marginRightDimen = "0";
	this.marginBottomDimen = "0";
	
	this.marginLeft = 0;
	this.marginTop = 0;
	this.marginRight = 0;
	this.marginBottom = 0;

	this.paddingLeftDimen = "0";
	this.paddingTopDimen = "0";
	this.paddingRightDimen = "0";
	this.paddingBottomDimen = "0";
	
	this.paddingLeft = 0;
	this.paddingTop = 0;
	this.paddingRight = 0;
	this.paddingBottom = 0;
	
	this.replaced = false;

	//flags for changes
	this.sizeLoaded = false;
	this.childrenInOrder = false;

	//initialize
	if(parentId!=null){
		this.readUI(element, parentId, lastViewId, attributeMain, attributes)
	}
}

/**
* Generate a new parent view that is called screen
* @constructor
* @param views Array of views to add to the screen
* @param coreConfig configuration of core 
* @return Screen generated
**/
function UIViewScreen(id, ele, views, coreConfig){
	
	var screenView;
	if(ele!=null){
		screenView = new UIView(ele, "", "", coreConfig.attribute, coreConfig.attributes);
	}else{
		screenView = new UIView(id);
	}
	screenView.children = views;

	return screenView
}

UIView.prototype.setWidth = function(w){
	if(w=="sc"){
		this.sizeWidth = w;
		this.width = 0;
	}else if(String(w).indexOf('%')!=-1){
		var indexPercent = w.indexOf('%');
		this.percentWidth = parseFloat(w.substring(0, indexPercent));
		if(indexPercent<w.length-1){
			this.percentLeft = parseInt(w.substring(indexPercent+1, w.length), 10);
		}
		this.sizeWidth = "sp"; //size_percent
	}else{
		this.width = parseInt(w, 10); 
		this.sizeWidth = "s" //sized
	}
}

UIView.prototype.setHeight = function(h){
	if(h=="sc"){
		this.sizeHeight = h;
		this.height = 0;
	}else if(String(h).indexOf('%')!=-1){
		var indexPercent = h.indexOf('%');
		this.percentHeight = parseInt(h.substring(0, indexPercent), 10);
		if(indexPercent<h.length-1){
			this.percentTop = parseInt(h.substring(indexPercent+1, h.length), 10);
		}
		this.sizeHeight = "sp"; //size_percent
	}else{
		this.height = parseInt(h, 10); 
		this.sizeHeight = "s" //sized
	}
}

UIView.prototype.setLeft = function(id){this.leftLeft = id};
UIView.prototype.setRight = function(id){this.rightRight = id};
UIView.prototype.setTop = function(id){this.topTop = id};
UIView.prototype.setBottom = function(id){this.bottomBottom = id};
UIView.prototype.setAtLeft = function(id){this.rightLeft = id};
UIView.prototype.setAtRight = function(id){this.leftRight = id};
UIView.prototype.setAtTop = function(id){this.bottomTop = id};
UIView.prototype.setAtBottom = function(id){this.topBottom = id};
		
UIView.prototype.setScrollVertical = function(id){this.scrollVertical = id};
UIView.prototype.setScrollHorizontal = function(id){this.scrollHorizontal = id};
		
UIView.prototype.setGravityHorizontal = function(gravity){ this.gravityHor = gravity};
UIView.prototype.setGravityVertical = function(gravity){ this.gravityVer = gravity};
UIView.prototype.setGravity = function(gravityHor, gravityVer){ 
	this.gravityHor = gravityHor,
	this.gravityVer = gravityVer
}
		
UIView.prototype.setMarginLeft = function(margin){this.marginLeftDimen = margin};
UIView.prototype.setMarginTop = function(margin){this.marginTopDimen = margin};
UIView.prototype.setMarginRight = function(margin){this.marginRightDimen = margin};
UIView.prototype.setMarginBottom = function(margin){this.marginBottomDimen = margin};
UIView.prototype.setMargins = function(marginLeft, marginTop, marginRight, marginBottom){
			this.marginLeftDimen = marginLeft;
			this.marginTopDimen = marginTop;
			this.marginRightDimen = marginRight;
			this.marginBottomDimen = marginBottom;
			};
			
UIView.prototype.setPaddingLeft = function(padding){this.paddingLeftDimen = padding};
UIView.prototype.setPaddingTop = function(padding){this.paddingTopDimen = padding};
UIView.prototype.setPaddingRight = function(padding){this.paddingRightDimen = padding};
UIView.prototype.setPaddingBottom = function(padding){this.paddingBottomDimen = padding};
UIView.prototype.setPaddings = function(paddingLeft, paddingTop, paddingRight, paddingBottom){
			this.paddingLeftDimen = paddingLeft;
			this.paddingTopDimen = paddingTop;
			this.paddingRightDimen = paddingRight;
			this.paddingBottomDimen = paddingBottom;
			};
			
UIView.prototype.getReferences = function(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft, this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];};
		
UIView.prototype.getReferencesHor = function(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft];};
		
UIView.prototype.getReferencesVer = function(){ return [this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];};
		
UIView.prototype.setReference = function(i, value){
	switch(i){
		case 0: this.leftLeft = value; break;
		case 1: this.leftRight = value; break;
		case 2: this.rightRight = value; break;
		case 3: this.rightLeft = value; break;
		case 4: this.topTop = value; break;
		case 5: this.topBottom = value; break;
		case 6: this.bottomBottom = value; break;
		case 7: this.bottomTop = value; break;
	}
};
        
        //search the son in the arrays and replace them
UIView.prototype.replaceSon = function(son){
            
	for(var i=0; i<this.children.length; i++){
		if(this.children[i].id == son.id){
			this.children[i] = son;
			break;
		}
	}        
	for(var i=0; i<this.childrenOrderHor.length; i++){
		if(this.childrenOrderHor[i].id == son.id){
			this.childrenOrderHor[i] = son;
			break;
		}
	}
	for(var i=0; i<this.childrenOrderVer.length; i++){
		if(this.childrenOrderVer[i].id == son.id){
			this.childrenOrderVer[i] = son;
			break;
		}
	}
	
};
		
UIView.prototype.clean = function(){
	this.leftChanged = false;
	this.topChanged = false;
	this.rightChanged = false;
	this.bottomChanged = false;
	this.left = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;
	
	//clean percent to calculate it again
	if(this.percentWidth>0){
		this.sizeWidth = "sp";
	}
	if(this.percentHeight>0){
		this.sizeHeight = "sp";
	}
};

UIView.prototype.applyDimens = function(coreConfig){
	
	this.paddingLeft = coreConfig.getDimen(this.paddingLeftDimen);
	this.paddingRight = coreConfig.getDimen(this.paddingRightDimen);
	this.paddingTop = coreConfig.getDimen(this.paddingTopDimen);
	this.paddingBottom = coreConfig.getDimen(this.paddingBottomDimen);
	
	this.marginLeft = coreConfig.getDimen(this.marginLeftDimen);
	this.marginRight = coreConfig.getDimen(this.marginRightDimen);
	this.marginTop = coreConfig.getDimen(this.marginTopDimen);
	this.marginBottom = coreConfig.getDimen(this.marginBottomDimen);
	
};
        
UIView.prototype.clone = function(){
	
	//create a new instance
	var view = new UIView(this.id);
	
	//set all the values
	view.parentId = this.parentId;
	for(var i=0; i<this.children.length; i++){
		view.children.push(this.children[i].clone());    
	}            
	for(var i=0; i<this.childrenOrderHor.length; i++){
		for(var n=0; n<view.children.length; n++){
			if(view.children[n].id == this.childrenOrderHor[i].id){
				view.childrenOrderHor.push(view.children[n]);
				break;
			}
		}
	}
	for(var i=0; i<this.childrenOrderVer.length; i++){
		for(var n=0; n<view.children.length; n++){
			if(view.children[n].id == this.childrenOrderVer[i].id){
				view.childrenOrderVer.push(view.children[n]);
				break;
			}
		}
	}
	view.childrenUI = this.childrenUI;
	
	view.order = this.order;
	view.orderNum = this.orderNum;
	for(var i=0; i<this.dependencies.length; i++){
		view.dependencies.push(this.dependencies[i]);
	}
	
	view.leftLeft = this.leftLeft;
	view.leftRight = this.leftRight;
	view.rightRight = this.rightRight;
	view.rightLeft = this.rightLeft;
	view.topTop = this.topTop;
	view.topBottom = this.topBottom;
	view.bottomBottom = this.bottomBottom;
	view.bottomTop = this.bottomTop;
	
	view.sizeWidth = this.sizeWidth;
	view.sizeHeight = this.sizeHeight;
	
	view.left = this.left;
	view.top = this.top;
	view.right = this.right;
	view.bottom = this.bottom;
	
	view.leftChanged = this.leftChanged;
	view.topChanged = this.topChanged;
	view.rightChanged = this.rightChanged;
	view.bottomChanged = this.bottomChanged;
	
	view.width = this.width;
	view.height = this.height;
	
	view.scrollVertical = this.scrollVertical;
	view.scrollHorizontal = this.scrollHorizontal;
	
	view.scrollVerticalApplied = this.scrollVerticalApplied;
	view.scrollHorizontalApplied = this.scrollHorizontalApplied;
	
	view.percentWidth = this.percentWidth;
	view.percentHeight = this.percentHeight;
	view.percentLeft = this.percentLeft;
	view.percentTop = this.percentTop;
	
	view.gravityHor = this.gravityHor;
	view.gravityVer = this.gravityVer;
	
	view.marginLeft = this.marginLeft;
	view.marginTop = this.marginTop;
	view.marginRight = this.marginRight;
	view.marginBottom = this.marginBottom;
	
	view.paddingLeft = this.paddingLeft;
	view.paddingTop = this.paddingTop;
	view.paddingRight = this.paddingRight;
	view.paddingBottom = this.paddingBottom;
	
	//return the view
	return view;
}
		
UIView.prototype.toString = function(){
	return "[" + this.id + "]: ll:" + this.leftLeft + ", lr:" + this.leftRight + ", rr:" + this.rightRight + ", rl:" + this.rightLeft + ", tt:" + this.topTop + ",tb: " + this.topBottom + ", bb:" + this.bottomBottom + ", bt:" + this.bottomTop + ", ml:" + this.marginLeft + ", mr:" + this.marginRight + ", mt:" + this.marginTop + ",mb: " + this.marginBottom + ", pl:" + this.paddingLeft + ", pr:" + this.paddingRight + ", pt:" + this.paddingTop + ", pb:" + this.paddingBottom + ", w:" + this.width + ", h:" + this.height + ", sh:" + this.sizeWidth + ", sh:" + this.sizeHeight + ", pId:" + this.parentId + ", l:" + this.left + ", r:" + this.right + ", t:" + this.top + ", b:" + this.bottom;
}

/**
* Create a view object reading the HTML of the element 
* @param element where to read data
* @param parentId to assign to the view created
* @param lastViewId with the identifier of the view before
* @param attributeMain with the name of the attribute to read
* @param attributes with the name of the attributes to read as secondary
* @return View generated
**/
UIView.prototype.readUI = function(element, parentId, lastViewId, attributeMain, attributes){
	
	//read main attributes
	var aValues = UIUtilsInstance.readAttributes(element.getAttribute(attributeMain));
	for(var i=0; i<attributes.length; i++){
		aValues = aValues.concat(UIUtilsInstance.readAttributes(element.getAttribute(attributes[i])));
	}
	
	//check if we have attributes
	if(aValues.length==0){
		return;
	}
		
	//set the ui values
	for(var i=0; i<aValues.length; i++){
		
		var attr = aValues[i].attr;
		var value = aValues[i].value;
		
		//check if value is a reference to the parent
		if(value=='p'){
			value = parentId;
		}else if(value=='l'){
			value = lastViewId;
		}
					
		if(attr=='w'){
			this.setWidth(value);	
		}else if(attr=='fw'){
			this.setWidth('100%');	
		}else if(attr=='h'){
			this.setHeight(value);
		}else if(attr=='fh'){
			this.setHeight('100%');	
		}else if(attr=='l'){
			this.setLeft(value);
		}else if(attr=='r'){
			this.setRight(value);
		}else if(attr=='t'){
			this.setTop(value);
		}else if(attr=='b'){
			this.setBottom(value);
		}else if(attr=='al'){
			this.setAtLeft(value);
		}else if(attr=='ale'){
			this.setAtLeft(value);
			this.setTop(value);
			this.setBottom(value);
		}else if(attr=='ar'){
			this.setAtRight(value);
		}else if(attr=='are'){
			this.setAtRight(value);
			this.setTop(value);
			this.setBottom(value);
		}else if(attr=='at'){
			this.setAtTop(value);
		}else if(attr=='ate'){
			this.setAtTop(value);
			this.setLeft(value);
			this.setRight(value);
		}else if(attr=='ab'){
			this.setAtBottom(value);
		}else if(attr=='abe'){
			this.setAtBottom(value);
			this.setLeft(value);
			this.setRight(value);
		}else if(attr=='ml'){
			this.setMarginLeft(value);
		}else if(attr=='mr'){
			this.setMarginRight(value);
		}else if(attr=='mt'){
			this.setMarginTop(value);
		}else if(attr=='mb'){
			this.setMarginBottom(value);
		}else if(attr=='m'){
			var mValues = value.split(',');
			if(mValues.length==1){
				this.setMargins(value, value, value, value);
			}else if(mValues.length==4){
				this.setMargins(mValues[0], mValues[1], mValues[2], mValues[3]);
			}
		}else if(attr=='pl'){
			this.setPaddingLeft(value);
		}else if(attr=='pr'){
			this.setPaddingRight(value);
		}else if(attr=='pt'){
			this.setPaddingTop(value);
		}else if(attr=='pb'){
			this.setPaddingBottom(value);
		}else if(attr=='p'){
			var pValues = value.split(',');
			if(pValues.length==1){
				this.setPaddings(value, value, value, value);
			}else if(pValues.length==4){
				this.setPaddings(pValues[0], pValues[1], pValues[2], pValues[3]);
			}
		}else if(attr=='gh'){
			this.setGravityHorizontal(value);
		}else if(attr=='gv'){
			this.setGravityVertical(value);
		}else if(attr=='g'){
			var gValues = value.split(',');
			if(gValues.length==2){
				this.setGravity(gValues[0], gValues[1]);
			}
		}else if(attr=='cui'){
			if(value=='n'){
				this.childrenUI = false;
			}else{
				this.childrenUI = true;
			}
		}else if(attr=='sv'){
			this.setScrollVertical(true);
		}else if(attr=='sh'){
			this.setScrollHorizontal(true);
		}
	}
	
	//if no references we add one to the parent: top
	var refs = false;
	var references = this.getReferences();
	for(var i=0; i<references.length; i++){
		if(references[i].length>0){
			refs = true;
			break;
		}
	}
	if(!refs){
		this.setTop(parentId);
	}
	
}



