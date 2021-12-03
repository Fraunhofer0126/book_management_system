'use strict';
const session=require('express-session');
const bodyParser=require('body-parser');
const srvstatic=require('serve-static');
const path = require("path");
//:init
const app=require('./WebApp')();
require("./coSqlite3")({file:'lib.db'});//连接数据库，要求必须使用这个数据库名字

//:prepare middle ware
app.use(bodyParser.json());//request数据处理中间件(json化数据)
app.use(bodyParser.urlencoded({extended: false}));//request数据处理中间件(url解码)
//app.use(cookieParser());
app.use(session({name:'bbs',secret:'bbs',cookie:{httpOnly:true,secure:false,maxAge:null}}));//会话管理中间件

//根的重定向拦截器
app.use('/',function(req,res,next)
{
	var url = req._path;
	res.writeHead(302,{'Location':'/__index.htm'
		//add other headers here...
	});
	res.end();
});

app.use(srvstatic(path.join(__dirname, '/static')));//静态文件服务中间件

//:router at here
app.use(function(req,res,next)
{//no-chache head for router and pre check
	res.setHeader('Cache-control','no-cache');
	res.setHeader('Pragma','no-cache');
	res.setHeader('Content-Type', 'text/html;charset=utf-8');
	next();
});

//请在此处设定路由(可参考bbs例子中的 ./routes/index.js中的代码，路由函数的实现请参考bbs例子中的./routes/txt.js和user.js)
/*示例：
app.route('/guid','get',....);
app.route('/login','post',...);
*/

///////////////////---------ka myroutes--------------//////////////////////////////
const init=require('./routes/init');
const book=require('./routes/book');
const reader=require('./routes/reader');

app.route('/init','post',init.Init);
app.route('/addbook','post',book.addBook);
app.route('/addnum','post',book.addNum);
app.route('/reducenum','post',book.reduceNum);
app.route('/changebook','post',book.changeBook);
app.route('/qbook','post',book.qBook);
app.route('/addreader','post',reader.addReader);
app.route('/delreader','post',reader.delReader);
app.route('/changereader','post',reader.changeReader);
app.route('/qreader','post',reader.qReader);
app.route('/qbooklist','post',reader.qBooklist);
app.route('/rent','post',reader.rentBook);
app.route('/return','post',reader.returnBook);
app.route('/qreaderlist','post',reader.qReaderlist);

/////////////////////////////////////////////////////////////////



app.use(app.router);//use router
//:handler error
app.use(function(err,req,res,next)
{
	if(!next)
		return res();//404
	//:log
	if(String==err.constructor)
		err={no:500,msg:err};
	if(null==err.no || null==err.msg || res.finished || res._sent)
		return next(err);//未处理的异常或处理了却无法发送的异常
	res.send(err);
});

//:create server
let port=3000;
var server = require('http').createServer(app.OnRequest);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error)
{
	if (error.syscall !== 'listen') {
		throw error;
	}
	// handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		console.error('Port '+port+' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		console.error('Port '+port+' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}

/**
 * 捕获未知异常，防止Node进程在异常时退出
 */
process.on('uncaughtException', function (err) {
	console.log(err);
});