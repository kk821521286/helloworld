var http = require('http'),
	cluster = require('cluster'),
	numCPUs = require('os').cpus().length,
	url = require('url'),
	mysql = require('mysql'),
	fs = require('fs'),
	server;

/*
if(cluster.isMaster) {
	console.log("master start...");
	for(var i = 0;i < numCPUs;i++) {
		cluster.fork();
	}
	cluster.on('listening',function(worker,address){
			console.log('[master]' + 'listening:worker '+ worker.process.pid +',Address: '+address.address+":"+address.port);
			});
	cluster.on('exit',function(worker,code,signal){
			console.log('worker '+worker.process.pid + ' died');
			});
} else if (cluster.isWorker) { 
*/
//	console.log('[worker]' + "start worker..."+cluster.worker.id);
	server = http.createServer(function(req, res){
			// your normal server code
			//console.log('worker'+cluster.worker.id);
			var path = url.parse(req.url).pathname;
			switch (path){
			case '/':
			//console.log('debug /');
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1> <a href="/index.html">Socket.io Test</a></h1>');
			res.write('');
			res.end();
			break;
			case '/index.html':
//			console.log('worker'+cluster.worker.id);
			//console.log('debug /index.html');
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
				});
			break;
			default: send404(res);
			}
	}),

		   send404 = function(res){
			   res.writeHead(404);
			   res.write('404');
			   res.end();
		   };

server.listen(8080);
console.log("server listening port at 8080");

//---------------------------------------------
var connection = mysql.createConnection({
host	: 'localhost',
user	: 'root',
password: 'mysqladmin',
database: 'my_socketio'
});
DATABASE = 'my_socketio';
TABLE = 'collection';
connection.connect();
//---------------------------------------------
var cur_time,msg1,msg2,msg3,ipaddr,socketId;
cur_time = "flag";
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
		socketId = socket.id;
		var clientIp = socket.request.connection.remoteAddress;
		ipaddr = clientIp;
		console.log(clientIp +":  "+ socketId + " "+"connected");
		//console.log('worker'+cluster.worker.id+" received");
		//	console.log("Connection " + socket.id + " accepted.");
		socket.on('message', function(message){	
			if(message == "hello server")  {
			cur_time = "flag";
			socket.emit('message',{hello:'hello client'});
			}
			else {
			cur_time = message;
			}
			});

		socket.on('msg1',function(msg){
			msg1 = Number(msg.text);
			if(Number(msg.text) > 5 || Number(msg.text) < 3) {
			socket.emit('push_msg1', '温度情况:异常');
			}
			else {
			socket.emit('push_msg1','温度情况:正常');
			}
			});
		socket.on('msg2',function(msg){
				msg2 = Number(msg.text);
				if(Number(msg.text) > 10 || Number(msg.text) < 5) {
				socket.emit('push_msg2', '腐蚀情况:异常');
				} else {
				socket.emit('push_msg2','腐蚀情况:正常');
				}
				});
		socket.on('msg3',function(msg){
				msg3 = Number(msg.text);
				if(Number(msg.text) > 3.5 || Number(msg.text) < 2.5) {
				socket.emit('push_msg3', '电压情况:异常');
				} else {
				socket.emit('push_msg3','电压情况:正常');
				}
			
				connection.query('use ' + DATABASE);
				if(cur_time != "flag") {
				connection.query(
					'insert into '+ TABLE + ' '+
					'set cur_time = ?, msg1 = ?, msg2 = ?, msg3 = ? ,ipaddr = ?,socketId = ?',
					[cur_time,msg1,msg2,msg3,ipaddr,socketId]
					);
				console.log('insert success');
				
				cur_time = "flag";
				}
			//	connection.end();
				
				});
		socket.on('time',function(data){
				//console.log(data);
				socket.emit('time',data);
				});
		socket.on('disconnect', function(){
				var clientIp = socket.request.connection.remoteAddress;
				console.log( clientIp +":       "+ socket.id + " terminated.");
				});
});
//}
