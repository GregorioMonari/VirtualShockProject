import { Component } from '@angular/core';
import SimulationService from 'src/app/services/simulation.service';

@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.css'],
  })
  export class TerminalComponent {
    public $machineOutput:String=">";
    constructor(private simulation: SimulationService) {}

    ngOnInit(){
      this.simulation.getMachineOutput().subscribe(
       (value)=>{
          console.log("Received change!") 
          this.$machineOutput=value;
       },
       (error)=>{
          console.log("ERRORE!!")
       })
    }

  }