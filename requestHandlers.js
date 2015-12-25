var querystring = require("querystring"),
        fs = require("fs"),
        formidable = require("formidable");

function start(response) {
    console.log("rh.js - Request handler 'start' was called.");

    fs.readFile(__dirname+'/myhtml/'+'index.html', "utf8", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(file);
            response.end();
        }
    });
}
function game(response){
    console.log("rh.js - Request handler 'game' was called.");
    fs.readFile(__dirname+'/myhtml/'+'game.html', "utf8", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(file);
            response.end();
        }
    });
}

function endingwinner(response){
    console.log("rh.js - Request handler 'endingwinner' was called.");
    fs.readFile(__dirname+'/myhtml/'+'endingwinner.html', "utf8", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(file);
            response.end();
        }
    });
}

function endingloser(response){
    console.log("rh.js - Request handler 'endingloser' was called.");
    fs.readFile(__dirname+'/myhtml/'+'endingloser.html', "utf8", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(file);
            response.end();
        }
    });
}

function endingsmart(response){
    console.log("rh.js - Request handler 'endingsmart' was called.");
    fs.readFile(__dirname+'/myhtml/'+'endingsmart.html', "utf8", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(file);
            response.end();
        }
    });
}

exports.start = start;
exports.game = game;
exports.endingwinner = endingwinner;
exports.endingsmart = endingsmart;
exports.endingloser = endingloser;
