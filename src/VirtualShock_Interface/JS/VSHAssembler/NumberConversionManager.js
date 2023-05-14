class NumberConversionManager{
    constructor(){
        this.log=new GregLogs()
    }

    getNumberType(n){
        var string="ciao";
        var number=1;

        if(typeof n == typeof string){
            return "string"
        }
        if(typeof n == typeof string){
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

    bin2hex(n){

        return n

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
                console.log(resto)
                console.log(quoziente)
                if(resto==0){
                    binArr[counter]="0"
                }else{
                    binArr[counter]="1"
                }
                decimal=quoziente
                
                counter++
            }
            console.log(binArr)     
            //Extend to n bit
            if(binArr.length<size){
                var left=size-binArr.length
                var oldl=binArr.length
                for(var i=0; i<left; i++){
                    binArr[oldl+i]="0"
                }
            }

            console.log(binArr)
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
                throw new Error("Regiters cannot be negative")
            }
        }

        console.log(binString)
        return binString

    }

}