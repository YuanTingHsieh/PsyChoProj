(function(){
	var Client = {
		so:null,
		isFirstConnect : true,
		user : {"uname":null}
	};
	Client.connect = function (host, port){
		//port or what??
		var p = port||80, self = this;
		if (this.so==null)
		{
			this.so = io.connect("http://"+host+":"+p, {'reconnect':false});
			if (this.so)
			{
				this.so.on("connect",function(){self.doConnect();});
				this.so.on("error",function(data){this.so=null;alert("Connection Failed!");});
			}
		}
		else
		{
			this.so.socket.reconnect();
		}
	};
	Client.login = function(callback)
	{
		this.so.emit("login",{"uname":this.user.uname}, function(data){callback(data);});
	};
	Client.doConnect = function()
	{
		if (this.isFirstConnect)
		{
			this.isFirstConnect = false;
			this.bindEvent();
		}
		else
		{
			this.so.socket.reconnect();
		}
	};
	Client.bindEvent = function()
	{
	};
	window.Client = Client;
	
}());