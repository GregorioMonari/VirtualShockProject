class JumpInstruction extends Instruction{

    constructor(copBytes,fields){
        super(copBytes,fields)
    }


//@OVERRIDE
assembleInstruction(instrFieldsString,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb){
    this.log.trace("ASSEMBLING JUMP INSTRUCTION")

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
    var cost= this.parseConstantUnsigned(map["cost"],currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb);
    const binaryString=cop + cost;
    const hexString=this.nc.bin2hex(binaryString);

    return hexString
}

parseConstantUnsigned(n,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb){
    this.log.trace("Parsing variable: "+n)
    //CHECK FOR JUMPS
    this.log.trace("Checking jumps")
    this.log.trace(jumpDb)
    for(var k in jumpDb){
        if(n==k){
            var labelIndex=this.nc.hex2bin(jumpDb[k],26);
            labelIndex=this.nc.bin2decUnsigned(labelIndex);
            this.log.trace("Label index: "+labelIndex)
            this.log.trace("CurrAddrCount after pc<-pc+ws: "+currAddrCount)
            var offset=labelIndex-currAddrCount;

            

            this.log.trace("Substituting "+n+" with "+offset)
            //n=equDirs[k];
            this.log.trace("parsing decimal signed")
            return out=this.nc.dec2binSigned(offset,26)

            
        }
    }        
    
    this.log.trace("Checking jumps to procedures")
    this.log.trace(procsPublicDb)
    for(var k in procsPublicDb){
        if(n==k){
            var labelIndex=this.nc.hex2bin(procsPublicDb[k],26);
            labelIndex=this.nc.bin2decUnsigned(labelIndex);
            this.log.trace("Label index: "+labelIndex)
            this.log.trace("CurrAddrCount after pc<-pc+ws: "+currAddrCount)
            var offset=labelIndex-currAddrCount;

            

            this.log.trace("Substituting "+n+" with "+offset)
            //n=equDirs[k];
            this.log.trace("parsing decimal signed")
            return out=this.nc.dec2binSigned(offset,26)

            
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
    this.log.trace(costType)

    var out=""
    switch (costType) {
        case "decimal": 
            this.log.trace("parsing decimal unsigned")
            out=this.nc.dec2binUnsigned(parseInt(n),26);
            break;
        case "binary":
            var temp=n.slice(0,n.length-1)    
            this.log.trace(temp)
            if(temp.length<26){
                var left=26-temp.length;
                
                for(var i=0;i<left;i++){
                    out=out+"0";
                }

                out=out+temp
            }
            break;
        case "hexadecimal":
            out=this.nc.hex2bin(n,26)
            break;      
        default:
            break;
    }

    return out
}



}