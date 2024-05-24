import Instruction from "./Instruction";
export default class JumpInstruction extends Instruction{

    constructor(copBytes:string,fields:string){
        super(copBytes,fields)
    }


    //@OVERRIDE
    assembleInstruction(        
        instrFieldsString:string,
        currAddrCount:number,
        jumpDb:{
            [key:string]:string;
        },
        equDirs:{
            [key:string]:string;
        },
        dbDirs:{
            [key:string]:string;
        },
        procsPublicDb:{
            [key:string]:string;
        }){
        var instrFieldsArr= instrFieldsString.split(",");
        var map:any={}
        Object.keys(this.fields).forEach((i:any)=>{
            map[this.fields[i]]=instrFieldsArr[i].trim()
        })
        //Convert instruction
        var cop=this.copBytes;
        var cost= this.parseConstantUnsigned(map["cost"],currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb,26);
        const binaryString=cop + cost;
        const hexString=this.nc.bin2hex(binaryString);
        return hexString
    }
}