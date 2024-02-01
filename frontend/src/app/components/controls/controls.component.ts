import { Component } from '@angular/core';
import APIService from 'src/app/services/api.service';
import SimulationService from 'src/app/services/simulation.service';
import TabsService from 'src/app/services/tabs.service';

@Component({
    selector: 'app-controls',
    templateUrl: './controls.component.html',
    styleUrls: ['./controls.component.css'],
  })
  export class ControlsComponent {
    constructor(
      private simulation:SimulationService,
      private api:APIService,
      private tabs:TabsService
      ) {}

    run(){
      console.log("Running VirtualShock VM")
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      console.log(editorValue)
      this.api.assemble(editorValue).subscribe(((response:any)=>{
        console.log(response)
        this.simulation.setMachineOutput(response.out)
      }))
      /*
      const filePath="./testProgram.txt";
      this.simulation.setMachineOutput(">"); //reset machine output

      this.api.execute(filePath).subscribe(
        (response)=>{
          console.log(response)
          let out=response.output;
          out="> executing program: "+filePath+"\n"+out+"> program terminated.";
          this.simulation.setMachineOutput(out);
        },
        (error)=>{
           console.log("ERRORE NEL LANCIARE VM!!!")
        })
      */
    }
  }