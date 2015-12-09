(function(){
  var http = require("http");
  var url = require("url");
  var cli = require("./clientoserver");

  var Server = function(){
    this.io = null;
    this.clients = [];
  };

  Server.prototype = {
    start:function(route,handle,port) 
    {
      function onRequest(request, response) {
  //    var postData = "";
        var pathname = url.parse(request.url).pathname;
        console.log("server.js - Request for " + pathname + " received.");
        route(handle, pathname, response, request);
      }
      var srv = http.createServer(onRequest);
      //var srv = http.createServer(function(req,rep){});
      //LLLLLLL
      //192.168.43.201
      srv.listen(port);
      
      this.io = require("socket.io").listen(srv);
      //shut down debug
      this.io.set('log level',1);
      this.bindEvent();
      
      console.log("server.js - Server has started.");
    },
    bindEvent:function()
    {
      var self = this;
      this.io.sockets.on("connection",function(socket){
        self.doConnect(socket)
        //testing
        setInterval(function() {
          socket.emit('date',{'date':new Date()});
        }, 1000);
        // 接收來自於瀏覽器的資料
        socket.on('client_data', function(data) {
          process.stdout.write(data.letter);
        });
      });
      
    },
    doConnect:function(socket)
    {       
      this.addClient(socket);
    },      
    //添加一個socket客戶端
    addClient:function(socket)
    {
      console.log("server.js - add new client:"+socket.id);
      this.clients.push(cli.newClient(this,socket));
    },
    removeClientByID:function(sID)
    {
      var idx = -1;
      for(var i =0;i<this.clients.length;i++)
      {
        if(this.clients[i].so.id == sID)
        {
          idx = i;
          break;
        }
      }
      if(idx!=-1){
         this.clients.splice(idx,1);
         console.log("server.js - removing client:"+sID);
      }
      //如果所有客戶端都退出，則遊戲復位
      
    },
      //判斷用戶是否存在
    isUserExists:function(client)
    {
      for(var i = 0 ;i<this.clients.length;i++)
      {
       if(client!=this.clients[i]&&this.clients[i].user.uname == client.user.uname)
        {
         return true;
        }
      }
      return false;
    }
  }

  exports.newServer =function(route,handle,port)
  {
    return new Server().start(route,handle,port);
  }
}())