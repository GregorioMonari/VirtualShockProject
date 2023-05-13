/**
 * NAME: IsaManager
 * DESCRIPTION: manages the conversion of assembly instructions into machine code.
 * Does not have the concept of equ or other substitutions, it takes plain instructions
 * with cop, registers and constants 
 */

class IsaManager{
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
            var copBytes=ISA_DATA[copName].copBytes;
            var fields=ISA_DATA[copName].fields;

            this.log.trace("CopBytes: "+copBytes)
            this.log.trace("Instruction fields: "+JSON.stringify(fields))
            
            this.isaDB[copName]=new Instruction(copBytes,fields);
            
            instrNumber++;
        })
        this.log.info("isaDB Initialized Correctly")

    }

    parseInstruction(instrString){
        this.log.trace(instrString)
        var instrArr=instrString.split(" ");
        var instrCop=instrArr[0].trim();
        var instrFields=instrArr[1].trim();
        this.log.trace("Cop: "+instrCop)
        this.log.trace("Fields: "+instrFields)

        const instrObj=this.isaDB[instrCop];

        return instrObj.assembleInstruction(instrFields)
    }

    getInstructionByCop(copName){
        return this.isaDB[copName];
    }

}