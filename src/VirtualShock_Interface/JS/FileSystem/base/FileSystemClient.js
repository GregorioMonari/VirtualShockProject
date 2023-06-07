class FileSystemClient{
    constructor(){
        this.log=new GregLogs()
        this.host="http://localhost:1345"
        this.config={
            headers:{
                'Content-Type': 'application/json'
            }
        }
    }

    async readFile(fileSystemPath){
        if(fileSystemPath==null||fileSystemPath==undefined){throw new Error("FileSystem path cannot be null")}
        var path="/api/filesystem/file";
        var query="?file="+fileSystemPath
        var url=this.host+path+query
        this.log.debug("Requesting ls for path: "+fileSystemPath)
        const res= await axios.get(url,this.config)
        return res.data
    }

    async writeFile(){

    }

    async ls(fileSystemPath){
        if(fileSystemPath==null||fileSystemPath==undefined){throw new Error("FileSystem path cannot be null")}
        var path="/api/filesystem/ls";
        var query="?dir="+fileSystemPath
        var url=this.host+path+query
        this.log.debug("Requesting ls for path: "+fileSystemPath)
        const res= await axios.get(url,this.config)
        return res.data
    }

}