/**
 * NAME: IsaManager
 * DESCRIPTION: manages the conversion of assembly instructions into machine code.
 * Does not have the concept of equ or other substitutions, it takes plain instructions
 * with cop, registers and constants 
 */

import RegisterInstruction from '../core/RegisterInstruction';
import ImmediateInstruction from '../core/ImmediateInstruction';
import JumpInstruction from '../core/JumpInstruction';
import * as fs from 'fs'

export default class InstructionParser{
    private isaDB:any;
    constructor(configPath:string){
        const ISA_DATA=this.getIsaConfiguration(configPath);
        this.isaDB={};
        var instrNumber=0;
        Object.keys(ISA_DATA).forEach(copName=>{
            var type=ISA_DATA[copName].type;
            var copBytes=ISA_DATA[copName].copBytes;
            var fields=ISA_DATA[copName].fields;
            switch (type) {
                case "register":
                        this.isaDB[copName]=new RegisterInstruction(copBytes,fields);
                    break;

                case "immediate":
                        this.isaDB[copName]=new ImmediateInstruction(copBytes,fields);
                    break;

                case "jump":
                        this.isaDB[copName]=new JumpInstruction(copBytes,fields);
                    break;
            
                default:
                    break;
            }
            instrNumber++;
        })
    }

    parseInstruction(
        instrString:string,
        currAddrCount:number,
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
        console.log("** parsing instruction: "+instrString)
        console.log("current address: "+currAddrCount)
        console.log("labels:",jumpDb)
        console.log("procs:",procsPublicDb)

        const instrCop=instrString.split(" ")[0].trim();
        const instrFields=instrString.replace(instrCop,"").trim();
        if(!this.isaDB.hasOwnProperty(instrCop)) throw new Error("unknown instruction: "+instrCop);
        const instrObj=this.isaDB[instrCop];
        return instrObj.assembleInstruction(instrFields,currAddrCount,jumpDb,equDirs,dbDirs,procsPublicDb)
    }

    getInstructionByCop(copName:string){
        return this.isaDB[copName];
    }

    getIsaConfiguration(path:string){
        const file= fs.readFileSync(path).toString();
        return JSON.parse(file).isa
    }

}