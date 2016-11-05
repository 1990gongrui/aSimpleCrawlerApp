var superagent = require("superagent");
var mongo = require('mongodb');
var monk = require('monk');
var data = require('./data');

var addItem = data.addItem;
// var db = monk('localhost:27017/test');
// var items = db.get('items');
superagent.get('http://120.27.33.180:8080/SCU_News_Notice/findPageNews/1/1')
.end(function(err, sers){
    if(err){
        console.log(err);
    }
    var array = JSON.parse(sers.text);
    array.forEach(function(el){
        superagent.get(el.content)
        .end(function(err, res){
            var title = el.title;
            var href = el.address;
            var itemDate = el.time;
            var pic = el.pic;
            var sectitle = '添加时间：' + itemDate + ' 访问次数：' + el.accessNum + ' ';
            addItem(res.text, title, href, sectitle, itemDate, pic);
        });
    });
});