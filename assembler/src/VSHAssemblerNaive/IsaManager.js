/**
 * NAME: IsaManager
 * DESCRIPTION: manages the conversion of assembly instructions into machine code.
 * Does not have the concept of equ or other substitutions, it takes plain instructions
 * with cop, registers and constants 
 */
const GregLogs=require("./GregLogs/GregLogs")
const IsaLoader=require("./IsaLoader")
const RegisterInstruction=require("./core/RegisterInstruction")
const ImmediateInstruction=require("./core/ImmediateInstruction")
const JumpInstruction=require("./core/JumpInstruction")


module.exports=class IsaManager{
    constructor(){
        this.log=new GregLogs()
        var isaLoader=new IsaLoader()
        const ISA_DATA=isaLoader.getIsaData();
        this.isaDB={};
        this.log.info("Loading "+Object.keys(ISA_DATA).length+" instructions into isaDB")
        var instrNumber=0;
        Object.keys(ISA_DATA).forEach(copName=>{
            this.log.trace("---------<instruction #"+instrNumber+">---------")
            this.log.trace("Copname: "+copName)
            var type=ISA_DATA[copName].type;
            var copBytes=ISA_DATA[copName].copBytes;
            var fields=ISA_DATA[copName].fields;

            this.log.trace("Type: "+type)
            this.log.trace("CopBytes: "+copBytes)
            this.log.trace("Instruction fields: "+JSON.stringify(fields))
            
            switch (type) {
                case "register":
                        this.isaDB[copName]=new RegisterInstruction(copBytes,fields);
                    break;

                case "immediate":
                        this.isaDB[copName]=new ImmediateInstruction(copBytes,fields);
                    break;

                case "jump":
                        this.isaDB[copName]=new JumpInstruction(copBytes,fields);
                    break;
            
                default:
                    break;
            }
            
            
            instrNumber++;
        })
        this.log.info("isaDB Initialized Correctly")

    }



    parseInstruction(instrString,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb){
        this.log.trace(instrString)
        var instrArr=instrString.split(" ");
        var instrCop=instrArr[0].trim();
        var instrFields=instrString.replace(instrCop,"").trim();
        this.log.trace("Cop: "+instrCop)
        this.log.trace("Fields: "+instrFields)

        const instrObj=this.isaDB[instrCop];


        return instrObj.assembleInstruction(instrFields,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb)
    }

    getInstructionByCop(copName){
        return this.isaDB[copName];
    }

}