//const ModularVshAssembler= require("./VSHAssemblerNaive/ModularVshAssembler");
const express= require("express")
const cors=require("cors")
const VshAssembler=require("./VSHAssemblerNaive/core/extended/VshAssembler");
const NumberConversionManager= require("./VSHAssemblerNaive/core/NumberConversionManager")
const numberConverter=new NumberConversionManager()
const IsaManager=require("./VSHAssemblerNaive/IsaManager")
/*
const test=`
proc main{
    add r1,r2,r3
    addi r1,r2,15h
}
`
const result=assemble(test)
console.log(result)
*/


class VSHAssemblerApi{
    constructor(port){
        this.port=port;
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json())
        this.defineRoutes();
        //this.test()
    }

    test(){
        const mg= new IsaManager();
        const res= mg.parseInstruction("sw ciao(r1),r2")
        console.log(res)
    }

    defineRoutes(){
        this.app.get('/vshapi/ping', (req, res) => {
            res.send({status:"ok"})
          })

        this.app.post('/vshapi/assemble', (req, res) => {

            if(req.body.hasOwnProperty("value")){
                const rawText=req.body.value;

                console.log("Raw text in:",rawText)
                const out=this.assemble(rawText);
                console.log("Machine code:",out)
    
                res.send({"out":out})
            }else{
                res.status(403).send({error:"missing value field"})
            }

          })
    }




    assemble(rawText){
        var _mainFirstAddress="0000h"
        var _variablesFirstAddress="0010h"
        var _proceduresFirstAddress="1000h"
        //var assembler=new ModularVshAssembler(_mainFirstAddress,_variablesFirstAddress,_proceduresFirstAddress);
        var assembler=new VshAssembler(_mainFirstAddress,_variablesFirstAddress,_proceduresFirstAddress);
     
        var out = assembler.assembleRawTxtAssembly(rawText);
        var mainMachineCode=out["mainMc"];
        var procMachineCode=out["procMc"];
    
        var start=numberConverter.hex2bin(_mainFirstAddress);
        start=numberConverter.bin2decUnsigned(start);
        var end=start+mainMachineCode.length;
    
        var machineCodeString="";
        for(var i in mainMachineCode){
            machineCodeString=machineCodeString+"0b"+numberConverter.hex2bin(mainMachineCode[i])+"\n"
        }
    
        if(procMachineCode.length>0){
            var procStart=numberConverter.hex2bin(_proceduresFirstAddress);
            procStart=numberConverter.bin2decUnsigned(procStart);
        
            for(var j=end;j<procStart;j++){
                machineCodeString=machineCodeString+"0b00000000000000000000000000000000\n"
            }
        
            for(var i in procMachineCode){
                machineCodeString=machineCodeString+"0b"+numberConverter.hex2bin(procMachineCode[i])+"\n"
            }
        }
        return machineCodeString
    }

    listen(){
        return new Promise((resolve,reject)=>{
            this.app.listen(this.port, () => {
                console.log(`Assembler Api listening on port ${this.port}`)
                resolve(true)
              })
        })
    }
}

module.exports=VSHAssemblerApi;