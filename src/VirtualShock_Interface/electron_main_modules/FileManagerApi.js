const express=require("express")
const FileManager=require("./FileManager")

class FileManagerApi{
    constructor(){
        this.router = express();
        this.router.use(express.json()); 
        this.fm=new FileManager();
        //this.setup();
        this.setup()    
    }

    start(){
        //LISTEN TO REQUESTS
        this.router.listen(1345, () => {
            console.log('aw api is listening on port 1345');
        });
    }

    async setup(){

      //Define Get Router
      this.router.get('/api/filesystem/*', (request, response) => { //listen to all requests
        console.log(`received GET request: ${request.originalUrl}`)
        console.log(request.query["dir"])
        var url=request.originalUrl.split("?")[0]
        if(url=="/api/filesystem/ls"){
            this.fm.ls(request.query["dir"])
            //axios.get(rootUrl+request.originalUrl,config)
            .then(function (res) {
                // handle success
                console.log(res);
                response.status(200).json(res);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                response.status(500).json("internal error");
            });
        }else{
            //read file contents
            const data=this.fm.read(request.query["file"])
            //axios.get(rootUrl+request.originalUrl,config)
                response.status(200).json(data);
        }
      });


      this.router.post('/api/filesystem/write', (request,response)=>{
        console.log(`received AW api POST request: ${request.originalUrl}`)
        
        var filePath=request.query["file"]
        var body=request.body
        if(body.hasOwnProperty("rawTxt")){
          this.fm.write(filePath,body.rawTxt)
          response.status(200).json("{\"status\":\"ok\"}");          
        }else{
          this.fm.write(filePath,JSON.stringify(body))
          response.status(200).json("{\"status\":\"ok\"}");
        }


      });

      this.router.delete('/api/filesystem/delete', (request,response)=>{
        console.log(`received AW api DELETE request: ${request.originalUrl}`)
        
        axios.delete(rootUrl+request.originalUrl,request.body,config)
          .then(function (res) {
            // handle success
            console.log(res.data);
            response.status(res.status).json(res.data);
          })
          .catch(function (error) {
            // handle error
            console.log(error);
            response.status(error.response.status).json(error.response.data);
          })
          .finally(function () {
            console.log("Served api DELETE request")
          });

      });


    }

}

module.exports=FileManagerApi