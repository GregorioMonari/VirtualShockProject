import * as fs from 'fs'
import MicroCodeCell from '../core/MicroCodeCell';
import StatementMapper from '../core/StatementMapper';
import CopMemoryGenerator from './CopMemoryGenerator';

export default class RtlParser{
    private mapper: StatementMapper;
    private copMemoryGenerator: CopMemoryGenerator;
    constructor(){
        this.mapper= new StatementMapper();
        this.copMemoryGenerator= new CopMemoryGenerator();
    }

    //---Convert rtl text files into logisim memory file---
    getAsLogisimMemoryFile(rtlFile:string){
        const arr= this.parse(rtlFile)
        let file="v2.0 raw\n"
        for(const cell of arr){
            file=file+cell.getAsHexString()+"\n"
        }
        return file;
    }

    getCopMemoryAsLogisimMemoryFile(rtlFile:string){
        const arr= this.parseLinks(rtlFile)
        let file="v2.0 raw\n"
        for(const cell of arr){
            file=file+cell.getAsHexString()+"\n"
        }
        return file;
    }


    //---Convert rtl text into MicroCode cells, which can be serialized in different ways---
    parse(text:string){
        //clean from comments
        const cleanText=this.removeComments(text);

        //get text as an array of strings
        const lines: string[]= this.getFileAsLinesArray(cleanText)

        //parse rtl instructions
        const rtlInstructions: string[]= this.copMemoryGenerator.removeLinks(lines); //remove links for cop memory
        console.log("---Parsing "+rtlInstructions.length+" rtl instructions---")
        const microCodeMemory:MicroCodeCell[]=[];
        for(const instruction of rtlInstructions){
            const cell: MicroCodeCell= this.mapper.mapRTLInstruction2MicrocodeCell(instruction);
            microCodeMemory.push(cell);
        }
        console.log("---Parsing complete!---")
        return microCodeMemory;
    }

    //Parse @links to generate cop memory
    parseLinks(text:string){
        //clean from comments
        const cleanText=this.removeComments(text);
        //console.log(cleanText)

        //get text as an array of strings
        const lines: string[]= this.getFileAsLinesArray(cleanText)
        console.log("Parsing "+lines.length+" lines for links")

        return this.copMemoryGenerator.generateCopMemory(lines)
    }


    private removeComments(rawText:string){
        //Comments type: #
        let out="";
        let currChar='';
        let state="newLine"; //non init perchè se la prima riga è un commento conta come newLine
        let skipChar=false;
        for(var i=0; i<rawText.length; i++){
            currChar=rawText.charAt(i);
            //console.log("char #"+i+": "+currChar+" , present state: "+state)
            switch (state) {
                case "init":
                    if(currChar=="\n"){
                        state="newLine"
                    }else{
                        if(currChar=="#"){
                            state="comment";
                            skipChar=true;
                        }
                    }
                    break;
                case "newLine":
                    if(currChar=="#"){
                        state="newLineComment";
                        skipChar=true;
                    }else{
                        state="init";
                        skipChar=false;
                    }
                    break;
                case "comment":
                    if(currChar=="\n"){
                        state="newLine"
                        skipChar=false;
                    }
                    break
                case "newLineComment":
                    if(currChar=="\n"){
                        state="newLine"
                    }
                    break;
                default:
                    break;
            }
            if(!skipChar) out=out+currChar;
        }
        return out;
    }

    private getFileAsLinesArray(rtlFile:string): string[]{
        let lines= rtlFile.split("\n");
        //console.log(lines)
        //clean
        let cleanLines:string[]=[]
        for(const line of lines){
            //console.log("line:"+line.charCodeAt(0))
            const cleanLine= line.trim().replace("\r",'')
            if(cleanLine!=''){
                cleanLines.push(cleanLine)
            }
        }
        //console.log(cleanLines)
        return cleanLines
    }
}