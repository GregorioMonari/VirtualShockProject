const GregLogs=require("./GregLogs/GregLogs")
require("./resources/VirtualShockIsa")
module.exports=class IsaLoader{
    constructor(){
        this.log=new GregLogs()
    }

    getIsaData(){
        var jsonIsa=this.loadIsaJson();
        if(this.validateIsaJson(jsonIsa)){
            this.log.info("ISA Loaded correctly");
            return jsonIsa.data
        }
    }

    validateIsaJson(isaJson){
        if(!isaJson.hasOwnProperty("name")){
            this.log.warning("Missing isa name");
        }
        if(!isaJson.hasOwnProperty("data")){
            throw new Error("Invalid isa file: missing 'data' field")
        }
        this.log.trace(isaJson)
        return true
    }


    loadIsaJson(){
        var json={};
        try{
            json=__JSON_ISA_PUBLIC__
        }catch(e){
            this.log.error(e)
            throw new Error("Loaded isa json is undefined or null. Check if the isa file is present at the correct location")
        }
        return __JSON_ISA_PUBLIC__
    }

    loadIsaFile(){}

}