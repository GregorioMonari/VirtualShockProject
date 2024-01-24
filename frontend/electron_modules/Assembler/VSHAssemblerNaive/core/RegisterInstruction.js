const Instruction=require("./Instruction")
module.exports=class RegisterInstruction extends Instruction{

    constructor(copBytes,fields){
        super(copBytes,fields)
    }

    //@OVERRIDE
    assembleInstruction(instrFieldsString){

        this.log.trace("ASSEMBLING REGISTER INSTRUCTION")

        var instrFieldsArr= instrFieldsString.split(",");
        this.log.trace(instrFieldsArr);

        this.log.trace(this.fields);

        var map={}
        Object.keys(this.fields).forEach(i=>{
            map[this.fields[i]]=instrFieldsArr[i].trim()
        })
        this.log.trace(map)

        //Convert instruction
        var cop=this.copBytes;
        var rs1=this.nc.reg2bin(map["rs1"]);
        var rs2=this.nc.reg2bin(map["rs2"]);
        var rd=this.nc.reg2bin(map["rd"]);
        const binaryString=cop + rs1 + rs2 + rd + "00000000000";
        const hexString=this.nc.bin2hex(binaryString);

        return hexString
    }

}