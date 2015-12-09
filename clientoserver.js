(function(){
	var Client = function(server,socket){
		this.srv = server;
		this.so = socket;
		this.user = {"uname":null,"level":0,"score":0};
	    //綁定事件
	    this.bindEvent();
	};
	Client.prototype = {
		toString:function()
	    {
		   return "[uname:"+this.user.uname+",sid:"+this.so.id+"]";
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
	    		//通知客戶端;
	    		if(!isExists)
	    		{
                    fn(0);
					//this.srv.updateUserInfo();			
				} 
				else 
    	        {				
    	            this.so.disconnect("unauthorized");	
					this.srv.removeClientByID(this.so.id);
				}
			}        
	 	}
	}
	exports.newClient = function(server,socket)
	{
		return new Client(server,socket);
	}
}())