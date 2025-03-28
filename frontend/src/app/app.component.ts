import { Component } from '@angular/core';
import TabsService from './services/tabs/tabs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  constructor(private tabs:TabsService){
  }

  ngOnInit(){
    //wait for tabs to init the editor before loading files
    /*this.tabs.getIsReady().subscribe((value)=>{
      if(value){
        const tabId1=this.tabs.addTab(`initialValue equ 0
nloops equ 5

proc main {
  addi r1,r0,initialValue
  addi r2,r0,nloops
  
  loop: print r1
  addi r1,r1,1
  seq r3,r1,r2
  beqz r3,loop

  halt
}`
          ,"./")
        this.tabs.setCurrentTab(tabId1);
      }
    })


    //this.test()
    */
  }

  test(){

    let currentFlow="cmd" //alternativa:stream
    const socket = new WebSocket("ws://localhost:8085"); // Use the same port as your server

    socket.onopen = (event) => {
        console.log("WebSocket connection opened:", event);

        const loadVmProgramPackage = {
          cmd: "load",
          program: {
            source: "direct",
            value: "proc main {add r1 r2 r3}"
          } 
        }
        const body= JSON.stringify(loadVmProgramPackage)

        socket.send(body)

    };

    socket.onmessage = (event) => {
        const rawUpdate = event.data;
        if(currentFlow=="cmd"){
          const update= JSON.parse(rawUpdate)
          console.log("[cmd] Received update:",update);
          if(update.message=="loaded"){
            socket.send("{\"cmd\":\"start\"}");
            console.log("Starting machine...")
            currentFlow="stream";
          }
        }else{
          console.log("[stream] "+rawUpdate)
          if(rawUpdate=="%END:machine-terminated%") {
            currentFlow="cmd"
            console.log("[cmd] Stream ended, back to cmd flow")
          }
        }
    };

    socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event);
    };
  }
}
