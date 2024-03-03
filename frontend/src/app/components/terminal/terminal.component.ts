import { Component } from '@angular/core';
import SimulationService from 'src/app/services/simulation.service';
import ParserService from 'src/app/services/parser.service';

@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.css'],
  })
  export class TerminalComponent {
    public $terminalType:"compile"|"output"="compile"
    public $machineOutput:string="";
    public $parserOutput:string="";
    constructor(
      private simulation: SimulationService,
      private parser: ParserService
      ) {}

    ngOnInit(){
      this.parser.getStatus().subscribe(
         (value)=>{
            console.log("Received change!") 
            if(value=="running") {
               this.$parserOutput="" //Clean terminal on new run
               this.$machineOutput="" //Clean terminal on new run
            }else{
               if(value=="failed"){
                  if(this.$terminalType!="compile") this.$terminalType="compile"
               }
            }
         },
         (error)=>{
            console.log("ERRORE!!")
         })
      this.parser.getParserOutput().subscribe(
         (value)=>{
            console.log("Received change!") 
            this.$parserOutput=this.$parserOutput+value;
         },
         (error)=>{
            if(this.$terminalType!="compile") this.$terminalType="compile"
            console.log("ERRORE!!")
         })

      this.simulation.getMachineOutput().subscribe(
         (value)=>{
            console.log("Received change!") 
            if(this.$terminalType!="output") this.$terminalType="output"
            this.$machineOutput=this.$machineOutput+value;
         },
         (error)=>{
            console.log("ERRORE!!")
         })
    }

    setTerminalType(type:"compile"|"output"){
      this.$terminalType=type;
    }

    clearTerminal(){
      this.$machineOutput=""
      this.$parserOutput=""
    }

  }