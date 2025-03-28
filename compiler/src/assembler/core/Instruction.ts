import NumberConversionManager from "./NumberConversionManager";
export default class Instruction{
    protected nc:NumberConversionManager;
    protected fields:string;
    protected copBytes:string;
    constructor(copBytes:string,fields:string){
        this.copBytes=copBytes;
        this.fields=fields;
        this.nc=new NumberConversionManager();
    }

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
        return this.copBytes+instrFieldsString
    }

    protected parseConstantUnsigned(
        n:string|number,
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
        },
        constantSize:number){
        for(var k in jumpDb){
            if(n==k){
                const labelIndexString=this.nc.hex2bin(jumpDb[k],constantSize);
                const labelIndex=this.nc.bin2decUnsigned(labelIndexString);
                var offset=labelIndex-currAddrCount-1; //conta pc
                return out=this.nc.dec2binSigned(offset,constantSize)
            }
        }        

        for(var k in procsPublicDb){
            if(n==k){
                const labelIndexString=this.nc.hex2bin(procsPublicDb[k],constantSize);
                const labelIndex=this.nc.bin2decUnsigned(labelIndexString);
                var offset=labelIndex-currAddrCount-1; //conta pc
                return out=this.nc.dec2binSigned(offset,constantSize)
            }
        }        

        for(var k in equDirs){
            if(n==k){
                n=equDirs[k];
                break;
            }
        }

        for(var k in dbDirs){
            if(n==k){
                n=dbDirs[k];
                break;
            }
        }

        //CONVERT N INTO NUMBER
        var costType=this.nc.getNumberType(n);
        var out=""
        switch (costType) {
            case "decimal": 
                //this.log.trace("parsing decimal unsigned")
                out=this.nc.dec2binSigned(parseInt(n as any),constantSize);
                break;
            case "binary":
                var temp=(n as string).slice(0,((n as string).length-1) )   
                //this.log.trace(temp)
                if(temp.length<constantSize){
                    var left=constantSize-temp.length;
                    for(var i=0;i<left;i++){
                        out=out+"0";
                    }
                    out=out+temp
                }
                break;
            case "hexadecimal":
                out=this.nc.hex2bin((n as string),constantSize)
                break;      
            default:
                break;
        }
        return out
    }
}