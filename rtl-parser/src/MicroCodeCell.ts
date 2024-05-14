export default class MicroCodeCell{
    private _size:number;
    private _controlBits:number[];
    private _active:number;
    private _inactive:number;
    constructor(size:number, active:number= 1){
        this._size=size;
        this._active=active;
        if(this._active==1){
            this._inactive=0
        }else this._inactive=1;
        this._controlBits= Array(this._size).fill(this._inactive)
    }

    setControlBit(position: number){
        if(position>=this._size) throw new Error("Control bit position exceeds microcode cell size")
        if(position<0) throw new Error("Control bit position is lower than 0")
        const arrPosition= (this._size-1) -position;
        this._controlBits[arrPosition]=this._active;
    }

    setManyControlBits(positionArr: number[]){
        for(const position of positionArr){
            if(position>=this._size) throw new Error("Control bit position exceeds microcode cell size")
            if(position<0) throw new Error("Control bit position is lower than 0")
            const arrPosition= (this._size-1) -position;
            this._controlBits[arrPosition]=this._active;
        }
    }

    getAsBinaryArray(){
        return this._controlBits;
    }
    getAsHexString(){
        //console.log(this._controlBits)
        var out=""
        var currWord="";
        var blockCount=0;
        for(const bit of this._controlBits){    
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

    getAsBinString(){}
}