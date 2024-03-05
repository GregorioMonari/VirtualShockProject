const fs= require("fs");
const { spawn } = require('child_process');

module.exports=class AppModuleManager{
    constructor(mainDirName){
        console.log("AppModuleManager created")
        this.assemblerApiPort= 3005;
        this.vshVmPort= 8084;

        this.basePath = mainDirName+"/app-modules" //TODO: CHECK SE LE PATH CREANO CASINI
        console.log("Root dir:",mainDirName)

        //this.assemblerPath = this.basePath+'/assembler/src/VSHAssemblerApi.js'; //!PER ORA FALLO A MANO
        this.vshJrePath = this.basePath+'/vsh-jre/bin/java.exe';
        this.vshVmPath = this.basePath+'/vsh-vm-0.0.1-SNAPSHOT.jar';
    }

    assertIfRequiredModulesArePresent(){
        //if (!fs.existsSync(this.assemblerPath)) return false; //TODO: AGGIUNGI CHECK
        if (!fs.existsSync(this.vshJrePath)) return false;
        if (!fs.existsSync(this.vshVmPath)) return false;
        return true
    }

    spawnVm(port){
        if(!port) port=8000;

        const childProcess = spawn(
            this.vshJrePath, //cmd
            ['-jar',this.vshVmPath,"api","-port",port] //args
        );
        childProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        
        childProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        childProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
        
        childProcess.on('error', (err) => {
            console.error('Error spawning child process:', err);
        });
        return childProcess;
    }

    async start(){
        console.log("# AppModuleManager online")
        console.log("Checking if required modules are present before startup...")
        if(this.assertIfRequiredModulesArePresent()){
            console.log("All required modules are present, starting up backend")
        }else{
            throw new Error("Missing required modules for backend")
        }
        //Start up parser api
        const VshAssemblerApi = require("./assembler/src/VSHAssemblerApi")
        const assemblerApi = new VshAssemblerApi(this.assemblerApiPort);
        assemblerApi.listen()
        //Start up vm
        this.spawnVm(this.vshVmPort)
    }
}