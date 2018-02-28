
/** 
 * @constructor
*/
function UIViewsManager(){

    //list of screens
    this.screens = {};

    //list of ids of screens
    this.screenIds = [];
}

/**
 * Add a screen to the manager
 * @param {UIView} screen 
 */
UIViewsManager.prototype.addScreen = function(screen){
    this.screens[screen.id] = screen;
    this.screenIds.push(screen.id);
}

UIViewsManager.prototype.elementAdded = function(element, attributeMain){
    
    //TODO check if has the attribute, else we search the first parent element with an attribute
    var firstElement = this.searchViewWithAttributeInTree(element, attributeMain);

    //TODO search parent

    //TODO generate the view

    //TODO generate all the children of the view

    //TODO add the view to the parent in the same position

    //TODO mark view and all dependency views as modified to calculate all necessary values

    //TODO search for new screens

    //TODO add new screens identifiers to be generated in next draw
}

UIViewsManager.prototype.elementRemoved = function(element){
    
    //TODO update screens
    
    //TODO check if has the attribute, else we search the first parent element with an attribute

    //TODO search parent

    //TODO generate the view

    //TODO generate all the children of the view

    //TODO add the view to the parent in the same position

    //TODO mark view and all dependency views as modified to calculate all necessary values

    //TODO search for new screens

    //TODO add new screens identifiers to be generated in next draw
}

UIViewsManager.prototype.updateScreen = function(screen){

}

UIViewsManager.prototype.removeView = function(view){

}

UIViewsManager.prototype.searchViewWithAttributeInTree = function(element, attributeMain){

    if(element && element.tagName!=null && element.getAttribute(attributeMain)!=null){
        return element;
    }

    //search in parent
    if(element.parentNode!=null){
        return this.searchViewWithAttributeInTree(element.parentNode, attributeMain);
    }else{
        return null;
    }
    
}

/**
 * Search in all the views of all screens a view, returning it
 * @param {string} viewId identifier to search
 */
UIViewsManager.prototype.searchViewWithId = function(viewId){

    /**
     * Search the view in recursive mode
     * @param {string} viewId identifier of the view
     * @param {UIView} view view
     */
    var searchView = function(viewId, view){
        
        //check if this is the view
        if(view.id == viewId){
            return view;
        }

        //check children
        view.forEachChild(function(viewChild, index){
            var child = searchView(viewId, viewChild);
            if(child!=null){
                return child;
            }
        });

        return null;
    }

    //search in screens
    for(var i=0; i<this.screenIds.length; i++){
        var view = searchView(viewId, this.screens[this.screenIds[i]]);
        if(view!=null){
            return view;
        }
    }

    //not found
    return null;

}