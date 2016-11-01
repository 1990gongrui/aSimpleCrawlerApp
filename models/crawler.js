var superagent = require("superagent");
var cheerio = require("cheerio");
var mongo = require('mongodb');
var monk = require('monk');

crawler = function(address){
	var db = monk('localhost:27017/test');
	var items = db.get('items');
	console.log('crawler is running.');
	superagent.get(address)
	.end(function(err, sres){
		if (err) {
			console.log(err);
		}
		var $ = cheerio.load(sres.text);
		$('#rbody ul.xwlist li').each(function(index, el) {
			var $el = $(el).find('a');

			superagent.get('http://yz.scu.edu.cn' + $el.attr('href'))
			.end(function(err, detail){
				if (err) {
					console.log(err);
				}
				var $detail = cheerio.load(detail.text);
				var $de = $detail('#rbody .xwcontent');
				var sectitle = $detail('#rbody .sectitle').text();

				//将字符串转换为Date对象
				var tempArray = sectitle.split('\r\n')[1];
					var strArray = tempArray.split(' ');
					var dateArray = strArray[9].split('-');
					var timeArray = strArray[10].split(':');
					//转换时区，差8个小时
					var itemDate = new Date(dateArray[0],parseInt(dateArray[1])-1,dateArray[2],parseInt(timeArray[0])+8,timeArray[1]);
				
				var preview = $de.text().substring(0, 200);
				if (preview.length >= 200) {
					preview += ' ...';
				}

				var item = {
					title: $el.text(),
					href: 'http://yz.scu.edu.cn' + $el.attr('href'),
					detail: $de.html(),
					preview: preview,
					sectitle: sectitle,
					date: itemDate
				};
				items.insert(item);
				console.log('Result: '+ item.href);
			});
		});
	});
}

exports.crawler = crawler;