window.addUrl = (obj) => {
	var url = obj.value;
	var urls = document.getElementById('urls').value.length === 0 ? [] : document.getElementById('urls').value.split(',');
	console.log(urls);
	var index = urls.indexOf(url);
	if( index === -1 ) {
		urls.push(url);
	}
	else {
		urls.splice(index, 1);
	}
	document.getElementById('urls').value = urls.toString();
}