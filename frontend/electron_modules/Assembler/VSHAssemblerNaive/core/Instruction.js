const GregLogs=require("../GregLogs/GregLogs")
const NumberConversionManager= require("./NumberConversionManager")
module.exports=class Instruction{
    constructor(copBytes,fields){
        this.log=new GregLogs()
        this.copBytes=copBytes;
        this.fields=fields;
        this.log.trace(this.fields)
        this.nc=new NumberConversionManager();
        this.log.trace("Initialized new instruction")
    }

    assembleInstruction(instrFields){
        return this.copBytes+instrFields
    }
}