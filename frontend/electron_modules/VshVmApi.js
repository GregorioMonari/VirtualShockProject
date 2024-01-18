const express=require("express");
const {child}=require("process")
class VshVmApi{
    constructor(port){
        this.app=express();
        this.port=port||3000;
    }

    defineApiPaths(){
        this.app.get('/ping', (req, res) => {
            res.send('pong')
        })
    }
    start(){
        this.app.listen(this.port, () => {
            console.log(`VshVmApi listening on port ${this.port}`)
        })
    }
}
module.exports=VshVmApi;



function spawnVM(){

}