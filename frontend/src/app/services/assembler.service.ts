import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';

import AssemblerAPIService from './core/assembler-api.service';

@Injectable({
    providedIn: 'root',
})
export default class AssemblerService {

    private status:Subject<"running"|"completed"|"failed"> = new Subject();
    private parserOutput:Subject<string> = new Subject();
    private machineCode:Subject<string> = new Subject();

    constructor(private apiService: AssemblerAPIService){
    }

    
    async assemble(filename: string): Promise<string>{
        const startTime = performance.now();
        this.status.next("running")
        this.parserOutput.next("Assemblying file: "+filename+"\n");
        try{
            const out= await this.apiService.assembleSync(filename)
            console.log(out)
            this.machineCode.next("");//TODO: machineCode);
            this.parserOutput.next("success!\n")
            // Code to measure performance
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            this.parserOutput.next(`[Execution time: ${executionTime} milliseconds]\n`)
            this.status.next("completed")
        }catch(e){
            this.parserOutput.next("failed with error:\n")
            this.parserOutput.next(e as string)
        }
        return "machineCode"
    }
    
    assembleFromObservable(filename: string): Promise<string>{
        const startTime = performance.now();
        this.status.next("running")
        return new Promise((resolve,reject)=>{
            this.parserOutput.next("Assemblying file: "+filename+"\n");
            this.apiService.assemble(filename).subscribe(((res:any)=>{
                //const machineCode= res.out as string;
                this.machineCode.next("");//TODO: machineCode);
                //this.parserOutput.next("Success, generated "+machineCode.length+" bytes\n");
                //this.parserOutput.next(this.formatMachineCodeToLogisimMemoryFile(machineCode));
                this.parserOutput.next("success!\n")
                //this.parserOutput.next(res+"\n")

                // Code to measure performance
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                this.parserOutput.next(`[Execution time: ${executionTime} milliseconds]\n`)
                this.status.next("completed")
                resolve("machineCode");
            }))
          })
    }
    getStatus(){
        return this.status.asObservable()
    }
    getParserOutput(){
        return this.parserOutput.asObservable()
    }
    getMachineCode(){
        return this.machineCode.asObservable()
    }


    /*
    formatMachineCodeToLogisimMemoryFile(machineCode: string){
        const lines=machineCode.split("\n");
        let out="v2.0 raw\n";
        for(const line of lines){
            out=out+this.getAsHexString(line.slice(2))+"\n"
        }
        return out;
    }

    getAsHexString(javaBinaryString:string){
        //console.log(this._controlBits)
        var out=""
        var currWord="";
        var blockCount=0;
        for(var i=0; i<javaBinaryString.length;i++){
            const bit= javaBinaryString.charAt(i)    
            currWord=currWord+bit;
            blockCount++ 
            if(blockCount>3){
                switch (currWord) {
                    case "0000":
                        out=out+"0"
                        break;
                    case "0001":
                        out=out+"1"
                        break;   
                    case "0010":
                        out=out+"2"
                        break;     
                    case "0011":
                        out=out+"3"
                        break;    
                    case "0100":
                        out=out+"4"
                        break;    
                    case "0101":
                        out=out+"5"
                        break;    
                    case "0110":
                        out=out+"6"
                        break;    
                    case "0111":
                        out=out+"7"
                        break;    
                    case "1000":
                        out=out+"8"
                        break;    
                    case "1001":
                        out=out+"9"
                        break;    
                    case "1010":
                        out=out+"a"
                        break;   
                    case "1011":
                        out=out+"b"
                        break;    
                    case "1100":
                        out=out+"c"
                        break;    
                    case "1101":
                        out=out+"d"
                        break;    
                    case "1110":
                        out=out+"e"
                        break;    
                    case "1111":
                        out=out+"f"
                        break; 
                    default:
                        break;
                }
                currWord="";
                blockCount=0;
            }
        }
        return out;
    }
    */
}