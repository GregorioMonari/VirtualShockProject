//const NumberConversionManager= require("../core/NumberConversionManager")
//const CodeSlicer=require("./CodeSlicer")
//const IsaManager=require("../../IsaManager")

import NumberConversionManager from "../core/NumberConversionManager";
import CodeSlicer from "./CodeSlicer";
import InstructionParser from "./InstructionParser";

export default class VshAssembler{
    private codeSlicer: CodeSlicer;
    private instructionParser: InstructionParser;
    private nc:NumberConversionManager;
    private ivtFirstAddress:string;
    constructor(configPath:string){
        const mainFirstAddress="0000h"
        const variablesFirstAddress="0400h"
        this.ivtFirstAddress="0300h"
        this.nc= new NumberConversionManager()
        this.codeSlicer= new CodeSlicer(mainFirstAddress,variablesFirstAddress);
        this.instructionParser= new InstructionParser(configPath);
    }


    assemble(text:string,format:"array"|"v2.0 raw"){
        const res= this._assemble(text);
        const machineCodeArr= res.mainMachineCodeArr;
        const ivt=res.ivt;
        console.log(ivt)
        let out="";
        if(format=="v2.0 raw"){
            out="v2.0 raw"
            for(const line of machineCodeArr){
                out=out+"\n"+line
            }
            //Add ivt
            if(ivt&&ivt.length>0){
                const programLength= machineCodeArr.length;
                const ivtFirstAddrBin= this.nc.hex2bin(this.ivtFirstAddress,16)
                const ivtFirstAddr= this.nc.bin2decUnsigned(ivtFirstAddrBin)
                const nZeros= ivtFirstAddr-programLength;
                const zerosString= nZeros.toString()+"*00000000" //TODO: CALCULATE ZEROS
                out=out+"\n"+zerosString;
                for(const pointer of ivt){
                    out=out+"\n"+pointer; //lo calcola sbagliato
                }
            }
        }else{
            throw new Error("array format is not yet implemented!")
        }
        return out;
    }

    private _assemble(text:string){
        //remove comments
        var cleanCode=this.removeComments(text)
        //divide code into sections
        var codeObj=this.codeSlicer.getCodeSections(cleanCode);
        if(codeObj.Nprocs==0){
            if(!codeObj.main.isPresent){
                //this.log.debug(JSON.stringify(codeObj.main))
                throw new Error("Invalid file, main procedure is not present")
            }
        }
        console.log("parsing instructions...")
        //assemble main procedure
        var mainMachineCodeArr=this.assembleCodeObject(
            codeObj.main.data,
            codeObj.main.firstAddress,
            codeObj.main.jumpDb,
            codeObj.equ,
            codeObj.db,
            codeObj.procsPublicDb
        )
        //assemble all procedures
        for(const k in codeObj.procedures){
            //this.log.debug("** Assembling procedure: "+k+" ["+(count+1)+"/"+codeObj.Nprocs+"]")
            const singleProcArr=this.assembleCodeObject(
                codeObj.procedures[k].data,
                codeObj.procedures[k].firstAddress,
                codeObj.procedures[k].jumpDb,
                codeObj.equ,
                codeObj.db,
                codeObj.procsPublicDb
            )
            mainMachineCodeArr=mainMachineCodeArr.concat(singleProcArr)
        }    
        //assemble all interrupt routines
        let interruptRoutineNumber=0;
        for(const k in codeObj.interruptRoutines){
            const singleProcArr=this.assembleCodeObject(
                codeObj.interruptRoutines[k].data,
                codeObj.interruptRoutines[k].firstAddress,
                codeObj.interruptRoutines[k].jumpDb,
                codeObj.equ,
                codeObj.db,
                codeObj.procsPublicDb //lascialo così un interrupt può saltare a una proc
            )
            mainMachineCodeArr=mainMachineCodeArr.concat(singleProcArr)
            interruptRoutineNumber++
        }

        //this.calculateIvt(codeObj.ivt,this.ivtFirstAddress,mainMachineCodeArr.length)

        console.log("generated "+(mainMachineCodeArr.length*4)+" bytes of machine code")
        return {mainMachineCodeArr,ivt:codeObj.ivt}
    }


    calculateIvt(ivtArr:string[],ivtAddress:string,programSize:number){
        
    }

    assembleCodeObject(
        blockArr:string[],
        firstAddr:string,
        jumpDb:{
            [key:string]:string;
        },
        equDirs:{
            [key:string]:string;
        },
        dbDirs:{
            [key:string]:string;
        },
        procsPublicDb:{
            [key:string]:string;
        }){
        const firstAddrBin=this.nc.hex2bin(firstAddr,16);
        const firstAddrDecimal=this.nc.bin2decUnsigned(firstAddrBin);
        //output
        var mainMachineCodeArr:string[]=blockArr.map((value:string,index:number)=>{
            const currAddrCount= firstAddrDecimal+index;
            return this.instructionParser.parseInstruction(
                value,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb);
        })
        return mainMachineCodeArr
    }


    private removeComments(rawText: string){
        // Regular expression to match single-line comments
        const singleLineCommentPattern = /\/\/.*$/gm;
        // Regular expression to match multi-line comments
        const multiLineCommentPattern = /\/\*[\s\S]*?\*\//gm;
        // Remove single-line comments
        let cleanedText = rawText.replace(singleLineCommentPattern, '');
        // Remove multi-line comments
        cleanedText = cleanedText.replace(multiLineCommentPattern, '');
        return cleanedText;
    }

    private removePythonComments(rawText:string){
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
}