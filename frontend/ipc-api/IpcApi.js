const {ipcMain,dialog} = require('electron')
const fs = require('fs').promises;
const { spawn } = require('child_process');

class IpcApi{
    constructor(){}
    start(){
        console.log("Starting IPC api...")
        this.setupHandlers()
        console.log("IPC api online")
    }

    setupHandlers(){   
        ipcMain.handle('ping', async (event) => {
            return 'pong'
        });

        ipcMain.on('save-file', async (event, filename, content) => {
            try{
                await fs.writeFile(filename, content)
                console.log('File '+filename+' saved successfully!');
            }catch(err){
                console.error('An error occurred while saving the file:', err);
                throw err
            }
        });
        
        ipcMain.handle('read-file', async (event, filename) => {
            try {
                const data = await fs.readFile(filename, 'utf8');
                return data;
            } catch (err) {
                console.error('An error occurred while reading the file:', err);
                throw err; // Rethrow the error so it can be caught in the renderer process
            }
        });
        
        ipcMain.handle('assemble', async (event, filename) => {
            try {
                const data= await this.spawnAssembler(filename);
                return data;
                //const data = await fs.readFile(filename, 'utf8');
                //return data;
            } catch (err) {
                console.error('An error occurred while assembling the file:', err);
                throw err; // Rethrow the error so it can be caught in the renderer process
            }
        });

        ipcMain.handle('open-file-dialog', async (event, options) => {
            const result = await dialog.showOpenDialog(options);
            return result.filePaths;
        });
    }

    spawnAssembler(filename){
        let out="";
        return new Promise((resolve,reject)=>{
            const childProcess = spawn(
                'node', //cmd
                ['../compiler/build/main.js','assemble','-f',filename] //args
            );
            childProcess.stdout.on('data', (data) => {
                //console.log(`stdout: ${data}`);
                out=out+data;
            });
            
            childProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            
            childProcess.on('close', (code) => {
                resolve(out);
                //console.log(`child process exited with code ${code}`);
            });
            
            childProcess.on('error', (err) => {
                console.error('Error spawning child process:', err);
                reject(err)
            });
        })
    }

}

module.exports=IpcApi;