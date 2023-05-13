class Instruction{
    constructor(copBytes,fields){
        this.log=new GregLogs()
        this.copBytes=copBytes;
        this.fields=fields;
        this.log.trace("Initialized new instruction")
    }

    assembleInstruction(instrFields){
        return this.copBytes+instrFields
    }
}