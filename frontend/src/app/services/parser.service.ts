import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';

import APIService from './api.service';

@Injectable({
    providedIn: 'root',
})
export default class ParserService {

    private status:Subject<"running"|"completed"|"failed"> = new Subject();
    private parserOutput:Subject<string> = new Subject();
    private machineCode:Subject<string> = new Subject();

    constructor(private apiService: APIService){
    }

    parse(text: string): Promise<string>{
        const startTime = performance.now();
        this.status.next("running")
        return new Promise((resolve,reject)=>{
            this.parserOutput.next("Assemblying code\n");
            this.apiService.assemble(text).subscribe(((res:any)=>{
                const machineCode= res.out as string;
                this.machineCode.next(machineCode);
                this.parserOutput.next("Success, generated "+machineCode.length+" bytes\n");
                // Code to measure performance
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                this.parserOutput.next(`[Execution time: ${executionTime} milliseconds]\n`)
                this.status.next("completed")
                resolve(machineCode);
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



}