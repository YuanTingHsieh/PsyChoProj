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
        this.tHands = [];
        //config
        this.totalRound = 4;
        this.startMoney = 100;
        this.timeup = 60;
        
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
            //140.112.249.166
            //127.0.0.1
            //40.117.46.27
            //10.0.0.4
            //IIPP
            srv.listen(port,'10.0.0.4');
            
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
            //var empty = true;
            for(var i =0;i<this.clients.length;i++)
            {
                if (this.clients[i]=="")
                    continue;
                
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
                        this.removeClientByID(idx+1);
                    }
                    else
                    {
                        this.sendMessage(this.clients[idx-1],mes);
                        this.removeClientByID(idx-1);
                    }
                    this.rooms[this.clients[idx].roomnum -1].valid = false;
                }
                this.clients.splice(idx,1,"");
                //ggg 
            }

            //check if clients is empty
            this.checkEmpty();
            
        },
        checkEmpty:function()
        {
            var empty = true;
            
            for(var i =0;i<this.clients.length;i++)
            {
                if (this.clients[i]!="")
                {
                    empty=false;
                    break;
                }
            }
            
            //如果所有客戶端都退出，則遊戲復位
            if (empty===true)
            {
                this.resetServer();
            }
        },
        resetServer:function()
        {
            console.log("server.js - Server is resetting...");

            this.clicount = 0;
            this.roomcount = 0;
            this.clients = [];
            this.rooms = [];
            this.tHands = [];
        },
            //判斷用戶是否存在
        isUserExists:function(client)
        {
            for(var i = 0 ;i<this.clients.length;i++)
            {
                if(this.clients[i]!="")
                {
                    if(client==this.clients[i])
                    {
                        return true;
                    }
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
                    this.sendStatus(this.clients[this.clients.length-1],true,this.rooms.length,this.clients[this.clients.length-2].user.uname);
                    this.sendStatus(this.clients[this.clients.length-2],true,this.rooms.length,this.clients[this.clients.length-1].user.uname);
             
                }
                else
                {
                    this.roomcount++;
                    this.clients[this.clients.length-1].roomnum = this.roomcount;
                    this.rooms.push({"num":this.roomcount,"money":this.startMoney,
                        "valid":false, "rounds":0, "activate":false, "times":this.timeup});
                    this.tHands.push(null);
                    this.sendStatus(this.clients[this.clients.length-1],false,this.rooms.length,this.clients[this.clients.length-1].user.uname);
                }

                console.log("server.js - clinum is "+this.clients.length);
                console.log("server.js - Total Room is "+this.rooms.length);
        },
        sendMessage:function(client, message)
        {
            console.log("server.js - sending message to "+client.toString());
            client.dosendMessage(message);
        },
        sendStatus:function(client, stat, roomnum, opponame)
        {
            client.doGameready(stat, roomnum, opponame);
            if (client.playertype==2)
            {
                console.log("sending Status...");
                this.startGame(client);
            }
            //else if (client.playertype==1)
            //    console.log("1");
            else
                console.log("GG");
        },
        startGame:function(client)
        {
            //var self =this;
            //if((client.playertype===2)&&(this.rooms[client.roomnum-1].activate===false))
            //{
                
                if (this.totalRound==this.rooms[client.roomnum-1].rounds)
                {
                    this.endGame(client);
                    return;
                }
                //this.rooms[client.roomnum-1].rounds++;
                console.log("server.js - Starts game at room "+client.roomnum);
                this.rooms[client.roomnum-1].activate=false;
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
            //console.log("nowplayer in startOneRound is "+nowplayer);
            this.rooms[nowroom-1].times = this.timeup;
            var self = this;
            if(nowround%2===0)
            {
                self.clients[nowplayer-2].isYourTurn(true);
                self.clients[nowplayer-1].isYourTurn(false);
            }
            else
            {
                self.clients[nowplayer-2].isYourTurn(false);
                self.clients[nowplayer-1].isYourTurn(true);
            }
            this.tHands[nowroom-1] = setInterval(function(){
                //console.log("server.js - Interval is running...");
                if( (self.rooms[nowroom-1].times<0) || (self.rooms[nowroom-1].valid === false) )
                {
                    self.endTimeout(client);
                }
                else
                {
                    if(nowround%2===0)
                    {
                        self.clients[nowplayer-2].dosendTime(self.rooms[nowroom-1].times);
                        self.clients[nowplayer-1].dosendTime(self.rooms[nowroom-1].times);
                    }
                    else
                    {
                        self.clients[nowplayer-2].dosendTime(self.rooms[nowroom-1].times);
                        self.clients[nowplayer-1].dosendTime(self.rooms[nowroom-1].times);
                    }
                    self.rooms[nowroom-1].times--;
                }
            },1000)
        },
        endTimeout:function(client)
        {
            console.log("server.js - client "+client.so.id+" is time out or invalid, shutting down");
            clearInterval(this.tHands[client.roomnum-1]);
            this.removeClientByID(client.so.id);
        },
        endGame:function(client)
        {
            console.log("server.js - Ends game at room "+client.roomnum);
            this.rooms[client.roomnum-1].valid=false;
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
            clearInterval(this.tHands[client.roomnum-1]);
            
        },
        
        roomsplitMoney:function(m_receive, client )
        {
            this.rooms[client.roomnum-1].activate=true; 
            var nowplayer = client.playernum;
            var x = parseInt(this.rooms[client.roomnum-1].money); 
            console.log("Splitting money, original :"+x+" after : "+(x- m_receive  )+" , "+m_receive);
            if(client.playertype===1)
            {
                this.clients[nowplayer-1].doSerToCli(x - m_receive );
                this.clients[nowplayer].doSerToCli( m_receive );
                this.saveDecision( x - m_receive,  m_receive, nowplayer-1, nowplayer, false);
            }
            else
            {
                this.clients[nowplayer-2].doSerToCli( m_receive );
                this.clients[nowplayer-1].doSerToCli(x - m_receive );
                this.saveDecision(m_receive, x - m_receive , nowplayer-2, nowplayer-1, true);
            }
            
        },
        saveDecision:function(m1, m2, cp1 , cp2, m1_is_mrec )
        {
            if (this.clients[cp1].roomnum != this.clients[cp2].roomnum)
            {
                console.log("server.js - FUCK");
            }
            var nowroom = this.clients[cp1].roomnum;
            var mydir = __dirname+'/data/Room'+nowroom+'.txt';
            var dataStream=fs.createWriteStream(mydir,{'flags':'a'});
            if (m1_is_mrec)
                var m_receive = m1;
            else
                var m_receive = m2;
            dataStream.write("Rounds "+this.rooms[nowroom-1].rounds+'\n');
            dataStream.write("God send "+this.rooms[nowroom-1].money+"\n");
            dataStream.write("Decision "+m_receive+" is given out\n");
            dataStream.write("P1 is "+this.clients[cp1].toString()+'\n');
            dataStream.write("P2 is "+this.clients[cp2].toString()+'\n');
            dataStream.write('P1 increase '+m1+'\n');
            dataStream.write('P2 increase '+m2+'\n');
            dataStream.write('P1 has '+ this.clients[cp1].money +'\n');
            dataStream.write('P2 has '+ this.clients[cp2].money +'\n');
            dataStream.end('\n');
            if (this.clients[cp1].playertype===2)
            {
                console.log("GGGFUCKFFFFFF");
                this.updateRoom(m_receive, this.clients[cp1]);
            }
            else
                this.updateRoom(m_receive, this.clients[cp2]);
            
        },
        updateRoom:function(m_receive, client)
        {
            console.log("server.js - Updating room...");
            var roomn = client.roomnum;
            this.rooms[roomn-1].money += parseInt(m_receive);
            this.rooms[roomn-1].rounds += 1;
            clearInterval(this.tHands[roomn-1]);
            this.startGame(client);
        },
    }

    exports.newServer =function(route,handle,port)
    {
        return new Server().start(route,handle,port);
    }
}())
