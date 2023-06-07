class FileOperationsManager{
    constructor(){
        this.fs=new FileSystemClient()
        this.log=new GregLogs()
        this.openedFilesCache=[]
        this.currentFileUid=0;
        this.uid=0;
    }

    start(){
        this.attach_open_file_listener()
    }

    attach_open_file_listener(){
        document.getElementById("choose-file").onchange = async (e) => { 
            var file = e.target.files[0]; 
            this.log.debug(file)
            await this.on_file_open(file)
         }
    }

    async on_file_open(file){
        var txt=await this.fs.readFile(file.path)
        //TODO: save file on file open
        var fileUid=this.getUid()
        this.add_file_to_cache(file.name,file.path,txt)
        this.currentFileUid=fileUid;

        
        console.log(fileUid)
        _aceEditor.setValue(txt)
        this.openedFilesDiv().innerHTML=this.openedFilesDiv().innerHTML+`
        <div class="file_window_icon" id="file_window_icon-${fileUid}" onclick="on_file_window_selected(${fileUid})">
            ${file.name}
        </div>
        `
        this.log.debug(this.openedFilesCache)
        /*
        document.getElementById("file_window_icon-"+fileUid).onclick = async (e) => { 
            this.on_file_window_selected(e)
         }*/
    }

    on_file_window_selected(uid){
        //this.log.debug(e.target.id);
        //var uid=e.target.id.split("-")[1]
        console.log(" ")
        var currUid=this.currentFileUid
        var text=_aceEditor.getValue()
        //this.log.info(text)
        this.update_file_value_in_cache(currUid,text)
        this.log.info("Fetching file with uid: "+uid)
        var file=this.getFileByUid(parseInt(uid));
        _aceEditor.setValue(file.content)
        this.log.info("Set editor with file: "+file.path)
        this.log.info(this.getOpenedFilesCache())
        this.currentFileUid=uid;
        this.log.info("Current id is now: "+uid)
    }

    update_file_path_in_cache(){}
    update_file_value_in_cache(uid,value){
        try{
            var cache=this.getOpenedFilesCache();
            for(var i in cache){
                var currUid=cache[i].uid;
                if(currUid==uid){
                    this.log.info("Updating file in cache, uid: "+uid);
                    cache[i].content=value;
                    //this.log.info(cache[i].content)
                    return true
                }
            }
        }catch(e){console.log(e)}

        return false
    }

    add_file_to_cache(name,path,content){
        this.getOpenedFilesCache().push({
            "uid":this.getUid(),
            "name":name,
            "path":path,
            "content":content
        })
        this.log.debug("Added file "+name+" to cache,path: "+path+", uid: "+this.getUid())
        this.incrementUid();
    }


    getFileByUid(uid){
        var cache=this.getOpenedFilesCache()
        for(var i in cache){
            this.log.debug(cache[i].uid)
            if(cache[i].uid==uid){
                console.log("FOUND!")
                return {
                    "name":cache[i].name,
                    "path":cache[i].path,
                    "content":cache[i].content
                }
            }
            
        }
        return {}
    }
    getOpenedFilesCache(){
        return this.openedFilesCache
    }
    getUid(){
        return this.uid;
    }
    incrementUid(){
        this.uid=this.uid+1;
    }
    openedFilesDiv(){
        return document.getElementById("opened-files-wrapper")
    }

}