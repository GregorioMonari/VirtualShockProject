import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export default class SimulationService {
    private isOnline:Subject<boolean> = new Subject();
    private isRunning:Subject<boolean> = new Subject();
    private machineOutput:Subject<string> = new Subject();

    constructor() {}


    setIsOnline(isOnline: boolean): void {
        this.isOnline.next(isOnline);
    }
    getIsOnline(): Observable<boolean> {
        return this.isOnline.asObservable();
    }
    setIsRunning(isRunning: boolean): void {
        this.isRunning.next(isRunning);
    }
    getIsRunning(): Observable<boolean> {
        return this.isRunning.asObservable();
    }
    setMachineOutput(output: string): void {
        this.machineOutput.next(output);
    }
    appendMachineOutput(output:string): void{
        //TODO
        throw new Error("Not implemented")
    }
    getMachineOutput(): Observable<string> {
        return this.machineOutput.asObservable();
    }


}