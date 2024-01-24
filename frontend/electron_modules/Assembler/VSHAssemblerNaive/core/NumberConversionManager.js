const GregLogs=require("../GregLogs/GregLogs")
module.exports=class NumberConversionManager{
    constructor(){
        this.log=new GregLogs()
    }

    getNumberType(n){
        var string="ciao";
        var number=1;


        if(typeof n == typeof string){
            var string=n.toLowerCase()
            if(string.endsWith("h")){
                return "hexadecimal"
            }else{
                if(string.endsWith("b")){
                    return "binary"
                }else{
                    return "decimal"
                }
            }
        }
        if(typeof n == typeof number){
            return "decimal"
        }

    }

    reg2bin(regString){

        this.log.trace("Parsing register: "+regString)

        var regNumber=parseInt(regString.slice(1))

        this.log.trace("Register number: "+regNumber)

        var binString=this.dec2binUnsigned(regNumber,5)

        return binString
    }

    hex2bin(n,size){
        var clean=n.slice(0,n.length-1);
        this.log.trace(clean.length)

        var out=""
        for(var i=0; i<clean.length;i++){
            switch (clean.charAt(i)) {
                case "0":
                    out=out+"0000"
                    break;
                case "1":
                    out=out+"0001"
                    break;   
                case "2":
                    out=out+"0010"
                    break;     
                case "3":
                    out=out+"0011"
                    break;    
                case "4":
                    out=out+"0100"
                    break;    
                case "5":
                    out=out+"0101"
                    break;    
                case "6":
                    out=out+"0110"
                    break;    
                case "7":
                    out=out+"0111"
                    break;    
                case "8":
                    out=out+"1000"
                    break;    
                case "9":
                    out=out+"1001"
                    break;    
                case "a":
                    out=out+"1010"
                    break;   
                case "b":
                    out=out+"1011"
                    break;    
                case "c":
                    out=out+"1100"
                    break;    
                case "d":
                    out=out+"1101"
                    break;    
                case "e":
                    out=out+"1110"
                    break;    
                case "f":
                    out=out+"1111"
                    break; 
            
                default:
                    break;
            }
        }

        this.log.trace(out.length)
        //extend
        if(out.length<size){
            var left=size-out.length;
            var temp=""
            for(var i=0; i<left; i++){
                temp=temp+"0";
            }
            out=temp+out;
        }

        return out

    }

    bin2hex(n){
        //console.log(n)
        var slice=""
        //console.log((n.length%4))
        if((n.length%4)>0){
            console.log("Extending hex")
            for(var i=0; i<n.length%4; i++){
                slice=slice+"0"
            }
            n=slice+n;
        }
        //console.log(n)

        var out=""
        var currWord="";
        var blockCount=0;
        for(var i in n){
            
            currWord=currWord+n.charAt(i)
            //console.log(i+":"+currWord)
            blockCount++
                
            
            if(blockCount>3){
                switch (currWord) {
                    case "0000":
                        out=out+"0"
                        break;
                    case "0001":
                        out=out+"1"
                        break;   
                    case "0010":
                        out=out+"2"
                        break;     
                    case "0011":
                        out=out+"3"
                        break;    
                    case "0100":
                        out=out+"4"
                        break;    
                    case "0101":
                        out=out+"5"
                        break;    
                    case "0110":
                        out=out+"6"
                        break;    
                    case "0111":
                        out=out+"7"
                        break;    
                    case "1000":
                        out=out+"8"
                        break;    
                    case "1001":
                        out=out+"9"
                        break;    
                    case "1010":
                        out=out+"a"
                        break;   
                    case "1011":
                        out=out+"b"
                        break;    
                    case "1100":
                        out=out+"c"
                        break;    
                    case "1101":
                        out=out+"d"
                        break;    
                    case "1110":
                        out=out+"e"
                        break;    
                    case "1111":
                        out=out+"f"
                        break; 
                
                    default:
                        break;
                } 
                //console.log("OUT: "+out)
                currWord="";
                blockCount=0;
            }
            

        }


        return out

    }

    bin2decUnsigned(n){

        var out=0;
        for(var i in n){
            var bit=parseInt(n[n.length-i-1])
            var weight=Math.pow(2,i)
            out=out+(bit*weight)
        }
        return out

    }


    dec2binSigned(decimal,size){
        if(decimal<0){
            var mod=decimal*-1
            var n=this.dec2binUnsigned(mod,size)
            var notN="";
            for(var i in n){
                var bin=n.charAt(i);
                if(bin=="0"){
                    notN=notN+"1";
                }else{
                    notN=notN+"0";
                }
            }
            var temp=parseInt(this.bin2decUnsigned(notN))
            temp=temp+1;
            var notNincr=this.dec2binUnsigned(temp,size)
            return notNincr

        }else{
            //throw new Error("Dec2bin signed for integers >0 not yet implemented")
            return this.dec2binUnsigned(decimal,size);

        }
    }

    dec2binUnsigned(decimal,size){
        if(size==null || size == undefined){throw new Error("dec2bin needs the size of the output number to be specified: dec2bin(decimal,size)")}
        
        var binString="";
        if(decimal>0){

            var binArr=[];
            var counter=0;
            while(decimal>0){
                var resto=decimal % 2;
                var quoziente=Math.floor(decimal/2);
                //console.log(resto)
                //console.log(quoziente)
                if(resto==0){
                    binArr[counter]="0"
                }else{
                    binArr[counter]="1"
                }
                decimal=quoziente
                
                counter++
            }
            //console.log(binArr)     
            //Extend to n bit
            if(binArr.length<size){
                var left=size-binArr.length
                var oldl=binArr.length
                for(var i=0; i<left; i++){
                    binArr[oldl+i]="0"
                }
            }

            //console.log(binArr)
            //Convert to string
            for(var i = 0; i<size; i++){
                binString=binString+binArr[size-i-1]
            }
            
        }else{
            if(decimal==0){
                for(var i=0; i<size; i++){
                    binString=binString+"0"
                }
            }else{
                throw new Error("Dec2bin Unsigned accepts only numbers >=0, received a negative number")
            }
        }

        //console.log(binString)
        return binString

    }

}