(function(){
    var Client = function(server,socket){
        this.srv = server;
        this.so = socket;
        this.user = {"uname":null,"level":0,"score":0};
        this.playertype = 0;
        this.roomnum = 0;
        this.playernum = 0 ;

        this.money = 0;
        this.decval =0;
        //綁定事件
        this.bindEvent();
    };
    Client.prototype = {
        toString:function()
        {
           return "[uname:" + this.user.uname + ",player:"+ this.playertype
           + ",room:" + this.roomnum + ",sid:" +this.so.id+ "]";
        },
        bindEvent:function()
        {
            if (this.so)
            {
                var self = this;
                //註冊斷開連接事件
                this.so.on("disconnect",function(){self.doDisconnect();});
                //註冊登陸事件
                this.so.on("login",function(data,fn){self.doLogin(data,fn);});
                //this.so.emit("sendmessage",{"mes":self.sendMessage()});
                this.so.on("startgame",function(){self.doStartGame();});
                this.so.on("money",function(data){self.doClitoSer(data);});
            }
        },
        //處理斷開連接
        doDisconnect:function()
        {
            this.srv.removeClientByID(this.so.id);
            //通知客戶端;
            //this.srv.updateUserInfo();
        },
        doLogin:function(data,fn)
        {
            if(data)
            {
                this.user.uname = data.uname;
                var isExists = this.srv.isUserExists(this);
                this.playertype = this.srv.clicount;
                this.roomnum = this.srv.roomcount;
                this.playernum = this.srv.clients.length;
                //console.log("client.js - Client "+this.user.uname+" has login as player "
                //    +this.srv.clicount+" in room "+this.srv.roomcount);
                console.log("client.js - "+this.toString()+" has login");
                //通知客戶端;
                if(!isExists)
                {
                    //callback to be 0
                    fn(0,this.srv.clicount,this.srv.totalRound);
                    //this.srv.updateUserInfo();            
                }
                else 
                {               
                    this.so.disconnect("unauthorized"); 
                    this.srv.removeClientByID(this.so.id);
                }
            }        
        },
        dosendMessage:function(message)
        {
            this.so.emit('sendMessage',{'mes':message});
        },
        doGameready:function(stat, roomn)
        {
            this.so.emit('gameready',{'room': roomn ,'ready': stat });
        },
        doStartGame:function()
        {
            this.srv.startGame(this);
        },
        doClitoSer:function(data)
        {
            console.log("client.js - Received "+data.val
                +" from player "+this.playertype+" of room "+this.roomum);
            this.money += data.val;
        }
    }
    exports.newClient = function(server,socket)
    {
        return new Client(server,socket);
    }
}())
