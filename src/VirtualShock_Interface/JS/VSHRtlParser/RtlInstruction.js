class RtlInstruction{
    constructor(rtlString,bitmap,microCodeWord){
        var temp=rtlString.trim();
        this.rtlString=temp.toLowerCase()
        this.bitmap=bitmap;
        this.log=new GregLogs()
        this.microCodeWord=microCodeWord
    }
    getBitMap(){
        return this.bitmap;
    }
    getRtlString(){
        return this.rtlString;
    }

    newCtrlBitsArr(){
        var out=[]
        for(var i=0; i<this.microCodeWord;i++){
            out.push(0)
        }
        return out
    }

    getCtrlBitsArr(){           
        var line=this.getRtlString()
        var lineArr=line.split("|")
        var ctrlBitsArr=this.newCtrlBitsArr()
        for(var j in lineArr){
            const microInstruction=lineArr[j].trim();
            this.parseRtlMicroInstruction(microInstruction,ctrlBitsArr)
        }
        return ctrlBitsArr
    }


    parseRtlMicroInstruction(instr,ctrlBitsArr){
        this.log.debug("Parsing rtl microinstruction: "+instr)
        if(instr.includes("<-")){
            //allora è un microspostamento
            var instrArr=instr.split("<-")
            var dest=instrArr[0].trim();
            var source=instrArr[1].trim();
            console.log("Dest: "+dest+", source: "+source)
            this.parseRtlDest(dest,ctrlBitsArr)
            //parse source
            this.parseRtlSource(source,ctrlBitsArr)
        }else{
            this.parseRtlCondition(instr,ctrlBitsArr)
        }

    }

    //parse dest
    parseRtlDest(dest,ctrlBitsArr){
        const reMem=new RegExp(/(m\[)(.*)(\])/);
        const bitmap=this.getBitMap()
        if(bitmap.hasOwnProperty(dest)){
            const ctrlBit=bitmap[dest]["we"]
            ctrlBitsArr[ctrlBit]=1
        }else{
            throw new Error("Unknown bitmap dest")
        }     
    }
    parseRtlSource(source,ctrlBitsArr){
        const bitmap=this.getBitMap()
        const reMem=new RegExp(/(m\[)(.*)(\])/);
        const reIo=new RegExp(/(i\/o\[)(.*)(\])/);

        if(reMem.test(source)){
            this.log.debug("Parsing mem instruction")
            var op2=source.slice(2,source.length-1)
            //TODO:mem+mux
            return;
        }
        if(reIo.test(source)){
            this.log.debug("Parsing mem instruction")
            var op2=source.slice(2,source.length-1)
            //TODO:mem+mux
            return;
        }
        if(source.includes("+")){
            this.parseAluOperation(source,"+",ctrlBitsArr)
            return;
        }
        if(source.includes("-")){
            this.parseAluOperation(source,"-",ctrlBitsArr)
            return;
        }
        if(source.includes("*")){
            this.parseAluOperation(source,"*",ctrlBitsArr)
            return;
        }
        if(source.includes("/")){
            this.parseAluOperation(source,"/",ctrlBitsArr)
            return;
        }
        if(source.includes(">>")){
            this.parseAluOperation(source,">>",ctrlBitsArr)
            return;
        }
        if(source.includes("<<")){
            this.parseAluOperation(source,"<<",ctrlBitsArr)
            return;
        }
        if(source.includes("and")){
            this.parseAluOperation(source,"and",ctrlBitsArr)
            return;
        }
        if(source.includes("or")){
            this.parseAluOperation(source,"or",ctrlBitsArr)
            return;
        }
        if(source.includes("not")){
            this.parseAluOperation(source,"not",ctrlBitsArr)
            return;
        }
        if(source.includes("xor")){
            this.parseAluOperation(source,"xor",ctrlBitsArr)
            return;
        }
        //IF NONE OF THIS MATCH, IT IS A SIMPLE MOVEMENT
        if(bitmap.hasOwnProperty(source)){
            const ctrlBitOp2=bitmap[source]["oe1"]
            ctrlBitsArr[ctrlBitOp2]=1
        }else{
            throw new Error("Unknown bitmap source")
        }


    }
    parseAluOperation(source,op,ctrlBitsArr){
        this.log.debug("Parsing alu operation: "+op)
        const bitmap=this.getBitMap()
        var sourceArr=source.split(op)
        var op1=sourceArr[0].trim()
        var op2=sourceArr[1].trim()
        if(bitmap.hasOwnProperty(op1)){
            const ctrlBitOp1=bitmap[op1]["oe1"]
            ctrlBitsArr[ctrlBitOp1]=1
        }else{
            throw new Error("Unknown bitmap source")
        }


        switch (op2) {
            case "cost":
                const ctrlBitOp2=bitmap["cost"]["oe2"]
                ctrlBitsArr[ctrlBitOp2]=1
                var aluCtrlBits=bitmap.aluCtrl.operationsMap[op]   
                for(var i in aluCtrlBits){
                    const aluCtrlBitMap=aluCtrlBits[i]
                    const aluCtrlBit=bitmap.aluCtrl[aluCtrlBitMap]
                    ctrlBitsArr[aluCtrlBit]=1
                }               
                break;
            
            case "1":
                if(op=="+"){
                    var aluCtrlBits=bitmap.aluCtrl.operationsMap["+1"]   
                    for(var i in aluCtrlBits){
                        const aluCtrlBitMap=aluCtrlBits[i]
                        const aluCtrlBit=bitmap.aluCtrl[aluCtrlBitMap]
                        ctrlBitsArr[aluCtrlBit]=1
                    }
                }
                break;

            case "4":
                if(op=="+"){
                    var aluCtrlBits=bitmap.aluCtrl.operationsMap["+4"]   
                    for(var i in aluCtrlBits){
                        const aluCtrlBitMap=aluCtrlBits[i]
                        const aluCtrlBit=bitmap.aluCtrl[aluCtrlBitMap]
                        ctrlBitsArr[aluCtrlBit]=1
                    }
                }
                break;
        
            default:
                //IF NONE MATCH
                this.log.debug("standard alu operation")
                if(bitmap.hasOwnProperty(op2)){
                    const ctrlBitOp2=bitmap[op2]["oe2"]
                    ctrlBitsArr[ctrlBitOp2]=1
                    var aluCtrlBits=bitmap.aluCtrl.operationsMap[op]   
                    for(var i in aluCtrlBits){
                        const aluCtrlBitMap=aluCtrlBits[i]
                        const aluCtrlBit=bitmap.aluCtrl[aluCtrlBitMap]
                        ctrlBitsArr[aluCtrlBit]=1
                    }
                }else{
                    throw new Error("Unknown bitmap source")
                }
                break;
        }




    }


    parseRtlCondition(condition,ctrlBitsArr){}

}