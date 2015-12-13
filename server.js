(function(){
    var http = require("http");
    var url = require("url");
    var cli = require("./clientoserver");

    var Server = function(){
        this.io = null;
        this.clicount = 0;
        this.roomcount = 0;
        this.clients = [];
        this.rooms = [];
        this.totalRound = 4;
        this.startMoney = 100;
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
            //192.168.43.201
            //140.112.249.166
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
               
                self.clicount++;
                // 3 reset to 1, start new room
                if (self.clicount===3)
                {
                    self.clicount=1;
                }
                
                
                self.doConnect(socket);

                //see if game ready
                if (self.clicount===2)
                {
                    self.rooms[self.rooms.length-1].valid = true;
                    self.sendStatus(self.clients[self.clients.length-1],true,self.rooms.length);
                    self.sendStatus(self.clients[self.clients.length-2],true,self.rooms.length);
                }
                else
                {
                    self.roomcount++;
                    self.rooms.push({"num":self.roomcount,"money":self.startMoney,
                        "valid":false, "rounds":self.totalRound, "activate":false});
                    //self.roomValids.push(false);
                    self.sendStatus(self.clients[self.clients.length-1],false,self.rooms.length);
                }

                console.log("server.js - clinum is "+self.clicount);
                console.log("server.js - Total Room is "+self.rooms.length);
                //These lines below are tesing socket.html
                //testing
                //setInterval(function() {
                //    socket.emit('date',{'date':new Date()});
                //}, 1000);
                // 接收來自於瀏覽器的資料
                //socket.on('client_data', function(data) {
                //    process.stdout.write(data.letter);
                //});
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
                console.log("server.js - removing client:"+sID);
                var mes = "Your opponent has left the game, please reconnect.";
                if(this.rooms[this.clients[idx].roomnum-1].valid===true)
                {
                    if(this.clients[idx].player===1)
                    {
                        this.sendMessage(this.clients[idx+1],mes);
                    }
                    else
                    {
                        this.sendMessage(this.clients[idx-1],mes);
                    }
                    this.rooms[this.clients[idx].roomnum -1].valid = false;
                }
                this.clients.splice(idx,1);
                //ggg 
            }
            //如果所有客戶端都退出，則遊戲復位
            if (this.clients.length===0)
            {
                //this.resetServer();
                console.log("server.js - Server is resetting...");
                this.clicount = 0;
                this.roomcount = 0;
                
                this.rooms = [];
            }
            
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
        },
        sendMessage:function(client, message)
        {
            console.log("server.js - sending message to "+client.toString());
            client.dosendMessage(message);
        },
        sendStatus:function(client, stat, roomnum)
        {
            client.doGameready(stat, roomnum);
        },
        startGame:function(client)
        {
            //var self =this;
            if((client.playertype===1)&&(this.rooms[client.roomnum-1].activate===false))
            {
                var nowroom = client.roomnum,
                    nowplayer = client.playernum;
                var data1,data2;
                data1 = this.dealFirst(nowroom, nowplayer);

                for(var nowround = 1;nowround<totalRound;nowround++)
                {
                    if(nowround%2===0)
                    {
                        data1 = this.dealPlayerOne(nowroom, nowplayer);
                    }
                    else
                    {
                        data2 = this.dealPlayerTwo(nowroom, nowplayer+1);
                    }
                }
                this.rooms[client.roomnum-1].activate=true;
            }
            else
            {
                console.log("Room has activated.");
            }
        },
        dealFirst:function(nowroom,playernum)
        {
            var dec = this.clients[playernum-1].doClitoSer()
            this.rooms[nowroom-1].money += ;
        }
        dealPlayerOne:function(nowroom, playernum)
        {
            this.sendMoney()
        }
        sendMoney:function(playernum, money)
        {},
        roundComplete:function()
        {
            //need to save things
        }
    }

    exports.newServer =function(route,handle,port)
    {
        return new Server().start(route,handle,port);
    }
}())
