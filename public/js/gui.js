var lastText;
var inputPane = document.getElementById('markdown-input');
var previewPane = document.getElementById('preview-pane');

inputPane.onkeyup = function(){
    convertText();
}
inputPane.onmouseup = function(){
    convertText();
}

marked;

function convertText() {
	var text = inputPane.value;

	if (text && text == lastText) {
		return;
	} else {
		lastText = text;
	}

	var startTime = new Date().getTime();

	// Do the conversion
    text = marked(text);

	// display processing time
	var endTime = new Date().getTime();	
	processingTime = endTime - startTime;
	//document.getElementById("processingTime").innerHTML = processingTime+" ms";
    
    console.log('processingTime: '+ processingTime);

	// save proportional scroll positions
	//saveScrollPositions();


	previewPane.innerHTML = text;



	// restore proportional scroll positions
	//restoreScrollPositions();
};
