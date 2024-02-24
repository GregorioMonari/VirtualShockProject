const GregLogs=require("../../GregLogs/GregLogs")
const NumberConversionManager= require("../NumberConversionManager")
const CodeSlicer=require("./CodeSlicer")
const IsaManager=require("../../IsaManager")
module.exports=class VshAssembler{
    constructor(){
        this.log=new GregLogs();
        this.log.info("==========INITIALIZING ISA MANAGER========")
        //The ISA MANAGER is the only persistent db, do not recreate it every time
        //equ and db will vary 
        this.isaManager= new IsaManager();
        this.wordSize=1 //bytes
        var mainFirstAddress="0000h"
        var variablesFirstAddress="0010h"
        var proceduresFirstAddress="0fffh"
        this.codeSlicer= new CodeSlicer(this.wordSize,mainFirstAddress,variablesFirstAddress,proceduresFirstAddress);
        this.nc= new NumberConversionManager()
        this.log.info("==========================================")
        console.log(" ")

    }

    assembleRawTxtAssembly(rawTxt){
        this.log.info("-------------------<PREASSEMBLATION>-------------------")
        this.log.info("** Removing comments from code")
        var cleanCode=this.removeCommentsFromCode(rawTxt) //clean code from comments, returns a string
        this.log.trace(cleanCode)

        this.log.info("** Getting code sections")
        var codeObj=this.codeSlicer.getCodeSections(cleanCode); //divide code into sections
        this.log.debug(codeObj)
        this.log.debug(codeObj.Nprocs)
        if(codeObj.Nprocs==0){
            if(!codeObj.main.isPresent){
                this.log.debug(JSON.stringify(codeObj.main))
                throw new Error("Invalid file")
            }
        }

        this.log.info("---------------------<ASSEMBLATION>--------------------")
        //var mainMachineCodeArr=this.assembleCodeObject(codeObj); //assemble main instructions
        this.log.info("** Assembling main")
        var mainMachineCodeArr=this.assembleCodeObject(
            codeObj.main.data,
            codeObj.main.firstAddress,
            codeObj.main.jumpDb,
            codeObj.equ,
            codeObj.db,
            codeObj.procsPublicDb
        )

        //var proceduresMachineCodeArr=this.assembleProceduresObject(codeObj); //assemble procedures
        //proc array
        this.log.info("** Assembling procedures")
        var allProcArr=codeObj.procedures;
        var allProcMachineCodeArr=[]
        var count=0;
        for(var k in allProcArr){
            this.log.debug("** Assembling procedure: "+k+" ["+(count+1)+"/"+codeObj.Nprocs+"]")

            var singleProcArr=this.assembleCodeObject(
                allProcArr[k].data,
                allProcArr[k].firstAddress,
                allProcArr[k].jumpDb,
                codeObj.equ,
                codeObj.db,
                codeObj.procsPublicDb
            )

            allProcMachineCodeArr.push(singleProcArr)
            count++
        }    
        //Spread proc codes in one single array
        var procMachineCodeArr=[]
        for(var i in allProcMachineCodeArr){
            var currProcArr=allProcMachineCodeArr[i];

            for(var j in currProcArr){

                procMachineCodeArr.push(currProcArr[j])

            }

        }




        return {
            "mainMc":mainMachineCodeArr,
            "procMc":procMachineCodeArr
        }

    }


    assembleCodeObject(blockArr,firstAddr,jumpDb,equDirs,dbDirs,procsPublicDb){
        //this.log.debug("** Assembling block")

        var mainFirstAddr=this.nc.hex2bin(firstAddr);
        mainFirstAddr=this.nc.bin2decUnsigned(mainFirstAddr);

        //output
        var mainMachineCodeArr=[]
        var counter=0;
        Object.keys(blockArr).forEach(k=>{

            //IL COUNTER CONTA GIA' PC<-PC+wordSize
            var currAddrCount=mainFirstAddr+(counter*this.wordSize)+this.wordSize

            var instructionMC=this.isaManager.parseInstruction(blockArr[k],currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb);
            this.log.trace(instructionMC)
            mainMachineCodeArr.push(instructionMC)
            
            counter++
        })

        return mainMachineCodeArr
    }


    removeCommentsFromCode(text){
        //this.log.debug("** removing comments from code")
        var cStart=0;
        var cEnd=0;
        var commentsPresent=true;
        /*
        while(commentsPresent){

        }

        for(var char in text){
            
        }
        */
       return text
        
    }
}