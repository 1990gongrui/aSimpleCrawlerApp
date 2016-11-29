var express = require("express");
var mongo = require('mongodb');
var monk = require('monk');
var hbs = require("hbs");
var fs = require('fs');
var sqlite3 = require('sqlite3');

var app = express();
var db = monk('localhost:27017/test');

var dbs = new sqlite3.Database('./Update/test.db');

app.use(express.static('public'));
app.set('view engine', 'html');
app.engine('html', hbs.__express);

// Make our db accessible to our router
// app.use(function(req,res,next){
//     req.db = db;
//     next();
// });
var items = db.get('items');

//get current time
function getCurTime(){
    var curdate = new Date();
    return curdate.toLocaleString();
}

//wirte log
function logWrite(str){
    fs.open('./data.log', 'a+', function(err, fd){
        if(err){
            console.log(err);
        }
        fs.appendFile(fd, str, function(err){
            if(err){
                console.log(err);
            }
            fs.close(fd, function(){

            });
        });
    });

}

app.get('/', function(req, res){
	res.redirect('/all/all/1');
});

app.get('/:inst/:type/:p', function(req, res){
	var page = parseInt(req.params.p) || 1;
	var type = (req.params.type == 'all') ? '%' : req.params.type;
	var institution = req.params.inst;
	var sql1, sql2;
	var params = [];
	params.push(type);
	if (institution === 'all') {
		sql1 = 'select count(*) as count from ARTICLE where TAGS like ?';
		sql2 = 'select * from ARTICLE, INSTITUTION where INSTITUTION.ID = ARTICLE.INSTITUTIONID and TAGS like ? order by date(TIME)';
	}
	else {
		sql1 = 'select count(*) as count from ARTICLE where TAGS like ? and INSTITUTIONID like ?';
		sql2 = 'select * from ARTICLE, INSTITUTION where INSTITUTION.ID = ARTICLE.INSTITUTIONID and TAGS like ? and INSTITUTIONID = ? order by date(TIME)'
		params.push(institution);
	}
	dbs.all(sql1, params, function(err, count){
		if(err) console.log(err);
		dbs.all(sql2, params, function(err, docs){
			if(err) console.log(err);
			var pagenumber = Math.ceil((count[0].count)/10);
			var pages = [];
			for(var i = 1; i <= pagenumber; i++){
				pages.push({
					'page': i
				});
			}	
			var curPage = {};
			curPage.page = page;
			curPage.firstPage = 1;
			curPage.lastPage = pagenumber;
			curPage.pagenumber = pagenumber;			
			curPage.prePage = page-1;
			curPage.nextPage = page+1;
			curPage.curType = (type == '%') ? 'all' : type;
			curPage.curInst = institution;			
			
			if(curPage.curType == 'all'){
				curPage.curTypeName = '默认';
			}
			else if(curPage.curType == 'notice'){
				curPage.curTypeName = '通知';
			}
			else if(curPage.curType == 'news'){
				curPage.curTypeName = '新闻';
			}

			var pageRange = {};
			if(curPage.page-5 > 0&&curPage.page+5 < pagenumber){
				pageRange.start = curPage.page - 5;
				pageRange.end = pageRange.start + 10;
			}
			else if(curPage.page-5 <= 0){
				pageRange.start = 0;
				pageRange.end = pageRange.start + 10;
			}
			else if(curPage.page+5 >= pagenumber){
				pageRange.end = pagenumber;
				pageRange.start = pageRange.end - 10;
			}
			if(curPage.curInst =='all') curPage.curInstName = '所有学院';
			else {
				dbs.all('select * from INSTITUTION where ID = ?', [curPage.curInst], function(err, name){
					if(err) console.log(err);
					curPage.curInstName = name[0].NAME;
				});
			}
			docs.slice((page-1)*10, page*10-1).forEach(function(ele){
				if(!ele.PREPICURL){
					ele.PREPICURL = '/imgs/timg.jpeg';
				}
				ele.curType = (type == '%') ? 'all' : type;
				if(ele.TAGS == '%'){
					ele.curTypeName = '默认';
				}
				else if(ele.TAGS == 'notice'){
					ele.curTypeName = '通知';
				}
				else if(ele.TAGS == 'news'){
					ele.curTypeName = '新闻';
				}
				ele.curInst = institution;
				if(institution == 'all'){
					ele.Name = '暂无';	
				}
			});
			var remoteAddress = req.connection.remoteAddress.substr(7);
			var log = getCurTime() + '\nRequest for ' + req.path + ' received.\nFrom:' + remoteAddress + '\n';
			logWrite(log);
			dbs.all('select * from INSTITUTION', function(err, instList){
				if(err) console.log(err);
				instList.forEach(function(ele){
					ele.curType = curPage.curType;
				});
				res.render('index', {entries: docs.slice((page-1)*10, page*10-1), pages: pages.slice(pageRange.start, pageRange.end), curPage: curPage, instList: instList});	
			});
		});
	});
});

app.get('/article/:id', function(req, res){
	var id = req.params.id;

	//mongodb version

	// items.find({'_id': id}, function(err, docs){
	// 	var remoteAddress = req.connection.remoteAddress.substr(7);
	// 	var log = getCurTime() + '\nRequest for ' + req.path + ' received.\nFrom:' + remoteAddress + '\n';
	// 	logWrite(log);
	// 	res.render('article', {entry: docs[0]});
	// });

	//mongodb end
	dbs.all('select * from ARTICLE where ID = ?', [id], function(err, docs){
		var remoteAddress = req.connection.remoteAddress.substr(7);
		var log = getCurTime() + '\nRequest for ' + req.path + ' received.\nFrom:' + remoteAddress + '\n';
		logWrite(log);
		fs.readFile('./Update/'+docs[0].CONTENT, function(err, data){
			if(err) {
				console.log(err);
			}
			else {
				docs[0].CONTENT = data.toString();
				res.render('article', {entry: docs[0]});
			}
		});
	});
});

var server = app.listen(8081, function(){
	console.log('Server is running.');
})