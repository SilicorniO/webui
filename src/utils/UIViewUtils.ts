import UIView from "../UIView";

/** 
 * @constructor
*/
export default class UIViewUtils {

	/**
	* Update the width of the view received
	* @param view UIView to change the height
	* @param ele DOM element to calculate the width
	* @return width calculated
	**/
	public static calculateWidthView(
		view: UIView,
		ele: HTMLElement,
		index: number,
		infiniteParent: HTMLElement,
	){
		
		//prepare parent to give the son a lot of space for calculation
		// var parent = ele.parentElement;
		// var parentWidth = parent.offsetWidth;
		// var parentScrollLeft = parent.scrollLeft;
		// parent.style.width = 10000;
			
		//get the height width much space
		ele.style.position = 'fixed';
		// ele.style.display = 'inline-block';
		ele.style.width = 'auto';
		// ele.style.height = 'auto';
		var width = ele.offsetWidth;
		
		//increment for text calculations error
		if(width>0){
			width++;
		}
		
		//set values of parent back 
		// parent.style.width = parentWidth;
		// parent.scrollLeft = parentScrollLeft;
		
		return width;
	}

	/**
	* Update the height of the view received
	* @param view UIView to change the height
	* @param ele DOM element to calculate the height
	* @return height calculated
	**/
	public static calculateHeightView(
		view: UIView,
		ele: HTMLElement,
		index: number,
		infiniteParent: HTMLElement,
	){
			
		//prepare parent to give the son a lot of space for calculation
		// var parent = ele.parentElement;
		// var parentHeight = parent.offsetHeight;
		// var parentScrollTop = parent.scrollTop;
		// parent.style.height = 10000;
				
		//get the width height much space
		ele.style.position = 'fixed';
		// ele.style.display = 'inline-block';
		// ele.style.width = 'auto';
		ele.style.height = 'auto';
		var height = ele.offsetHeight;
			
		//increment for text calculations error
		if(height>0){
			height++;
		}
		
		//set values of parent back 
		// parent.style.height = parentHeight;
		// parent.scrollTop = parentScrollTop;

		return height;
	}

	/**
	* Update the width of the view received
	* @param view View to change the height
	* @param ele DOM element to calculate the width
	**/
	public static calculateWidthViewSlow(view: UIView, ele: HTMLElement){
				
		//prepare parent to give the son a lot of space for calculation
		var parent = ele.parentElement;
		var parentWidth = parent.offsetWidth;
		var parentScrollLeft = parent.scrollLeft;
		parent.style.width = 10000;
			
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
		parent.style.width = parentWidth;
		parent.scrollLeft = parentScrollLeft;
		
		return width;
	}

	/**
	* Update the height of the view received
	* @param view View to change the height
	* @param ele DOM element to calculate the height
	**/
	public static calculateHeightViewSlow(
		view: UIView,
		ele: HTMLElement,
	){
			
		//prepare parent to give the son a lot of space for calculation
		var parent = ele.parentElement;
		var parentHeight = parent.offsetHeight;
		var parentScrollTop = parent.scrollTop;
		parent.style.height = 10000;
				
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
		parent.style.height = parentHeight;
		parent.scrollTop = parentScrollTop;

		return height;
	}

	//generate list of indexes
	public static generateIndexes(
		elements: HTMLElement[],
	): { [key: string]: number } {
			
		var indexes: { [key: string]: number } = {}
			
		for(var i=0; i<elements.length; i++){
			if(elements[i].id){
				indexes[elements[i].id] = i;
			}
		}
		
		return indexes;
	}

	/**
	* Generate an array of views from one parent view
	* @param {UIView} view View to read, recursive by children
	* @param {Array<UIView>=} aViews Array of views used to add view
	* @return {Array<UIView>} array of views
	**/
	public static generateArrayViews(
		view: UIView,
		aViews: UIView[],
	): UIView[] {
		
		if(aViews==null){
			aViews = new Array();
		}
		
		//add the view
		aViews.push(view);
		
		//add the children
		view.forEachChild(((child: UIView, _index: number) => {
			this.generateArrayViews(child, aViews);
		}).bind(this));
		
		return aViews;
	}

	/**
	 * Search views wich have the given view as dependency. 
	 * Only search in same parent views
	 * @param {UIView} view UIView reference
	 * @param {boolean} hor TRUE for searching horizontal dependency
	 * @param {boolean} ver TRUE for searching vertical dependency
	 * @return {Array<UIView>} Array of views with dependency of the given view
	 */
	public static getViewsWithDependencyForView(
		view: UIView,
		hor: boolean,
		ver: boolean,
	): UIView[] {

		//generate the array with the views to return
		var dependencyViews: UIView[] = [];

		//check has parent, else we return empty array
		if(!view.parent){
			return dependencyViews;
		}

		//get the views of the parent
		var viewId = view.id;
		view.parent.forEachChild(function(parentChild, index){
			
			if(
				(hor && parentChild.dependenciesHor.includes(viewId)) || 
				(ver && parentChild.dependenciesVer.includes(viewId))
			){
				dependencyViews.push(parentChild);
			}

		});

		//return the list of views with dependencies
		return dependencyViews;

	}

}
