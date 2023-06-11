class RtlManager{
    constructor(){
        this.log=new GregLogs();
        this.microCodeWord=32;
    }

    test(){
        console.log("TESTING")
        var string=`
#Executed at the beginning of every instruction:
ir<-m[pc]
pc<-pc+1 | a<-rs1 | b<-rs2
@tag:add
#Adds two registers and writes the result in the RF
c<-a+b
rd<-c
@tag:sub
c<-a-b
rd<-c
@tag:seq
a==b ? mj 1
c<-1
c<-0
rd<-c
@tag:beqz
a==0
pc<-pc+const
`
        this.parseRtlFile(string)
    }

    getBitMap(){
        return {
            "aluCtrl":{
                "operationsMap":{
                    "+":["m","ci","c2","c1","c0"],
                    "-":["m","ci","c2","c1","c0"],
                    "*":["m","ci","c2","c1","c0"],
                    "/":["m","ci","c2","c1","c0"],
                    "and":["m","ci","c2","c1","c0"],
                    "or":["m","ci","c2","c1","c0"],
                    "not":["m","ci","c2","c1","c0"],
                    "xor":["m","ci","c2","c1","c0"],
                    "0":["m","ci","c2","c1","c0"],
                    "1":["m","ci","c2","c1","c0"],
                    "4":["m","ci","c2","c1","c0"],
                    "+1":["m","ci","c2","c1","c0"],
                    "+4":["m","ci","c2","c1","c0"],
                },
                "c0":0,
                "c1":1,
                "c2":2,
                "ci":3,
                "m":4
            },
            "mem":{
                "rd":0,
                "wr":0
            },
            "io":{
                "rd":0,
                "wr":0
            },
            "a":{
                "we":5,
                "oe1":6,
                "oe2":7
            },
            "b":{
                "we":8,
                "oe1":9,
                "oe2":10
            },
            "c":{
                "we":11,
                "oe1":12,
                "oe2":13                
            },
            "pc":{
                "we":14,
                "oe1":15,
                "oe2":16
            },
            "temp":{
                "we":17,
                "oe1":18,
                "oe2":19
            },
            "iar":{
                "we":20,
                "oe1":21,
                "oe2":22
            },
            "mar":{
                "we":23,
                "oe1":24,
                "oe2":25
            },
            "mdr":{
                "we":26,
                "oe1":27,
                "oe2":28
            },
            "ir":{
                "we":0,
                "oe1":0,
                "oe2":0
            },
            "cost":{
                "oe2":0
            },

        }
    }




    parseRtlFile(rawTxt){
        var res=this.extractCommentsFromRtlFile(rawTxt);
        var microInstructionsArr=res[0]
        var assDocs=res[1]
        this.log.debug(microInstructionsArr)
        this.log.debug(assDocs)

        var ret=this.parseRtlArray(microInstructionsArr)
        console.log(ret)
    }



    parseRtlArray(arr){
        var romArr=[];
        for(var i in arr){
           var microInstruction=new RtlInstruction(arr[i],this.getBitMap(),this.microCodeWord)
            romArr.push(microInstruction.getCtrlBitsArr())
        }
        return romArr;
    }
    




    extractCommentsFromRtlFile(rawTxt){
        var lineArr=rawTxt.split("\n")
        var microInstructionsArr=[]
        var currCopDirective=null
        var assDocs={
            "copDirectives":{}
        }
        for(var rowNumber in lineArr){
            var row=lineArr[rowNumber].trim()
            if(lineArr[rowNumber]){ //se non è vuota
                if(!row.startsWith("@")){

                    //aggiungi a copdirective se esiste
                    if(currCopDirective!=null){
                        var copDirs=assDocs.copDirectives
                        copDirs[currCopDirective].push(lineArr[rowNumber])
                    }

                    if(!row.startsWith("#")){
                        var microInstruction=""
                        if(row.includes("#")){
                            this.log.debug("divido commento")
                            var temp=row.split("#")
                            microInstruction=temp[0]
                        }else{
                            microInstruction=row
                        }
                        //*HERE WE HAVE AN RTL INSTRUCTION
                        microInstructionsArr.push(microInstruction)
                        //this.log.debug("Pushed microinstruction: "+microInstruction)

                    }else{
                        this.log.debug("Skipping comment: "+row)
                    }
                }else{
                    this.log.debug("AssDoc directive: "+row)
                    currCopDirective=row.split("tag:")[1]
                    var copDirs=assDocs.copDirectives
                    copDirs[currCopDirective]=[]
                    this.log.debug("Added directive: "+currCopDirective)
                }

            }
        }

        return [microInstructionsArr,assDocs]
    }

}