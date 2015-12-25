(function(){
    var Client = function(server,socket){
        this.srv = server;
        this.so = socket;

        this.user = {"uname":null,"ugen":null,"udep":null,"uage":null};
        this.roomnum = 0;
        this.playernum = 0 ;

        //his money now
        this.money = 0;
        //the other gave last round
        this.othermon =0;
        //綁定事件
        this.bindEvent();
    };
    Client.prototype = {
        toString:function()
        {
           return "[uname:" + this.user.uname + ",ugen:" + this.user.ugen + ",udep:" + this.user.udep
           + ",uage:" + this.user.uage + ",player:"+ this.playernum
           + ",room:" + (this.roomnum) + ",sid:" +this.so.id+ "]";
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
                //this.so.on("startgame",function(){self.doStartGame();});
                this.so.on("clitoser",function(data){self.doClitoSer(data);});
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
                this.user.uage = data.uage;
                this.user.ugen = data.ugen;
                this.user.udep = data.udep;

                var isExists = false;
                //this.roomnum = this.srv.roomcount;
                this.playernum = this.srv.clients.length;
                //console.log("client.js - Client "+this.user.uname+" has login as player "
                //    +this.srv.clicount+" in room "+this.srv.roomcount);
                
                //通知客戶端;
                if(!isExists)
                {
                    //callback to be 0
                    fn(0);
                    this.srv.roomInit();
                    console.log("client.js - "+this.toString()+" has login");           
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
        doGameready:function(stat, roomn, opponame)
        {
            this.so.emit('gameready',{'room': roomn ,'ready': stat, 'oppo':opponame });
        },
        doClitoSer:function(data)
        {
            console.log("client.js - Received "+data.val
                +" from player "+this.playernum+" of room "+(this.roomnum));
            this.srv.roomsplitMoney(data.val, this);
        },
        doSerToCli:function(value)
        {
            this.money += parseInt(value);
            this.othermon = parseInt(value);
            this.so.emit('sendMoney',{'mon': this.money});
        },
        isYourTurn:function(is_yr_turn)
        {
            if (!this.srv.rooms[this.roomnum-1].activate)
            {
                this.so.emit('sendturn',
                    {
                        'turn': is_yr_turn,
                        'roommon':this.srv.rooms[this.roomnum-1].money,
                        'othermon':this.othermon,
                        'nowround':this.srv.rooms[this.roomnum-1].rounds
                    });
            }
        },
        dosendTime:function(now_time)
        {
            this.so.emit('sendtime',{'nowtime':now_time});
        },
        doEndGame:function()
        {
            if (this.money < 266)
                this.so.emit('endgame',{'level':'loser'});
            else if (this.money < 533)
                this.so.emit('endgame',{'level':'smart'});
            else
                this.so.emit('endgame',{'level':'winner'});
        }
    }
    exports.newClient = function(server,socket)
    {
        return new Client(server,socket);
    }
}())
