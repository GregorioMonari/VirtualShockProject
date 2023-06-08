class ModularVshAssembler extends VshAssembler{
    constructor(mainFirstAddress,variablesFirstAddress,proceduresFirstAddress){
        super()
        this.dependenciesTreeExtractor= new DependenciesTreeExtractor();
        this.mainFirstAddress=mainFirstAddress//"0000h"
        this.variablesFirstAddress=variablesFirstAddress//"0010h"
        this.proceduresFirstAddress=proceduresFirstAddress//"0fffh"
    }



    async assembleRawTxtAssembly(rawTxt){
        this.log.info("-------------------<GETTING DEPENDENCIES>-------------------")
 
        const dependenciesArr=await this.dependenciesTreeExtractor.getDependenciesArr(rawTxt,"C:\\Users\\Utente\\git\\VirtualShockProject\\src\\project_example_1")
        console.log(dependenciesArr)
        console.log(" ")
        this.log.info("-------------------<PREASSEMBLATION>-------------------")
        const preAssembleRes=await this.preassembleDependenciesArr(dependenciesArr)
        //console.log(preAssembleRes)
        const codeObjArr=preAssembleRes[0];
        const extendsMap=preAssembleRes[1]
        //throw new Error("MAO")
        console.log(" ")
        this.log.info("---------------------<ASSEMBLATION>--------------------")
        var allProcMachineCodeArr=[]
        var mainMachineCodeArr=[]
        for(var i in codeObjArr){
            this.log.debug("Assembling module: "+i)
            const codeDeps=codeObjArr[i].deps;
            var codeObj=codeObjArr[i].obj;
            //CONCATENATE EXTENDS
            for(var ii in codeDeps){
                var depIndex=codeDeps[ii]
                var extendsCache=extendsMap[depIndex]
                Object.keys(extendsCache.procs).forEach(k=>{
                    //!SE CHECKI SE ESISTE GIA' LA CHIAVE PUOI FARE OVERRIDE!
                    codeObj.procsPublicDb[k]=extendsCache.procs[k]
                })
                Object.keys(extendsCache.equ).forEach(k=>{
                    //TODO
                    codeObj.equ[k]=extendsCache.equ[k]
                })
                Object.keys(extendsCache.db).forEach(k=>{
                    //TODO
                    codeObj.db[k]=extendsCache.db[k]
                })
            }

            console.log(codeObj)
            this.log.info("** Assembling procedures")
            var allProcArr=codeObj.procedures;
            
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
            if(codeObj.main.isPresent){
                this.log.info("** Assembling main")
                mainMachineCodeArr=this.assembleCodeObject(
                    codeObj.main.data,
                    codeObj.main.firstAddress,
                    codeObj.main.jumpDb,
                    codeObj.equ,
                    codeObj.db,
                    codeObj.procsPublicDb
                )
            }

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


    async preassembleDependenciesArr(dependenciesArr){
        var exportsMap={}
        var codeObjArr=[]
        //INITIAL VALUES
        var mainFirstAddress=this.mainFirstAddress//"0000h"
        var variablesFirstAddress=this.variablesFirstAddress//"0010h"
        var proceduresFirstAddress=this.proceduresFirstAddress//"0fffh"
        for(var i in dependenciesArr){
            var exportsCache={
                "procs":{},
                "equ":{},
                "db":{}
            }
            const moduleIndex=dependenciesArr.length-i-1
            console.log("Module: "+moduleIndex)
            var currTxt=dependenciesArr[moduleIndex].txt
            //console.log(currTxt)
            var currDeps=dependenciesArr[moduleIndex].deps
            //console.log(currDeps)
            const codeObj=await this.sliceRawTxtAssemblyModule(currTxt,mainFirstAddress,variablesFirstAddress,proceduresFirstAddress);
            //console.log(codeObj)
            //?ADD PROCS EXPORTS
            var moduleProcs=codeObj.procedures;
            var modulePublicDb=codeObj.procsPublicDb;
            for(var k in moduleProcs){
                if(moduleProcs[k].isExported){
                    var procAddress=modulePublicDb[k]
                    exportsCache.procs[k]=procAddress
                }
            }
            //?ADD EQU EXPORTS
            var moduleEquDirs=codeObj.equ;
            var moduleExportedEqu=codeObj.exportedEquDirs;
            for(var i in moduleExportedEqu){
                var k=moduleExportedEqu[i]
                exportsCache.equ[k]=moduleEquDirs[k]
            }
            //?ADD DB EXPORTS
            var moduleDbDirs=codeObj.db;
            var moduleExportedDb=codeObj.exportedDbDirs;
            for(var i in moduleExportedDb){
                var k=moduleExportedDb[i]
                exportsCache.db[k]=moduleDbDirs[k]
            }
            
            const key=moduleIndex
            //console.log("KEY: "+key)
            exportsMap[key]=exportsCache
            //console.log(exportsMap)
            codeObjArr.push({
                "obj":codeObj,
                "deps":currDeps
            })

            //?UPDATE ADDRESSES
            proceduresFirstAddress=codeObj.lastProcsAddress;
            variablesFirstAddress=codeObj.lastDbAddress;
        }
        
        return [codeObjArr,exportsMap]

    }

 
    async sliceRawTxtAssemblyModule(rawTxt,mainFirstAddress,variablesFirstAddress,proceduresFirstAddress){
        this.log.info("** Removing comments from code")
        var cleanCode=this.removeCommentsFromCode(rawTxt) //clean code from comments, returns a string
        this.log.trace(cleanCode)

        this.log.info("** Getting code sections of MAIN module")
        const codeSlicer=new ModularCodeSlicer(this.wordSize,mainFirstAddress,variablesFirstAddress,proceduresFirstAddress);
        var codeObj=codeSlicer.getCodeSections(cleanCode); //divide code into sections
        this.log.debug(codeObj)
        this.log.debug(codeObj.Nprocs)
        if(codeObj.Nprocs==0){
            if(!codeObj.main.mainPresent){
                //this.log.debug(JSON.stringify(codeObj.main))
                if(Object.keys(codeObj.equ).length==0 &&
                Object.keys(codeObj.db).length==0
                ){
                    throw new Error("Invalid file")
                }
                
            }
        }

        //var file=await this.fileManager.readFile("C:\\Users\\Utente\\git\\VirtualShockProject\\src\\project_example_1\\module.ass")
        //console.log(file)
        return codeObj
    }


}