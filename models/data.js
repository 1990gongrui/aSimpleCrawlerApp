var cheerio = require("cheerio");
var mongo = require('mongodb');
var monk = require('monk');

function addItem(text, title, href, sectitle, itemDate, pic){
    var db = monk('localhost:27017/test');
	var items = db.get('items');
    var $el = cheerio.load(text);
    var preview = $el.text().substring(0, 200);
    if (preview.length >= 200) {
        preview += ' ...';
    }
    var item = {
        title: title,
        href: href,
        detail: $el.html(),
        preview: preview,
        sectitle: sectitle,
        date: itemDate,
        pic: pic
    };
    items.insert(item);
    console.log('Result: '+ item.href);
}

exports.addItem = addItem;