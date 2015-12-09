var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var fm = require('formidable');

var handle={};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/socket"] = requestHandlers.socket;
handle["/login"] = requestHandlers.login;


handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;

server.newServer(router.route, handle,8888);
