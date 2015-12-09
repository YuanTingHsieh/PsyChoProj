(function() {
  //import cli
  var cli = require("./client");
  var http = require("http");
  // define server
  var Server = function(){
    this.io=null;
    this.clients=[];
  };
  Server.prototype = {
    listen:function(port)
    {
      var srv = http.createServer(function(req,rep){});
      this.io = require("socket.io").listen(srv);
      this.io.set('log level',1);
      srv.listen(port);
      this.bindEvent();
    },
    //bind
    bindEvent:function()
    {
      var self = this;
      this.io.sockets.on("connection",function(socket){self.doConnect(socket)});
    },
    doConnect:function(socket)
    {
      this.addClient(socket);
    },
    //new Client
    addClient:function(socket)
    {
      console.log("add new client:"+socket.id);
      this.clients.push(cli.newClient(this, socket));
    },
    //remove Cli
    removeClientByID:function(sID)
    {
      var idx = -1;
      for (var i=0;i<this.clients.length;i++)
      {
        if (this.clients(i).so.id==sID)
        {
          idx = i;
          break;
        }
      }
      if (idx != -1)
      {
        this.clients.splice(idx,1);
      }
    },
    isUserExists:function(client)
    {
      for (var i=0;i<this.clients.length;i++)
      {
        if (client!=this.clients(i)&&this.clients(i).user.uname == client.user.uname)
        {
          return true;
        }
      }
      return false;
    },
    broadcastMsg:function(msg)
    {
      this.io.sockets.send(msg);
    },
    broadcastEvent:function(eventName,data)
    {
      this.io.sockets.emit(eventName, data);
    }
  }
  //activate service
  new Server().listen(9000);
}());
