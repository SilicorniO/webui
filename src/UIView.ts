import UILog from "./general/UILog"
import UIUtils from "./utils/UIUtils"

export default class UIView {

	id: string
	element: HTMLElement
	parent: UIView
	screen: UIView

	childrenOrderHor: UIView[] = []
	childrenOrderVer: UIView[] = []
	childrenUI: boolean = true

	order: number = 0
	orderNum: number = 0
	dependenciesHor: string[] = []
	dependenciesVer: string[] = []

	leftLeft: string = ""
	leftRight: string = ""
	rightRight: string = ""
	rightLeft: string = ""
	topTop: string = ""
	topBottom: string = ""
	bottomBottom: string = ""
	bottomTop: string = ""

	sizeWidth: string = "sc"
	sizeHeight: string = "sc"

	widthValue: number = 0
	heightValue: number = 0

	percentWidthPos: number = 0
	percentHeightPos: number = 0

	scrollVertical: boolean = false
	scrollHorizontal: boolean = false

	centerHor: boolean = false
	centerVer: boolean = false

	marginLeftDimen: string = "0"
	marginTopDimen: string = "0"
	marginRightDimen: string = "0"
	marginBottomDimen: string = "0"

	paddingLeftDimen: string = "0"
	paddingTopDimen: string = "0"
	paddingRightDimen: string = "0"
	paddingBottomDimen: string = "0"

	visibility: string = "v"

	//animations
	animationDurations: number[] = []
	
	//----- calculated -----

	width: number = 0
	height: number = 0

	left: number = 0
	top: number = 0
	right: number = 0
	bottom: number = 0
	
	leftChanged: boolean = false
	topChanged: boolean = false
	rightChanged: boolean = false
	bottomChanged: boolean = false
	
	scrollVerticalApplied: boolean = false
	scrollHorizontalApplied: boolean = false
	
	marginLeft: number = 0
	marginTop: number = 0
	marginRight: number = 0
	marginBottom: number = 0

	paddingLeft: number = 0
	paddingTop: number = 0
	paddingRight: number = 0
	paddingBottom: number = 0

	//----- Flags for changes -----
	sizeLoaded: boolean = false;
	childrenInOrder: boolean = false;

	/**
	* Create a view object reading the HTML of the element 
	* @constructor
	* @param element where to read data
	* @param {UIView=} parent to assign to the view created
	* @param {UIView=} screen to assign to the view created
	* @param {string=} attributeMain with the name of the attribute to read
	* @param {Array<string>=} attributes with the name of the attributes to read as secondary
	**/
	constructor(
		element: HTMLElement,
		parent: UIView,
		screen: UIView,
		attributeMain: string,
		attributes: string[],
	){

		this.id = element.id
		this.element = element
		this.parent = parent
		this.screen = screen

		//----- INIT -----
		this.init(attributeMain, attributes)
	}

	private init(attributeMain: string, attributes: string[]) {

		//initialize
		this.readUI(this.element, attributeMain, attributes);

		//set this instance into the element
		// this.element.ui = this
		this.element["ui"] = this
	}

	public setWidth(w: string){
		if (w=="sc") {
			this.sizeWidth = w;
			this.widthValue = 0;
		} else if(String(w).indexOf('%')!=-1) {
			var indexPercent = w.indexOf('%');
			this.widthValue = parseFloat(w.substring(0, indexPercent));
			if(indexPercent<w.length-1){
				this.percentWidthPos = parseInt(w.substring(indexPercent+1, w.length), 10);
			}
			this.sizeWidth = "sp"; //size_percent
		} else {
			this.widthValue = parseInt(w, 10); 
			this.sizeWidth = "s" //sized
		}
		this.sizeLoaded = false;
	}

	public setHeight(h: string){
		if(h=="sc"){
			this.sizeHeight = h;
			this.heightValue = 0;
		}else if(String(h).indexOf('%')!=-1){
			var indexPercent = h.indexOf('%');
			this.heightValue = parseInt(h.substring(0, indexPercent), 10);
			if(indexPercent<h.length-1){
				this.percentHeightPos = parseInt(h.substring(indexPercent+1, h.length), 10);
			}
			this.sizeHeight = "sp"; //size_percent
		}else{
			this.heightValue = parseInt(h, 10); 
			this.sizeHeight = "s" //sized
		}
		this.sizeLoaded = false;
	}

	public setLeft(id: string){
		this.leftLeft = id;
		this.sizeLoaded = false;
	};
	public setRight(id: string){
		this.rightRight = id;
		this.sizeLoaded = false;
	};
	public setTop(id: string){
		this.topTop = id;
		this.sizeLoaded = false;
	};
	public setBottom(id: string){
		this.bottomBottom = id;
		this.sizeLoaded = false;
	};
	public setAtLeft(id: string){
		this.rightLeft = id;
		this.sizeLoaded = false;
	};
	public setAtRight(id: string){
		this.leftRight = id;
		this.sizeLoaded = false;
	};
	public setAtTop(id: string){
		this.bottomTop = id;
		this.sizeLoaded = false;
	};
	public setAtBottom(id: string){
		this.topBottom = id;
		this.sizeLoaded = false;
	};
			
	private setScrollVertical(value: boolean){
		this.scrollVertical = value
	};
	private setScrollHorizontal(value: boolean){
		this.scrollHorizontal = value
	};

	public setCenterVertical(value: boolean){
		this.centerVer = value
	}
	public setCenterHorizontal(value: boolean){
		this.centerHor = value
	}
			
	public setMarginLeft(margin: string){
		this.marginLeftDimen = margin;
		this.sizeLoaded = false;
	};
	public setMarginTop(margin: string){
		this.marginTopDimen = margin;
		this.sizeLoaded = false;
	};
	public setMarginRight(margin: string){
		this.marginRightDimen = margin;
		this.sizeLoaded = false;
	};
	public setMarginBottom(margin: string){
		this.marginBottomDimen = margin;
		this.sizeLoaded = false;
	};
	public setMargins(
		marginLeft: string,
		marginTop: string,
		marginRight: string,
		marginBottom: string,
	){
		this.marginLeftDimen = marginLeft;
		this.marginTopDimen = marginTop;
		this.marginRightDimen = marginRight;
		this.marginBottomDimen = marginBottom;
		this.sizeLoaded = false;
	};
				
	public setPaddingLeft(padding: string){
		this.paddingLeftDimen = padding;
		this.sizeLoaded = false;
	};
	public setPaddingTop(padding: string){
		this.paddingTopDimen = padding;
		this.sizeLoaded = false;
	};
	public setPaddingRight(padding: string){
		this.paddingRightDimen = padding;
		this.sizeLoaded = false;
	};
	public setPaddingBottom(padding: string){
		this.paddingBottomDimen = padding;
		this.sizeLoaded = false;
	};
	public setPaddings(
		paddingLeft: string,
		paddingTop: string,
		paddingRight: string,
		paddingBottom: string,
	){
		this.paddingLeftDimen = paddingLeft;
		this.paddingTopDimen = paddingTop;
		this.paddingRightDimen = paddingRight;
		this.paddingBottomDimen = paddingBottom;
		this.sizeLoaded = false;
	};

	public setVisibility(visibility: string) {
		if (visibility != 'g' && this.visibility == 'g') {
			this.sizeLoaded = false;
		}
		this.visibility = visibility;
	}

	private cleanSizeLoaded() {

		//clean the sizeLoaded of this view
		this.sizeLoaded = false;

		//if it has parent and the size depend of children we clean it too
		if (this.parent != null && 
			(this.parent.sizeHeight == 'sc' || this.parent.sizeWidth == 'sc') ) {
			this.parent.cleanSizeLoaded();
		}
	}

	private hasToBeCalculated() {
		return this.visibility != 'g';
	}

	public animateNextRefresh(animationDuration: number) {
		// this.animationDurations.push(animationDuration);

		//animate all views from parent
		if (this.parent) {
			this.parent.animateDependencies(animationDuration);
		} else {
			this.animateDependencies(animationDuration);
		}
	}

	private animateDependencies(animationDuration: number) {

		//animate this
		this.animationDurations.push(animationDuration);
		
		//animate children
		this.forEachChild((child: UIView) => {
			child.animateDependencies(animationDuration);
		});

	}
				
	private getReferences(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft, this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];};
			
	public getReferencesHor(){ return [this.leftLeft, this.leftRight, this.rightRight, this.rightLeft];};
			
	public getReferencesVer(){ return [this.topTop, this.topBottom, this.bottomBottom, this.bottomTop];};
			
	private setReference(i: number, value: string){
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

	/** 
	 * Check if this view has UI children
	 * @return {boolean} TRUE if has children
	*/
	public hasUIChildren(): boolean {
		var children = this.element.childNodes;
		for(var i=0; i<children.length; i++){
			if(children[i].ui){
				return true
			}
		}

		return false
	}

	/** 
	 * Get the children elements (childNodes)
	 * @return {Array<*>} Array of elements
	*/
	public getChildElements(){
		return this.element.childNodes;
	}

	/**
	 * Call to callback for each child with UI
	 * @param cb 
	 */
	public forEachChild(cb: (child: UIView, i: number) => void){
		var children = this.element.childNodes;
		for(var i=0; i<children.length; i++){
			var child = children[i].ui;
			if(child){
				cb(child, i);
			}
		}
	}

	private getPreviousView() {

		var previousView = null;

		//if it is an screen there is not a previous view
		if (this.parent == null) {
			return null;
		}

		var childNodes = this.parent.element.childNodes;
		for(var i=0; i<childNodes.length; i++){
			var child = childNodes[i].ui;
			if (child) {
				if (child.id == this.id) {
					return previousView;
				} else if (child.hasToBeCalculated()){
					previousView = child;
				}
			}
		}

		//not found
		return null;
	} 
			
	private clean(){
		this.cleanHor();
		this.cleanVer();
	};

	private cleanHor(){
		this.leftChanged = false;
		this.rightChanged = false;

		this.left = 0;
		this.right = 0;
		this.width = 0;
	}

	private cleanVer(){
		this.topChanged = false;
		this.bottomChanged = false;

		this.top = 0;
		this.bottom = 0;
		this.height = 0;
	}

	private cleanUI() {
		
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

		this.widthValue = 0;
		this.heightValue = 0;

		this.percentWidthPos = 0;
		this.percentHeightPos = 0;

		this.scrollVertical = false;
		this.scrollHorizontal = false;

		this.centerHor = false;
		this.centerVer = false;

		this.marginLeftDimen = "0";
		this.marginTopDimen = "0";
		this.marginRightDimen = "0";
		this.marginBottomDimen = "0";

		this.paddingLeftDimen = "0";
		this.paddingTopDimen = "0";
		this.paddingRightDimen = "0";
		this.paddingBottomDimen = "0";
	}

	private applyDimens(coreConfig){
		
		this.paddingLeft = coreConfig.getDimen(this.paddingLeftDimen);
		this.paddingRight = coreConfig.getDimen(this.paddingRightDimen);
		this.paddingTop = coreConfig.getDimen(this.paddingTopDimen);
		this.paddingBottom = coreConfig.getDimen(this.paddingBottomDimen);
		
		this.marginLeft = coreConfig.getDimen(this.marginLeftDimen);
		this.marginRight = coreConfig.getDimen(this.marginRightDimen);
		this.marginTop = coreConfig.getDimen(this.marginTopDimen);
		this.marginBottom = coreConfig.getDimen(this.marginBottomDimen);
		
	};
			
	private toString(){
		return "[" + this.id + "]: ll:" + this.leftLeft + ", lr:" + this.leftRight + ", rr:" + this.rightRight + ", rl:" + this.rightLeft + 
			", tt:" + this.topTop + ",tb: " + this.topBottom + ", bb:" + this.bottomBottom + ", bt:" + this.bottomTop + ", ml:" + this.marginLeft + 
			", mr:" + this.marginRight + ", mt:" + this.marginTop + ",mb: " + this.marginBottom + ", pl:" + this.paddingLeft + ", pr:" + this.paddingRight + 
			", pt:" + this.paddingTop + ", pb:" + this.paddingBottom + ", w:" + this.width + ", h:" + this.height + ", sh:" + this.sizeWidth + ", sh:" + 
			this.sizeHeight + ", pId:" + (this.parent? this.parent.id : "") + ", l:" + this.left + ", r:" + this.right + ", t:" + this.top + ", b:" + this.bottom;
	}

	/**
	* Create a view object reading the HTML of the element 
	* @param element where to read data
	* @param attributeMain with the name of the attribute to read
	* @param attributes with the name of the attributes to read as secondary
	* @return View generated
	**/
	private readUI(
		element: HTMLElement,
		attributeMain: string,
		attributes: string[],
	){
		
		//read main attributes
		var aValues = UIUtils.readAttributes(element.getAttribute(attributeMain));
		for(var i=0; i<attributes.length; i++){
			aValues = aValues.concat(UIUtils.readAttributes(element.getAttribute(attributes[i])));
		}
		
		//check if we have attributes
		if(aValues.length==0){
			return;
		}
			
		//set the ui values
		for(var i=0; i<aValues.length; i++){
			
			var attr = aValues[i].attr;
			var value = aValues[i].value;
						
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
			} else if (attr == 'cv') {
				this.setCenterVertical(true);
			} else if (attr == 'ch') {
				this.setCenterHorizontal(true);
			} else if (attr == 'c') {
				this.setCenterVertical(true);
				this.setCenterHorizontal(true);

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
			
			}else if(attr=='v'){
				this.setVisibility(value);
			
			} else if(attr.length > 0) {
				UILog.logW("Attribute unknown: " + attr + " in view " + this.id);
			}
		}
		
		//if no references we add one to the parent: top
		// var refs = false;
		// var references = this.getReferences();
		// for(var i=0; i<references.length; i++){
		// 	if(references[i].length>0){
		// 		refs = true;
		// 		break;
		// 	}
		// }
		var refsHor = false;
		var referencesHor = this.getReferencesHor();
		for(var i=0; i<referencesHor.length; i++){
			if(referencesHor[i].length>0){
				refsHor = true;
				break;
			}
		}
		if (!refsHor && !this.centerHor) {
			this.setLeft('p');
		}

		var refsVer = false;
		var referencesVer = this.getReferencesVer();
		for(var i=0; i<referencesVer.length; i++){
			if(referencesVer[i].length>0){
				refsVer = true;
				break;
			}
		}
		if (!refsVer && !this.centerVer) {
			this.setTop('p');
		}

		// if(!refs){
		// 	this.setTop(parentId);
		// }
		
	}

}