import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export default class SimulationService {
    private isOnline:Subject<boolean> = new Subject();
    private isRunning:Subject<boolean> = new Subject();
    private machineOutput:Subject<string> = new Subject();
    private socket:WebSocket;

    constructor() {
        this.socket = new WebSocket("ws://localhost:8085");
        this.socket.onopen = (event) => {
            console.log("WebSocket connection opened:", event);
        }
    }


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


    load(source: string, value: string){
        return new Promise(resolve=>{
            const socket= this.socket;

            const onMessage = (event: MessageEvent<any>)=>{
                const not= JSON.parse(event.data);
                if(not.status=="OK"&&not.message=="loaded"){
                    socket.removeEventListener("message",onMessage)
                    resolve("OK")
                }
            }

            socket.addEventListener("message",onMessage);

            const loadVmProgramPackage = {
                cmd: "load",
                program: {
                  source: source,
                  value: value
                } 
            }
            const body= JSON.stringify(loadVmProgramPackage)
            socket.send(body)
        })
    }
    
    start(){
        const scope=this;
        const onStreamEvent= (event: MessageEvent<any>)=>{
            if(event.data!="%END:machine-terminated%"){
                console.log("[stream] "+event.data)
                scope.setMachineOutput(event.data);
            }else{
                scope.socket.removeEventListener("message",onStreamEvent)
                scope.setIsRunning(false);
                console.log("---Machine terminated---")
            }
        }

        this.socket.addEventListener("message",onStreamEvent)
        this.socket.send("{\"cmd\":\"start\"}");
        this.setIsRunning(true);
    }
    stop(){
        const scope=this;
        const onStreamEvent= (event: MessageEvent<any>)=>{
            if(event.data!="%END:machine-terminated%"){
                console.log("[stream] "+event.data)
                scope.setMachineOutput(event.data);
            }else{
                scope.socket.removeEventListener("message",onStreamEvent)
                scope.setIsRunning(false);
                console.log("---Machine terminated---")
            }
        }
        this.socket.removeEventListener("message",onStreamEvent)
        this.socket.send("{\"cmd\":\"stop\"}");
        this.setIsRunning(false);
    }
    pause(){
        this.socket.send("{\"cmd\":\"pause\"}");
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