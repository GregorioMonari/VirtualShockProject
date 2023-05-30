var fs=require("fs")
class FileManager{
    constructor(){

    }



    write(path,data){
        fs.writeFileSync(path,data);
        return true
    }

    read(path){
        const data = fs.readFileSync(path,
            { encoding: 'utf8', flag: 'r' });
        return data
    }

    async ls(path){
        var isdir= await this.isDirectory(path)
        if(!isdir){throw new Error("Cannot ls on a file")}
        var res=[]
        //console.log("mao")
        var files=fs.readdirSync(path);
        for(var i in files){
            var file=files[i];
            //console.log(file);
            var isdir= await this.isDirectory(path+"/"+file)
            res.push({"path":file, "isDir":isdir})            
        }
        return res
    }

    isDirectory(path){
        return new Promise(resolve=>{
            fs.stat(path, (err, stats) => {
                if (err) {
                  console.error(err);
                  return;
                }
              
                if (stats.isDirectory()) {
                  //console.log('The path is a directory.');
                  resolve(true)
                } else if (stats.isFile()) {
                  //console.log('The path is a file.');
                  resolve(false)
                } else {
                  console.error('The path is neither a file nor a directory.');
                  resolve(false)
                }
              });
        })

        return(res)
    }    


}

module.exports = FileManager