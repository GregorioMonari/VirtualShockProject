const Instruction=require("./Instruction")
module.exports=class RegisterInstruction extends Instruction{

    constructor(copBytes,fields){
        super(copBytes,fields)
    }




    //@OVERRIDE
    assembleInstruction(instrFieldsString){

        const defaultFields=["rd","rs1","rs2"]

        this.log.trace("ASSEMBLING REGISTER INSTRUCTION")
        instrFieldsString=instrFieldsString.toLowerCase();
        var instrFieldsArr= instrFieldsString.split(",");
        this.log.debug(instrFieldsArr);

        this.log.debug(this.fields);

        var map={}
        let count=0;
        for(var i=0; i<defaultFields.length; i++){
            const field= defaultFields[i];

            if(this.fields){
                if(this.fields[i]==defaultFields[i]){
                    map[field]=instrFieldsArr[count].trim()
                    count++;
                }else{
                    //Override
                    map[field]=this.fields[i].trim();
                }
            }else{
                map[field]=instrFieldsArr[count].trim()
                count++;
            }
        }
        this.log.debug(map)

        //Convert instruction
        var cop=this.copBytes;
        var rs1=this.nc.reg2bin(map["rs1"].trim());
        var rs2=this.nc.reg2bin(map["rs2"].trim());
        var rd=this.nc.reg2bin(map["rd"].trim());
        const binaryString=cop + rs1 + rs2 + rd + "00000000000";
        const hexString=this.nc.bin2hex(binaryString);

        return hexString
    }

}