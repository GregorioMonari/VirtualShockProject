class VshAssembler{
    constructor(){
        this.log=new GregLogs();
        this.log.info("INITIALIZING ISA MANAGER")
        //The ISA MANAGER is the only persistent db, do not recreate it every time
        //equ and db will vary 
        this.isaManager= new IsaManager();


    }

    assembleRawTxtAssembly(rawTxt){
        this.log.info("** Starting assembly")
        this.log.info("-----------<PREASSEMBLATION>---------")
        var cleanCode=this.removeCommentsFromCode(rawTxt)
        this.log.trace(cleanCode)
        this.log.debug("** Getting main procedure")
        var mainBlock=this.getMainBlock(cleanCode)

        this.log.trace(mainBlock)


        this.log.info("-----------<ASSEMBLATION>----------")
        var dirtyMainArr=mainBlock.split("\n")
        var mainArr=[];
        var counter=0;
        Object.keys(dirtyMainArr).forEach(k=>{
            var line=dirtyMainArr[k].trim()
            if(line!=""){
                mainArr[counter]=line
                counter++;
            }
            
        })
        this.log.trace(mainArr)

        this.log.trace("** Assembling main block")
        var mainMachineCodeArr=[]
        Object.keys(mainArr).forEach(k=>{
            var instructionMC=this.isaManager.parseInstruction(mainArr[k]);
            this.log.trace(instructionMC)
            mainMachineCodeArr.push(instructionMC)
        })

        return mainMachineCodeArr

    }


    getMainBlock(code){

        const re = new RegExp("proc *main *{");
        var res=re.exec(code);
        var index=res.index;
        this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var mainBlock=code.slice(openBracketIndex+1,closedBracketIndex);

        return mainBlock
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