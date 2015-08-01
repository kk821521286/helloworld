#!/bin/bash
NODE_ENV=production
DAEMON="node /home/kangkai/nodejs/socketio_tt/serv.js"
NAME=webserver
DESC=webserver
PIDFILE="/home/kangkai/nodejs/socketio_tt/webserver.pid"

case "$1" in
	start)
		echo "Starting $DESC:"
			nohup $DAEMON >/dev/null  &
		echo $! > $PIDFILE
		echo "$NAME."
			;;
	stop) 
		echo "Stoping $DESC:"
			pid=`cat $PIDFILE`
		kill $pid
			rm $PIDFILE
		echo "$NAME."
			;;
esac
exit 0
