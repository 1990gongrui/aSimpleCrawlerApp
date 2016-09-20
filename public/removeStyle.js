var detail = document.getElementById("detail");

//remove all styles in html tags

var tags = detail.getElementsByTagName("*");
for (var i = tags.length - 1; i >= 0; i--) {
	tags[i].removeAttribute("style");
}

//ad bootstrap classes for tables
var tables = detail.getElementsByTagName("table");
for (var i = tables.length - 1; i >= 0; i--) {
	tables[i].removeAttribute("width");
	tables[i].removeAttribute("height");
	tables[i].className = "table";
}

//add origin host to imgs

var imgs = detail.getElementsByTagName("img");
for (var i = imgs.length - 1; i >= 0; i--) {
	//parse url
	var strs1 = imgs[i].src.split("/");
	var pathcontent = "";
	for (var j = 3; j < strs1.length; j++) {
		pathcontent += ("/" + strs1[j]);
	}
	var sectitle = document.getElementById("sectitle");
	var links = sectitle.getElementsByTagName("a");
	var strs = links[0].href.split('/');
	imgs[i].src = "http://" + strs[2] + pathcontent;
}