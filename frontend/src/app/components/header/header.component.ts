import { Component } from '@angular/core';
import APIService from 'src/app/services/api.service';
import SimulationService from 'src/app/services/simulation.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
  })
  export class HeaderComponent {
    constructor(
      private simulation:SimulationService,
      private api:APIService
      ) {}

    run(){
      console.log("Running VirtualShock VM")

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

    }
  }