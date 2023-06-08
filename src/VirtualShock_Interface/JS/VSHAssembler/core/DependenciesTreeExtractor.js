class DependenciesTreeExtractor{
    constructor(){
        this.fileManager=new FileSystemClient();
        this.log=new GregLogs();
        this.currDepth=0;
        this.currTxt=""
        this.depTree={}
        this.depArr=[]
    }

    async getDependenciesArr(txt,fileRootPath){
        this.depArr.push({
            "txt":txt,
            "deps":[]
        })
        var currIndex=this.depArr.length-1;
        await this.getDependenciesTree(txt,fileRootPath,this.depTree);
        console.log(this.depTree)
        this.depArr[currIndex].deps=Object.keys(this.depTree)
        return this.depArr
    }

    async getDependenciesTree(txt,fileRootPath,depTree){

        if(!depTree){depTree=this.depTree}

        var fileDepArr=await this.getDependenciesFromTxt(txt);
        this.log.trace("Imported Dependencies of file: "+fileRootPath)
        this.log.trace(fileDepArr)
        for(var i in fileDepArr){
            var filePath=fileRootPath+fileDepArr[i]
            var currIndex=this.depArr.length;
            depTree[currIndex]={}
            try{
                var file
                try{
                    file=await this.fileManager.readFile(filePath)
                }catch(e){
                    this.log.error(e)
                    this.log.info("Trying to import file from std modules")
                    var stdModulesPath="C:\\Users\\Utente\\git\\VirtualShockProject\\src\\VirtualShock_interface\\JS\\VSHAssembler\\resources\\vsh_std_lib\\"+fileDepArr[i]+".ass"
                    file=await this.fileManager.readFile(stdModulesPath)
                }

                
                
                this.depArr.push({
                    "txt":file,
                    "deps":[]
                })
                
                //this.log.trace(file)
                await this.getDependenciesTree(file,fileRootPath,depTree[currIndex])
                this.depArr[currIndex].deps=Object.keys(depTree[currIndex])

            }catch(e){
                this.log.error("MODULE "+filePath+" DOES NOT EXIST")
                throw new Error(e)
            }
            
        }
    }
    async getDependenciesFromTxt(rawTxt){
        //!INVERTI ORDINE, COSI' SENNO' PRENDE PRIMA L'ULTIMo
        const txt=this.removeCommentsFromCode(rawTxt) //clean code from comments, returns a string
        const lineArr=txt.split("\n");
        var includesArr=[]
        const re2=new RegExp("#include ");
        Object.keys(lineArr).forEach(k=>{
            if(re2.test(lineArr[k])){
                const splitLine=lineArr[k].trim().split(" ")
                //console.log(splitLine)
                var includedFile=splitLine[1].trim();
                includedFile=includedFile.slice(1,includedFile.length-1);
                includesArr.push(includedFile)
            }   
        })
        return includesArr;
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