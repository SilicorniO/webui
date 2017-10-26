
/** Limit size of a view **/
var VIEW_SIZE_LIMIT = 100000;

/**
* Generate a new parent view that is called screen
* @constructor
* @param views Array of views to add to the screen
* @param suffixs 
* @return Screen generated
**/
function createScreen(id, ele, views, suffixs){
	var screenView;
	if(ele!=null){
		screenView = createViewFromElement(ele, "", "", "ui", suffixs);
	}else{
		screenView = createView(id);
	}
	screenView.children = views;
	return {
		view: screenView,
		sizes: null
	};
}

/**
* Generate a new view for the indentifier received
* @constructor
* @param id String name of the element 
* @return View generated
**/
function createView(id){
	
	return {
		id: id,
		parentId: '',
		children: new Array(),
		childrenOrderHor: new Array(),
		childrenOrderVer: new Array(),
		childrenUI: true, 
		
		order: 0,
		orderNum: 0,
		dependencies: new Array(),
		
		leftLeft: '',
		leftRight: '',
		rightRight: '',
		rightLeft: '',
		topTop: '',
		topBottom: '',
		bottomBottom: '',
		bottomTop: '',
		
		sizeWidth: 'sc', //size_content
		sizeHeight: 'sc', //size_content
		
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		
		leftChanged: false,
		topChanged: false,
		rightChanged: false,
		bottomChanged: false,
		
		width: 0,
		height: 0,
		
		scrollVertical: false,
		scrollHorizontal: false,
        
        scrollVerticalApplied: false,
        scrollHorizontalApplied: false,
		
		percentWidth: 0,
		percentHeight: 0,
		percentLeft: 0,
		percentTop: 0,
		
		gravityHor: 'n',
		gravityVer: 'n',
		
		marginLeft: '0',
		marginTop: '0',
		marginRight: '0',
		marginBottom: '0',
		
		paddingLeft: 0,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
        
        replaced: false,
		
		setWidth: function(w){
			if(w=="sc"){
				this.sizeWidth = w;
				this.width = 0;
			}else if(String(w).indexOf('%')!=-1){
				var indexPercent = w.indexOf('%');
				this.percentWidth = parseFloat(w.substring(0, indexPercent));
				if(indexPercent<w.length-1){
					this.percentLeft = parseInt(w.substring(indexPercent+1, w.length));
				}
				this.sizeWidth = "sp"; //size_percent
			}else{
				this.width = parseInt(w); 
				this.sizeWidth = "s" //sized
			}
			},
			
		setHeight: function(h){
			if(h=="sc"){
				this.sizeHeight = h;
				this.height = 0;
			}else if(String(h).indexOf('%')!=-1){
				var indexPercent = h.indexOf('%');
				this.percentHeight = parseInt(h.substring(0, indexPercent));
				if(indexPercent<h.length-1){
					this.percentTop = parseInt(h.substring(indexPercent+1, h.length));
				}
				this.sizeHeight = "sp"; //size_percent
			}else{
				this.height = parseInt(h); 
				this.sizeHeight = "s" //sized
			}
			},
		
		setLeft: function(id){this.leftLeft = id},
		setRight: function(id){this.rightRight = id},
		setTop: function(id){this.topTop = id},
		setBottom: function(id){this.bottomBottom = id},
		setAtLeft: function(id){this.rightLeft = id},
		setAtRight: function(id){this.leftRight = id},
		setAtTop: function(id){this.bottomTop = id},
		setAtBottom: function(id){this.topBottom = id},
		
		setScrollVertical: function(id){this.scrollVertical = id},
		setScrollHorizontal: function(id){this.scrollHorizontal = id},
		
		setGravityHorizontal: function(gravity){ this.gravityHor = gravity},
		setGravityVertical: function(gravity){ this.gravityVer = gravity},
		setGravity: function(gravityHor, gravityVer){ 
			this.gravityHor = gravityHor,
			this.gravityVer = gravityVer
			},
		
		setMarginLeft: function(margin){this.marginLeft = margin},
		setMarginTop: function(margin){this.marginTop = margin},
		setMarginRight: function(margin){this.marginRight = margin},
		setMarginBottom: function(margin){this.marginBottom = margin},
		setMargins: function(marginLeft, marginTop, marginRight, marginBottom){
			this.marginLeft = marginLeft;
			this.marginTop = marginTop;
			this.marginRight = marginRight;
			this.marginBottom = marginBottom;
			},
			
		setPaddingLeft: function(padding){this.paddingLeft = padding},
		setPaddingTop: function(padding){this.paddingTop = padding},
		setPaddingRight: function(padding){this.paddingRight = padding},
		setPaddingBottom: function(padding){this.paddingBottom = padding},
		setPaddings: function(paddingLeft, paddingTop, paddingRight, paddingBottom){
			this.paddingLeft = paddingLeft;
			this.paddingTop = paddingTop;
			this.paddingRight = paddingRight;
			this.paddingBottom = paddingBottom;
			},
			
		getReferences: function(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft, this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];},
		
		getReferencesHor: function(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft];},
		
		getReferencesVer: function(){ return [this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];},
		
		setReference: function(i, value){
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
		},
        
        //search the son in the arrays and replace them
        replaceSon: function(son){
            
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
            
        },
		
		clean: function(){
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
		},
		
		applyDimens: function(coreConfig){
			
			this.paddingLeft = coreConfig.getDimen(this.paddingLeft);
			this.paddingRight = coreConfig.getDimen(this.paddingRight);
			this.paddingTop = coreConfig.getDimen(this.paddingTop);
			this.paddingBottom = coreConfig.getDimen(this.paddingBottom);
			
			this.marginLeft = coreConfig.getDimen(this.marginLeft);
			this.marginRight = coreConfig.getDimen(this.marginRight);
			this.marginTop = coreConfig.getDimen(this.marginTop);
			this.marginbottom = coreConfig.getDimen(this.marginBottom);
			
		},
        
        clone: function(){
            
            //create a new instance
            var view = createView(id);
            
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
        },
		
		toString: function(){
			return "[" + id + "]: ll:" + this.leftLeft + ", lr:" + this.leftRight + ", rr:" + this.rightRight + ", rl:" + this.rightLeft + ", tt:" + this.topTop + ",tb: " + this.topBottom + ", bb:" + this.bottomBottom + ", bt:" + this.bottomTop + ", ml:" + this.marginLeft + ", mr:" + this.marginRight + ", mt:" + this.marginTop + ",mb: " + this.marginBottom + ", pl:" + this.paddingLeft + ", pr:" + this.paddingRight + ", pt:" + this.paddingTop + ", pb:" + this.paddingBottom + ", w:" + this.width + ", h:" + this.height + ", sh:" + this.sizeWidth + ", sh:" + this.sizeHeight + ", pId:" + this.parentId + ", l:" + this.left + ", r:" + this.right + ", t:" + this.top + ", b:" + this.bottom;
		}
	};
	
}

/**
* Create a view object reading the HTML of the element 
* @param element where to read data
* @param parentId to assign to the view created
* @param lastViewId with the identifier of the view before
* @param attributeMain with the name of the attribute to read
* @param attributeSuffixs with the name of the attributes to read as secondary
* @return View generated
**/
function createViewFromElement(element, parentId, lastViewId, attributeMain, attributeSuffixs){

	//create the view and assign the parent identifier
	var view = createView(element.id);
	view.parentId = parentId;
	
	//array of attributes read
	var aValues;
	
	//read main attributes
	var aValues = readAttributes(element.getAttribute(attributeMain));
	for(var i=0; i<attributeSuffixs.length; i++){
		aValues = aValues.concat(readAttributes(element.getAttribute(attributeMain+attributeSuffixs[i])));
	}
	
	//check if we have attributes
	if(aValues.length==0){
		return view;
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
			view.setWidth(value);		
		}else if(attr=='h'){
			view.setHeight(value);
		}else if(attr=='l'){
			view.setLeft(value);
		}else if(attr=='r'){
			view.setRight(value);
		}else if(attr=='t'){
			view.setTop(value);
		}else if(attr=='b'){
			view.setBottom(value);
		}else if(attr=='al'){
			view.setAtLeft(value);
		}else if(attr=='ale'){
			view.setAtLeft(value);
			view.setTop(value);
			view.setBottom(value);
		}else if(attr=='ar'){
			view.setAtRight(value);
		}else if(attr=='are'){
			view.setAtRight(value);
			view.setTop(value);
			view.setBottom(value);
		}else if(attr=='at'){
			view.setAtTop(value);
		}else if(attr=='ate'){
			view.setAtTop(value);
			view.setLeft(value);
			view.setRight(value);
		}else if(attr=='ab'){
			view.setAtBottom(value);
		}else if(attr=='abe'){
			view.setAtBottom(value);
			view.setLeft(value);
			view.setRight(value);
		}else if(attr=='ml'){
			view.setMarginLeft(value);
		}else if(attr=='mr'){
			view.setMarginRight(value);
		}else if(attr=='mt'){
			view.setMarginTop(value);
		}else if(attr=='mb'){
			view.setMarginBottom(value);
		}else if(attr=='m'){
			var mValues = value.split(',');
			if(mValues.length==1){
				view.setMargins(value, value, value, value);
			}else if(mValues.length==4){
				view.setMargins(mValues[0], mValues[1], mValues[2], mValues[3]);
			}
		}else if(attr=='pl'){
			view.setPaddingLeft(value);
		}else if(attr=='pr'){
			view.setPaddingRight(value);
		}else if(attr=='pt'){
			view.setPaddingTop(value);
		}else if(attr=='pb'){
			view.setPaddingBottom(value);
		}else if(attr=='p'){
			var pValues = value.split(',');
			if(pValues.length==1){
				view.setPaddings(value, value, value, value);
			}else if(pValues.length==4){
				view.setPaddings(pValues[0], pValues[1], pValues[2], pValues[3]);
			}
		}else if(attr=='gh'){
			view.setGravityHorizontal(value);
		}else if(attr=='gv'){
			view.setGravityVertical(value);
		}else if(attr=='g'){
			var gValues = value.split(',');
			if(gValues.length==2){
				view.setGravity(gValues[0], gValues[1]);
			}
		}else if(attr=='cui'){
			if(value=='n'){
				view.childrenUI = false;
			}else{
				view.childrenUI = true;
			}
		}else if(attr=='sv'){
			view.setScrollVertical(true);
		}else if(attr=='sh'){
			view.setScrollHorizontal(true);
		}
	}
	
	//if no references we add one to the parent: top
	var refs = false;
	var references = view.getReferences();
	for(var i=0; i<references.length; i++){
		if(references[i].length>0){
			refs = true;
			break;
		}
	}
	if(!refs){
		view.setTop(parentId);
	}
	
	return view;
}

/**
* Read the list of attributes received in a text
* @param text String with the text to parse
* @return array of objects with key and value
**/
function readAttributes(text){
	
	//check text is not null
	if(text==null){
		return new Array();
	}
	
	//split the text
	var aValues = text.replace(' ', '').split(';');
	
	//for each value read the value and key adding it to an array
	var aAttributes = new Array();
	for(var i=0; i<aValues.length; i++){
		var aValue = aValues[i].split(':');
		if(aValue.length==2){
			aAttributes.push({ attr: aValue[0], value: aValue[1] });
		}else if(aValue.length==1){
			aAttributes.push({ attr: aValue[0], value: '' });
		}
	}
	
	//return array of attr-values
	return aAttributes;
}

/**
* Update the width of the view received
* @param view View to change the height
* @param ele DOM element to calculate the width
**/
function updateWidthView(view, ele){
            
    //prepare parent to give the son a lot of space for calculation
    var parent = ele.parentElement;
    var parentWidth = parent.offsetWidth;
    var parentScrollLeft = parent.scrollLeft;
    parent.style.width = VIEW_SIZE_LIMIT;
    	
    //get the height width much space
	ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    ele.style.height = 'auto';
	view.width = ele.offsetWidth;
	
    //increment for text calculations error
	if(view.width>0){
		view.width++;
	}
    
    //set values of parent back 
    parent.style.width = parentWidth;
    parent.scrollLeft = parentScrollLeft;
}

/**
* Update the height of the view received
* @param view View to change the height
* @param ele DOM element to calculate the height
**/
function updateHeightView(view, ele){
        
    //prepare parent to give the son a lot of space for calculation
    var parent = ele.parentElement;
    var parentHeight = parent.offsetHeight;
    var parentScrollTop = parent.scrollTop;
    parent.style.height = VIEW_SIZE_LIMIT;
    	    
    //get the width height much space
	ele.style.display = 'inline-block';
    ele.style.width = 'auto';
    ele.style.height = 'auto';
	view.height = ele.offsetHeight;
    	
    //increment for text calculations error
	if(view.height>0){
		view.height++;
	}
    
    //set values of parent back 
    parent.style.height = parentHeight;
    parent.scrollTop = parentScrollTop;
}

