import Instruction from "./Instruction";
export default class ImmediateInstruction extends Instruction{

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
        const defaultFields=["rs2","rs1","cost"];
        var instrFieldsArr= instrFieldsString.split(",");
        var map:any={}
        let count=0;
        for(var i=0; i<defaultFields.length; i++){
            const field= defaultFields[i];
            if(this.fields){
                if(this.fields[i]){
                    if(this.fields[i]==defaultFields[i]){
                        //RIDONDANTE MA LASCIALO
                        map[field]=instrFieldsArr[count].trim()
                        count++;
                    }else{
                        //Override
                        if(this.fields[i].includes("cost(")){
                            const arr=instrFieldsArr[count].split("(")
                            //console.log(arr)
                            const fieldsArr=this.fields[i].split("(")
                            //console.log(fieldsArr)
                            map["cost"]=arr[0].trim()
                            map[fieldsArr[1].trim().replace(")","").trim()]=arr[1].trim().replace(")","").trim()
                            count++
                        }else{
                            
                            if(defaultFields.includes(this.fields[i])){
                                map[this.fields[i]]=instrFieldsArr[count];
                            }else{
                                //Ex sostituisci con r0 per beqz
                                map[field]=this.fields[i].trim();
                            }
                        }
                       
                    }
                }
            }else{
                map[field]=instrFieldsArr[count].trim()
                count++;
            }
        }
        //Convert instruction
        var cop=this.copBytes;
        var rs1=this.nc.reg2bin(map["rs1"].trim());
        var rs2=this.nc.reg2bin(map["rs2"].trim());
        var cost= this.parseConstantUnsigned(map["cost"].trim(),currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb,16);
        const binaryString=cop + rs1 + rs2 + cost; 
        const hexString=this.nc.bin2hex(binaryString);
        return hexString
    }

    
}