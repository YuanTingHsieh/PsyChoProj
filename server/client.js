(function(){
	var Client = function(server, socket){
		this.srv = server;
		this.so = socket;
		this.user = {"uname":null, "level":0, "score":0};
		this.bindEvent();
	};
	Client.prototype = {
		toString:function()
		{
			return "[uname:" + this.user.uname + ", sid:" + this.so.id + "]";
		},
		bindEvent:function()
		{
			if (this.so)
			{
				var self = this;
				this.so.on("login",function(data, fn){self.doLogin(data, fn);});
			}
		},
		doLogin:function(data, fn)
		{
			if (data)
			{
				this.user.uname = data.uname;
				var isExist = this.srv.isUserExist(this);
				if(!isExist)
				{
					fn(0);
				}
				else
				{
					fn(1);
					this.so.disconnect("unauthorized");
					this.srv.removeClientByID(this.so.id);
				}
			}
		}
	}
	exports.newClient = function (server, socket)
	{
		return new Client(server, socket);
	}
}());
