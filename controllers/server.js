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
	var institution = (req.params.inst == 'all') ? '%' : req.params.ints;
	dbs.all('select count(*) as count from ARTICLE where TAGS like ? and INSTITUTIONID like ?', [type, institution], function(err, count){
		dbs.all('select * from ARTICLE where TAGS like ? and INSTITUTIONID like ? order by date(TIME)', [type, institution], function(err, docs){
			var pagenumber = Math.ceil((count[0].count)/10);
			var pages = [];
			for(var i = 1; i <= pagenumber; i++){
				pages.push({
					'page': i,
					'pagenumber': pagenumber
				});
			}	
			var curPage = pages[page-1];
			curPage.firstPage = pages[0];
			curPage.lastPage = pages[pagenumber-1];
			curPage.prePage = pages[page-2];
			curPage.nextPage = pages[page];
			curPage.curType = (type == '%') ? 'all' : type;
			curPage.curInst = (institution == '%') ? 'all' : institution;
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
			docs.slice((page-1)*10, page*10-1).forEach(function(ele){
				if(!ele.PREPICURL){
					ele.PREPICURL = '/imgs/timg.jpeg';
				}
				dbs.all('select NAME from INSTITUTION where ID = ?', [ele.INSTITUTIONID], function(err, name){
					ele.INSTNAME = name[0].NAME;	
				})
			});
			var remoteAddress = req.connection.remoteAddress.substr(7);
			var log = getCurTime() + '\nRequest for ' + req.path + ' received.\nFrom:' + remoteAddress + '\n';
			logWrite(log);
			res.render('index', {entries: docs.slice((page-1)*10, page*10-1), pages: pages.slice(pageRange.start, pageRange.end), curPage: curPage});
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