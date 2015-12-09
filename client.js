(function(){
	//定義客戶端
  var Client = {
    //客戶端socket
    so:null,
	isFirstConnect:true,
	//當前用戶
	user:{"uname":null},
  };
  //連接服務器
  Client.connect = function(host,port){
     var p = port||80,
	     self = this;
	 if(this.so==null)
	 {
         this.so = io.connect("http://"+host+":"+p,{'reconnect':false});
		 if(this.so)
		 {		   
		   //綁定連接socket事件
		   this.so.on("connect",function(){self.doConnect();});
		   //綁定錯誤處理
		   this.so.on("error",function(data){this.so = null;alert("服務器連接失敗!");});
		 }
	 }
	 else
	 {
	     this.so.socket.reconnect();
	 }
  };
  //登陸
  Client.login = function(callback)
  {
     //通知服務端login事件
	  this.so.emit("login",{"uname":this.user.uname},function(data){
         callback(data);
	  });
  };
  //連接事件 
  Client.doConnect = function()
  {   
	 //如果是第一次連接，註冊事件
	 if(this.isFirstConnect)
	 {
		this.isFirstConnect = false;
		this.bindEvent();
	 }
	 else
	 {
		//重新連接
		this.so.socket.reconnect();
	 }
  };
   //綁定客戶端socket事件
  Client.bindEvent = function()
  {
     var self = this;
	 //消息事件
	 this.so.on("message",function(msg){self.doMessage(msg);});
  };  
  window.Client = Client;
}())