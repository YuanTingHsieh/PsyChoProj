(function(){
    var http = require("http");
    var url = require("url");
    var cli = require("./clientoserver");
    var fs = require("fs");

    var Server = function(){
        this.io = null;
        this.clicount = 0;
        this.roomcount = 0;
        this.clients = [];
        this.rooms = [];
        //config
        this.totalRound = 4;
        this.startMoney = 100;
        this.timeup = 60;
        this.tHand = null;
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
                //self.roomcount++;
                // 3 reset to 1, start new room
                if (self.clicount===3)
                {
                    self.clicount=1;
                }
                                
                self.doConnect(socket);
                
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
            //this.roomInit();
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
                    if(this.clients[idx].playertype===1)
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
        roomInit:function()
        {
            //see if game ready
                if (this.clicount===2)
                {
                    this.rooms[this.rooms.length-1].valid = true;
                    this.clients[this.clients.length-1].roomnum = this.roomcount;
                    this.sendStatus(this.clients[this.clients.length-1],true,this.rooms.length);
                    this.sendStatus(this.clients[this.clients.length-2],true,this.rooms.length);
             
                }
                else
                {
                    this.roomcount++;
                    this.clients[this.clients.length-1].roomnum = this.roomcount;
                    this.rooms.push({"num":this.roomcount,"money":this.startMoney,
                        "valid":false, "rounds":0, "activate":false, "times":this.timeup});
                    //this.roomValids.push(false);
                    this.sendStatus(this.clients[this.clients.length-1],false,this.rooms.length);
                }

                console.log("server.js - clinum is "+this.clients.length);
                console.log("server.js - Total Room is "+this.rooms.length);
        },
        sendMessage:function(client, message)
        {
            console.log("server.js - sending message to "+client.toString());
            client.dosendMessage(message);
        },
        sendStatus:function(client, stat, roomnum)
        {
            client.doGameready(stat, roomnum);
            if (client.playertype==2)
            {
                this.startGame(client);
            }
            else if (client.playertype==1)
            {
                console.log("1");
            }
            else
                console.log("GG");
        },
        startGame:function(client)
        {
            //var self =this;
            //if((client.playertype===2)&&(this.rooms[client.roomnum-1].activate===false))
            //{
                console.log("server.js - Starts game at room "+client.roomnum);
                if (this.totalRound==this.rooms[client.roomnum-1].rounds)
                {
                    this.endGame(client);
                    return;
                }
                //this.rooms[client.roomnum-1].rounds++;
                this.startOneRound(client);
            //}
            //else
            //{
            //    console.log("Wrong patty.");
            //}
        },
        startOneRound:function(client)
        {
            
            var nowroom = client.roomnum,
                nowround = this.rooms[client.roomnum-1].rounds,
                nowplayer = client.playernum;
            console.log("server.js - Round "+(nowround+1)+" starts...");
            this.rooms[nowroom-1].times = this.timeup;
            var self = this;
            this.tHand = setInterval(function(){
                if(self.rooms[nowroom-1].times<0)
                {
                    self.endTimeout(client);
                    clearInterval(this.tHand);
                }
                else
                {
                    if(nowround%2===0)
                    {
                        console.log("Odd round "+(nowplayer-2)+client.so.id);
                        //data1 = this.dealRound(nowroom, nowplayer);
                        self.clients[nowplayer-2].isYourTurn(true,self.rooms[nowroom-1].times);
                        self.clients[nowplayer-1].isYourTurn(false,self.rooms[nowroom-1].times);
                    }
                    else
                    {
                        console.log("Even round"+(nowplayer-2)+client.so.id );
                        //data2 = this.dealRound(nowroom, nowplayer+1);
                        self.clients[nowplayer-2].isYourTurn(false,self.rooms[nowroom-1].times);
                        self.clients[nowplayer-1].isYourTurn(true,self.rooms[nowroom-1].times);
                    }
                    self.rooms[nowroom-1].times--;
                }
            },1000)
        },
        endTimeout:function(client)
        {
            console.log("server.js - client "+client.so.id+" is time out, shutting down");
            this.removeClientByID(client.so.id);
        },
        endGame:function(client)
        {
            if (client.playertype==1)
            {
                this.clients[client.playernum-1].doEndGame();
                this.clients[client.playernum].doEndGame();
            }
            else
            {
                this.clients[client.playernum-2].doEndGame();
                this.clients[client.playernum-1].doEndGame();
            }
            
        },
        
        roomsplitMoney:function(m_receive, client )
        { 
            var nowplayer = client.playernum;
            var x = this.rooms[client.roomnum-1].money; 
            if(client.playertype===1)
            {
                this.clients[nowplayer-1].doSerToCli(x - m_receive );
                this.clients[nowplayer].doSerToCli( m_receive );
                this.saveDecision(m_receive, nowplayer-1, nowplayer);
            }
            else
            {
                this.clients[nowplayer-2].doSerToCli( m_receive );
                this.clients[nowplayer-1].doSerToCli(x - m_receive );
                this.saveDecision(m_receive, nowplayer-1, nowplayer-2);
            }
            
        },
        saveDecision:function(m_receive, cgive, ctake)
        {
            if (this.clients[cgive].roomnum != this.clients[ctake].roomnum)
            {
                console.log("server.js - FUCK");
            }
            var nowroom = this.clients[cgive].roomnum;
            var mydir = __dirname+'/data/Room'+nowroom+'.txt';
            var dataStream=fs.createWriteStream(mydir,{'flags':'a'});
            dataStream.write(this.rooms[nowroom-1].rounds+' , '+this.clients[cgive].so.id+
                ' , '+(this.rooms[nowroom-1].money - m_receive)+'\n');
            dataStream.write(this.rooms[nowroom-1].rounds+' , '+this.clients[ctake].so.id+
                ' , '+ m_receive+'\n');
            dataStream.end('\n');
            if (this.clients[cgive].playertype===2)
                this.updateRoom(m_receive, this.clients[cgive]);
            else
                this.updateRoom(m_receive, this.clients[ctake]);
            
        },
        updateRoom:function(m_receive, client)
        {
            var roomn = client.roomnum;
            this.rooms[roomn-1].money += m_receive;
            this.rooms[roomn-1].rounds += 1;
            this.startGame(client);
        },
    }

    exports.newServer =function(route,handle,port)
    {
        return new Server().start(route,handle,port);
    }
}())
