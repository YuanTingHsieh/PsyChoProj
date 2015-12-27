(function(){
    var Opponent = function(){
        this.optype = Math.floor(Math.random() * 3) ;
        this.optname = "";
        this.setName();
        this.money=0;
        this.othermon =0;
    };
    Opponent.prototype ={
    	toString:function()
    	{
    		return "[oppotype:"+this.optype+",name:"+this.optname+"]";
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
		var ooop=0;
    		//accord to type and round to decide 
    		if (this.optype==0)
    		{
    			ooop= this.othermon;
    		}
    		else if (this.optype==1)
    		{
    			ooop= roommon;
    		}
    		else
    			ooop= Math.floor(roommon/2);
		if (ooop<0 || ooop>roommon)
			{ooop = 10;}
		return ooop;
    	},
    }
    exports.newOpponent = function()
    {
    	return new Opponent();
    }
}())
