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
//  var body = '<html>'+
//    '<head>'+
//    '<meta http-equiv="Content-Type" content="text/html; '+
//    'charset=UTF-8" />'+
//    '</head>'+
//    '<body>'+
//    '<form action="/upload" enctype="multipart/form-data" '+
//    ' method="post">'+
//    '<input type ="file" name="upload">'+
//  '<form action="/upload" method="post">'+
//  '<textarea name="text" rows="20" cols="60"></textarea>'+
//    '<input type="submit" value="Upload file" />'+
//    '</form>'+
//    '</body>'+
//    '</html>';


//    response.writeHead(200, {"Content-Type": "text/html"});
//    response.write(body);
//    response.end();
}

function upload(response, request) {
  console.log("rh.js - Request handler 'upload' was called.");
  var form = new formidable.IncomingForm();
  form.uploadDir=__dirname+'/';
  console.log("rh.js - about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("rh.js - parsing done");
    fs.renameSync(files.upload.path, __dirname+'/cool.jpg');
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();

  });

  //response.writeHead(200, {"Content-Type": "text/plain"});
  //response.write("You've sent: " + 
  //querystring.parse(postData).text);
  //response.end();
}

function show(response) {
  console.log("rh.js - Request handler 'show' was called.");
  fs.readFile(__dirname+'/'+'cool.jpg', "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function socket(response){
  console.log("rh.js - Request handler 'socket' was called.");
  fs.readFile(__dirname+'/myhtml/'+'socket.html', "utf8", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function login(response){
  console.log("rh.js - Request handler 'login' was called.");
  fs.readFile(__dirname+'/myhtml/'+'login.html', "utf8", function(error, file) {
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
exports.upload = upload;
exports.show = show;
exports.socket = socket;
exports.login = login;