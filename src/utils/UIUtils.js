
/** 
 * @constructor
*/
function UIUtils(){

}

/**
* Read the list of attributes received in a text
* @param text String with the text to parse
* @return array of objects with key and value
**/
UIUtils.prototype.readAttributes = function(text){
	
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