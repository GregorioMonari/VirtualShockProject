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
        var cost= this.parseConstantUnsigned(map["cost"],equDirs,dbDirs);
        const binaryString=cop + rs1 + rs2 + cost;
        const hexString=this.nc.bin2hex(binaryString);

        return hexString
    }

    parseConstantUnsigned(n,equDirs,dbDirs){
        this.log.debug("Parsing variable: "+n)
        //FIRST CHECH EQU OR DB DIRS
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