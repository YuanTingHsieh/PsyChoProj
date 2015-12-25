(function(){
    var Opponent = function(clinum){
        this.optype = clinum%3;
        this.optname = "";
        this.playwith = clinum;
        this.setName();
        this.money=0;
        this.othermon =0;
    };
    Opponent.prototype ={
    	toString:function()
    	{
    		return "[oppotype:"+this.optype+",name:"+this.optname
    				+",playwith:"+this.playwith+"]";
    	},
    	setName:function()
    	{
    		if (this.optype == 0)
    			this.optname = "Dragon";
    		else if (this.optype ==1)
    			this.optname = "Nogard"
    		else
    			this.optname = "Kris"
    	},
    	doSerToCli:function(value)
    	{
    		this.money+=parseInt(value);
    		this.othermon = parseInt(value);
    	},
    	decMon:function(round, roommon)
    	{
    		//accord to type and round to decide 
    		if (this.optype==0)
    		{
    			return this.othermon;
    		}
    		else if (this.optype==1)
    		{
    			return roommon;
    		}
    		else
    			return Math.floor(Math.random() * roommon) + 1 ;
    	},
    }
    exports.newOpponent = function(clinum)
    {
    	return new Opponent(clinum);
    }
}())