const Instruction=require("./Instruction")
module.exports=class ImmediateInstruction extends Instruction{

    constructor(copBytes,fields){
        super(copBytes,fields)
    }

    //@OVERRIDE
    assembleInstruction(instrFieldsString,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb){
        this.log.trace("ASSEMBLING IMMEDIATE INSTRUCTION")

        const defaultFields=["rs2","rs1","cost"];

        var instrFieldsArr= instrFieldsString.split(",");
        this.log.debug(instrFieldsArr);

        this.log.debug(this.fields);

        var map={}
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
                            console.log(arr)
                            const fieldsArr=this.fields[i].split("(")
                            console.log(fieldsArr)
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
        this.log.debug(map)

        //Convert instruction
        var cop=this.copBytes;
        var rs1=this.nc.reg2bin(map["rs1"].trim());
        var rs2=this.nc.reg2bin(map["rs2"].trim());
        var cost= this.parseConstantUnsigned(map["cost"].trim(),currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb);
        const binaryString=cop + rs1 + rs2 + cost; 
        const hexString=this.nc.bin2hex(binaryString);

        return hexString
    }

    parseConstantUnsigned(n,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb){
        this.log.info("Parsing variable: "+n)
        //CHECK FOR JUMPS
        this.log.trace("Checking jumps")
        this.log.trace(jumpDb)
        for(var k in jumpDb){
            if(n==k){
                var labelIndex=this.nc.hex2bin(jumpDb[k],16);
                labelIndex=this.nc.bin2decUnsigned(labelIndex);
                this.log.trace("Label index: "+labelIndex)
                this.log.trace("CurrAddrCount after pc<-pc+ws: "+currAddrCount)
                var offset=labelIndex-currAddrCount;

                

                this.log.trace("Substituting "+n+" with "+offset)
                //n=equDirs[k];
                this.log.trace("parsing decimal signed")
                return out=this.nc.dec2binSigned(offset,16)

                
            }
        }        

        this.log.trace("Checking jumps to procedures")
        this.log.trace(procsPublicDb)
        for(var k in procsPublicDb){
            if(n==k){
                var labelIndex=this.nc.hex2bin(procsPublicDb[k],16);
                labelIndex=this.nc.bin2decUnsigned(labelIndex);
                this.log.trace("Label index: "+labelIndex)
                this.log.trace("CurrAddrCount after pc<-pc+ws: "+currAddrCount)
                var offset=labelIndex-currAddrCount;

                

                this.log.trace("Substituting "+n+" with "+offset)
                //n=equDirs[k];
                this.log.trace("parsing decimal signed")
                return out=this.nc.dec2binSigned(offset,16)

                
            }
        }        
        
        
        
        //CHECH EQU OR DB DIRS
        this.log.trace("Checking equDirs")
        //console.log(equDirs)
        for(var k in equDirs){
            //console.log(k)
            if(n==k){
                this.log.trace("Substituting "+n+" with "+equDirs[k])
                n=equDirs[k];
                
                break;
            }
        }

        this.log.trace("Checking dbDirs")
        for(var k in dbDirs){
            if(n==k){
                this.log.trace("Substituting "+n+" with "+dbDirs[k])
                n=dbDirs[k];
                break;
            }
        }


        //CONVERT N INTO NUMBER
        
        var costType=this.nc.getNumberType(n);
        this.log.debug(costType)

        var out=""
        switch (costType) {
            case "decimal": 
                this.log.trace("parsing decimal unsigned")
                out=this.nc.dec2binSigned(parseInt(n),16);
                break;
            case "binary":
                var temp=n.slice(0,n.length-1)    
                this.log.trace(temp)
                if(temp.length<16){
                    var left=16-temp.length;
                    
                    for(var i=0;i<left;i++){
                        out=out+"0";
                    }

                    out=out+temp
                }
                break;
            case "hexadecimal":
                out=this.nc.hex2bin(n,16)
                break;      
            default:
                break;
        }

        return out
    }

}