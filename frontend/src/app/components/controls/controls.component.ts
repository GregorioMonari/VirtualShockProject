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

    async run(){
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      const machineCode:string = await this.parseCode(editorValue) as string;
      console.log(machineCode)
      const res= await this.simulation.load("direct", machineCode)
      console.log(res)
      this.simulation.start()

      /*console.log("Running VirtualShock VM")
      const editorValue:string=this.tabs.getEditor()?.getValue() as string;
      console.log(editorValue)
      this.api.assemble(editorValue).subscribe(((machineCode:any)=>{
        console.log(machineCode)
        this.api.executeString(machineCode.out).subscribe(
          (response)=>{
            console.log(response)
            let out=response.output;
            out="> executing program:\n"+out+"> program terminated.";
            this.simulation.setMachineOutput(out);
          },
          (error)=>{
             console.log("ERRORE NEL LANCIARE VM!!!")
          })
        //this.simulation.setMachineOutput(response.out)
      }))*/
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


    parseCode(code: string){
      return new Promise((resolve,reject)=>{
        this.api.assemble(code).subscribe(((machineCode:any)=>{
          resolve(machineCode.out);
        }))
      })
    }

  }