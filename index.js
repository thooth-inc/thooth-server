var bodyParser = require('body-parser');
var fs = require('fs');
var _ = require('lodash');
var mongoose = require('mongoose');
var cluster = require('cluster');
var isOnProduction = true;

if (isOnProduction) {

    mongoose.connect('mongodb://admin:admin@ds115701.mlab.com:15701/thooth');

    if (cluster.isMaster) {
        var numWorkers = require('os').cpus().length;

        console.log('Master cluster setting up ' + numWorkers + ' workers...');

        for (var i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('online', function (worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
        });

        cluster.on('exit', function (worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });
    } else {                
        var app = require('express')();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        //App setting header configuring
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header('Access-Control-Allow-Credentials', true);
            next();
        });

        app.get('/', function (req, res) {
            res.send("App Running Successfully");
        });
        var ContextIoApi = require('./api/context-io/context-io-route.js')(app);
        app.listen(process.env.PORT,function () {
            console.log('Process ' + process.pid + ' is listening to all incoming requests');
            console.log("Express Server is listening on " + process.env.PORT);
        });        
    }

}
else {
    // RSPL MongoDb server
    mongoose.connect('mongodb://admin:admin@ds115701.mlab.com:15701/thooth');

    var express = require('express');
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //App setting header configuring
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Credentials', true);
        next();
    });

    app.get('/', function (req, res) {
        res.send("App Running Successfully");
    });

    var ContextIoApi = require('./api/context-io/context-io-route.js')(app);

    // app.listen(process.env.PORT);
    app.set('port', 80);
    app.set('ip', "127.0.0.1"); //place your IP here

    var server = app.listen(app.get('port'), app.get('ip'), function () {
        console.log(" Express Server is listening on " + app.get('ip') + ':' + app.get('port'));
    });
}
