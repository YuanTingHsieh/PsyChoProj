var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var fm = require('formidable');

var handle={};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/game"] = requestHandlers.game;
handle["/endingwinner"] = requestHandlers.endingwinner;
handle["/endingsmart"] = requestHandlers.endingsmart;
handle["/endingloser"] = requestHandlers.endingloser;


server.newServer(router.route, handle,8888);
