(function(){
    var http = require("http");
    var url = require("url");
    var cli = require("./clientoserver");
    var opp = require("./oppo")
    var fs = require("fs");

    var Server = function(){
        this.io = null;
        
        this.roomcount = 0;
        this.clients = [];
        this.opponents = [];

        this.rooms = [];
        this.tHands = [];
        this.tmHands = [];
        //config
        this.totalRound = 10;
        this.startMoney = 100;
        this.timeup = 60;
        
    };

    Server.prototype = {
        start:function(route,handle,port) 
        {
            function onRequest(request, response) {
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
                self.doConnect(socket);
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
            this.roomcount++;
            this.rooms.push({"num":this.roomcount,"money":this.startMoney,
                "valid":true, "rounds":0, "activate":false, "times":this.timeup});
            this.tHands.push(null);
            this.tmHands.push(null);
            this.opponents.push(opp.newOpponent());
            
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
                clearInterval(this.tHands[this.clients[idx].roomnum-1]);
                clearTimeout(this.tmHands[this.clients[idx].roomnum-1]);
                this.rooms[this.clients[idx].roomnum-1].valid=false;
                this.clients.splice(idx,1,"");           
            }

            var self = this;
            //check if clients is empty
            if (this.checkEmpty())
            {
                this.resetServer();
            }
            
        },
        checkEmpty:function()
        {

            if (this.clients.length == 0)
            { console.log("checking emp... cli.len is 0 is empty")  ; return true;}

            else
            { 
                for(var i =0;i<this.clients.length;i++)
                {
                    if (this.clients[i]!="")
                    {
			console.log("checking emp... Not empty");
                        return false;
                    }
                }
		console.log("finish checking... is empty")
                return true;
            }
        },
        resetServer:function()
        {
            console.log("server.js - Server is resetting...");

            this.roomcount = 0;
            this.clients = [];
            this.rooms = [];
            this.tHands = [];
            this.tmHands = [];
            
        },
        roomInit:function(client)
        {       
		if (client.playernum ==0) 
		{this.sendMessage(client,"Sorry, something goes wrong, please reconnect.");return;}
            client.roomnum = this.rooms.length;

            console.log("server.js - Room initing...  "+client.toString());
            this.sendStatus(client,true,this.rooms.length,this.opponents[this.clients.length-1].optname);
        

        },
        sendMessage:function(client, message)
        {
            console.log("server.js - sending message to "+client.toString());
            client.dosendMessage(message);
        },
        sendStatus:function(client, stat, roomnum, opponame)
        {
            client.doGameready(stat, roomnum, opponame);
            console.log("server.js - Sending status to "+client.toString()+" oppo is "+opponame);
            this.startGame(client);
        },
        startGame:function(client)
        {            
                if (this.totalRound <= this.rooms[client.roomnum-1].rounds)
                {
                    this.endGame(client);
                    return;
                }
                //this.rooms[client.roomnum-1].rounds++;
                console.log("server.js - Starts game "+client.toString());
                this.rooms[client.roomnum-1].activate=false;
                this.startOneRound(client);
        },
        startOneRound:function(client)
        {
            
            var nowroom = client.roomnum,
                nowround = this.rooms[client.roomnum-1].rounds,
                nowplayer = client.playernum;
            console.log("server.js - Round "+(nowround+1)+" starts...");
            this.rooms[nowroom-1].times = this.timeup;
            var self = this;
            if(nowround%2===0)
            {
                this.clients[nowplayer-1].isYourTurn(false);
                this.tmHands[nowroom-1] = setTimeout(function(){
                    if (self.clients.length>0)
                    {console.log("in timeout");
                        if (self.rooms[nowroom-1].valid==true)
                            self.roomsplitMoney(self.opponents[nowplayer-1].decMon(nowround,self.rooms[nowroom-1].money),self.clients[nowplayer-1])
                    }
			else{return;}
                },10000)
                
            }
            else
            {
                this.clients[nowplayer-1].isYourTurn(true);
            }
            this.tHands[nowroom-1] = setInterval(function(){
                //if( (self.rooms[nowroom-1].times<0)  )
		if (self.clients.length==0)
		{console.log("Error handled");return;}
		else
                {                                            
			console.log("cli len"+self.clients.length+"roomlen"+self.rooms.length);
			if(self.clients[nowplayer-1]!="") 
                    {self.clients[nowplayer-1].dosendTime(self.rooms[nowroom-1].times);                   }
			else{return;}
			if(self.rooms.length!=0)
                   { self.rooms[nowroom-1].times--;}
			else{return;}
                }
            },1000)
        },
        endTimeout:function(client)
        {
            console.log("server.js - client "+client.toString()+" is time out or invalid, shutting down");
            
            this.removeClientByID(client.so.id);
        },
        endGame:function(client)
        {
            console.log("server.js - Ends game at "+client.toString());
            this.rooms[client.roomnum-1].valid=false;    
            this.clients[client.playernum-1].doEndGame();
                
            
        },
        
        roomsplitMoney:function(m_receive, client )
        {
            this.rooms[client.roomnum-1].activate=true; 
            var nowplayer = client.playernum;
            var x = parseInt(this.rooms[client.roomnum-1].money); 
            console.log(client.toString()+"Splitting money, original :"+x+" after : "+(x- m_receive  )+" , "+m_receive);
            if (this.rooms[client.roomnum-1].rounds%2 ==1)
            {
                this.clients[nowplayer-1].doSerToCli(x - m_receive );
            //this.clients[nowplayer].doSerToCli( m_receive );
               this.opponents[nowplayer-1].doSerToCli( m_receive );
               this.saveDecision( x - m_receive,  m_receive, nowplayer-1, false); 
            }
            else
            {
                this.clients[nowplayer-1].doSerToCli(m_receive );
            //this.clients[nowplayer].doSerToCli( m_receive );
                this.opponents[nowplayer-1].doSerToCli(x - m_receive );
                this.saveDecision(  m_receive,  x-m_receive, nowplayer-1, true); 
            }

                   
        },
        saveDecision:function(m1, m2, cp1, m1_is_mrec )
        {
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
            dataStream.write("P2 is "+this.opponents[cp1].toString()+'\n');
            dataStream.write('P1 increase '+m1+'\n');
            dataStream.write('P2 increase '+m2+'\n');
            dataStream.write('P1 has '+ this.clients[cp1].money +'\n');
            dataStream.write('P2 has '+ this.opponents[cp1].money +'\n');
            dataStream.end('\n');
            
            this.updateRoom(m_receive, this.clients[cp1]);
            
        },
        updateRoom:function(m_receive, client)
        {
            console.log("server.js - Updating room..."+client.toString());
            var roomn = client.roomnum;
            this.rooms[roomn-1].money = this.startMoney+parseInt(m_receive);
            this.rooms[roomn-1].rounds += 1;
            clearInterval(this.tHands[roomn-1]);
            clearTimeout(this.tmHands[roomn-1]);
            this.startGame(client);
        },
    }

    exports.newServer =function(route,handle,port)
    {
        return new Server().start(route,handle,port);
    }
}())
