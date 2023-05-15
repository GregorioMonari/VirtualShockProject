class VshAssembler{
    constructor(){
        this.log=new GregLogs();
        this.log.info("INITIALIZING ISA MANAGER")
        //The ISA MANAGER is the only persistent db, do not recreate it every time
        //equ and db will vary 
        this.isaManager= new IsaManager();

        this.variablesFirstAddress="00ffh"
        this.proceduresFirstAddress=""
    }

    assembleRawTxtAssembly(rawTxt){
        this.log.info("** Starting assembly")
        this.log.info("-----------<PREASSEMBLATION>---------")
        var cleanCode=this.removeCommentsFromCode(rawTxt)
        this.log.trace(cleanCode)
        this.log.debug("** Getting main procedure")
        var res=this.sliceMainBlock(cleanCode)
        var mainBlock=res[0];
        cleanCode=res[1]

        this.log.debug(mainBlock)
        this.log.debug(cleanCode)

        //const re = new RegExp("proc");
        //var res=re.exec(cleanCode);
        //this.log.debug(res)

        //at this point in clean code there are only includes and equ/db
        //Divide and clean remaining lines
        var lineArr=cleanCode.split("\n")
        var temp=[]
        Object.keys(lineArr).forEach(k=>{
            var el=lineArr[k].trim()
            if(el!=""){
                temp.push(el)
            }
        })
        lineArr=temp

        //Get EQU Directives
        this.log.debug(lineArr)
        var equDirs={}
        const re = new RegExp("equ");
        Object.keys(lineArr).forEach(k=>{
            if(re.test(lineArr[k])){
                var res=re.exec(lineArr[k])
                var index=res.index;
                var left=lineArr[k].slice(0,index-1).trim();
                var right=lineArr[k].slice(index+3,lineArr[k].length).trim();
                equDirs[left]=right;
            }   
        })

        this.log.debug(equDirs)

        //Get DB Directives
        //this.log.debug(lineArr)
        var dbDirs={}
        const re1 = new RegExp("db");
        Object.keys(lineArr).forEach(k=>{
            if(re1.test(lineArr[k])){
                var res=re1.exec(lineArr[k])
                var index=res.index;
                var left=lineArr[k].slice(0,index-1).trim();
                var right=lineArr[k].slice(index+2,lineArr[k].length).trim();
                dbDirs[left]=right;
            }   
        })

        this.log.debug(dbDirs)



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
            var instructionMC=this.isaManager.parseInstruction(mainArr[k],equDirs,dbDirs);
            this.log.trace(instructionMC)
            mainMachineCodeArr.push(instructionMC)
        })

        return mainMachineCodeArr

    }


    getEquDirsJson(code){

    }



    sliceMainBlock(code){

        const re = new RegExp("proc *main *{");
        var res=re.exec(code);
        var index=res.index;
        this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var mainBlock=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        return [mainBlock,leftslice+rightslice]
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