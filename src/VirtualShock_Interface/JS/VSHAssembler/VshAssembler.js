class VshAssembler{
    constructor(){
        this.log=new GregLogs();
        this.log.info("INITIALIZING ISA MANAGER")
        //The ISA MANAGER is the only persistent db, do not recreate it every time
        //equ and db will vary 
        this.isaManager= new IsaManager();

        this.wordSize=1 //bytes
        var mainFirstAddress="0000h"
        var variablesFirstAddress="0010h"
        var proceduresFirstAddress="0fffh"
        this.codeSlicer= new CodeSlicer(this.wordSize,mainFirstAddress,variablesFirstAddress,proceduresFirstAddress);
        this.nc= new NumberConversionManager()

    }

    assembleRawTxtAssembly(rawTxt){
        this.log.info("** Starting assembly")
        this.log.info("-----------<PREASSEMBLATION>---------")
        var cleanCode=this.removeCommentsFromCode(rawTxt) //clean code from comments, returns a string
        this.log.trace(cleanCode)
        this.log.debug("** Getting main procedure")

        var codeObj=this.codeSlicer.getCodeSections(cleanCode); //divide code into sections
        this.log.debug(codeObj)

        this.log.info("-----------<ASSEMBLATION>----------")
        var mainMachineCodeArr=this.assembleCodeObject(codeObj); //assemble main instructions


        return mainMachineCodeArr

    }


    assembleCodeObject(codeObj){
        this.log.trace("** Assembling main block")
        //main array
        var mainArr=codeObj.main.data;

        //calculate jumps
        var mainFirstAddr=codeObj.main.firstAddress
        var currAddress=this.nc.hex2bin(mainFirstAddr);
        currAddress=this.nc.bin2decUnsigned(currAddress);
        var jumpDb=codeObj.main.jumpDb

        //directives
        var equDirs=codeObj.equ;
        var dbDirs=codeObj.db;

        //output
        var mainMachineCodeArr=[]
        var counter=0;
        Object.keys(mainArr).forEach(k=>{


            var currAddrCount=mainFirstAddr+(counter*this.wordSize)

            var instructionMC=this.isaManager.parseInstruction(mainArr[k],currAddrCount,jumpDb,equDirs,dbDirs);
            this.log.trace(instructionMC)
            mainMachineCodeArr.push(instructionMC)
            
            counter++
        })

        return mainMachineCodeArr
    }



    removeCommentsFromCode(text){
        this.log.debug("** removing comments from code")
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