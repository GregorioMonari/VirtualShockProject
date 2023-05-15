class ImmediateInstruction extends Instruction{

    constructor(copBytes,fields){
        super(copBytes,fields)
    }

    //@OVERRIDE
    assembleInstruction(instrFieldsString,currAddrCount,jumpDb,equDirs,dbDirs){
        this.log.trace("ASSEMBLING IMMEDIATE INSTRUCTION")

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
        var cost= this.parseConstantUnsigned(map["cost"],currAddrCount,jumpDb,equDirs,dbDirs);
        const binaryString=cop + rs1 + rs2 + cost;
        const hexString=this.nc.bin2hex(binaryString);

        return hexString
    }

    parseConstantUnsigned(n,currAddrCount,jumpDb,equDirs,dbDirs){
        this.log.debug("Parsing variable: "+n)
        //CHECK FOR JUMPS
        this.log.debug("Checking jumps")
        this.log.trace(jumpDb)
        for(var k in jumpDb){
            if(n==k){
                var labelIndex=this.nc.hex2bin(jumpDb[k],16);
                labelIndex=this.nc.bin2decUnsigned(labelIndex);
                this.log.debug("Label index: "+labelIndex)
                this.log.debug("CurrAddrCount after pc<-pc+ws: "+currAddrCount)
                var offset=labelIndex-currAddrCount;

                

                this.log.debug("Substituting "+n+" with "+offset)
                //n=equDirs[k];
                this.log.trace("parsing decimal signed")
                return out=this.nc.dec2binSigned(offset,16)

                
            }
        }        
        
        
        
        //CHECH EQU OR DB DIRS
        this.log.debug("Checking equDirs")
        //console.log(equDirs)
        for(var k in equDirs){
            //console.log(k)
            if(n==k){
                this.log.debug("Substituting "+n+" with "+equDirs[k])
                n=equDirs[k];
                
                break;
            }
        }

        this.log.debug("Checking dbDirs")
        for(var k in dbDirs){
            if(n==k){
                this.log.debug("Substituting "+n+" with "+dbDirs[k])
                n=dbDirs[k];
                break;
            }
        }


        //CONVERT N INTO NUMBER
        
        var costType=this.nc.getNumberType(n);
        this.log.trace(costType)

        var out=""
        switch (costType) {
            case "decimal": 
                this.log.trace("parsing decimal unsigned")
                out=this.nc.dec2binUnsigned(parseInt(n),16);
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