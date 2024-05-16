export default class CopMemoryCell{
    private _copName: string;
    private _cellBits: number[];
    
    constructor(){
        this._cellBits= Array(16).fill(0)
        this._copName="";
    }

    setCopName(name:string){
        this._copName=name;
    }

    getCopName(){
        return this._copName;
    }

    setInstructionType(type: 'r'|'i'|'j'){
        if(type=='r'){
            this._cellBits[0]=0; //b15
            this._cellBits[1]=0; //b14
            return;
        }
        if(type=='i'){
            this._cellBits[0]=0; //b15
            this._cellBits[1]=1; //b14
            return;
        }
        if(type=='j'){
            this._cellBits[0]=1; //b15
            this._cellBits[1]=1; //b14
            return;
        }
        throw new Error("unknown instruction type in link: "+type)
    }

    setStartAddress(address: number){
        const bits= this.dec2binUnsigned(address,10);
        for(var i=0; i<bits.length;i++){
            const currBit= bits.charAt(i)=='1'?1:0;
            this._cellBits[2+i]=currBit;
        }        
    }

    setCounterCompareValue(clocks:number){
        const bits= this.dec2binUnsigned(clocks,4);
        for(var i=0; i<bits.length;i++){
            const currBit= bits.charAt(i)=='1'?1:0;
            this._cellBits[12+i]=currBit;
        }
    }

    getAsHexString(){
        //console.log(this._controlBits)
        var out=""
        var currWord="";
        var blockCount=0;
        for(const bit of this._cellBits){    
            currWord=currWord+bit.toString();
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
                currWord="";
                blockCount=0;
            }
        }
        return out;
    }

    private dec2binUnsigned(decimal:number,size:number){
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