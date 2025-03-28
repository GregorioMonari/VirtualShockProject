//const GregLogs=require("../../GregLogs/GregLogs")
//const NumberConversionManager= require("../core/NumberConversionManager")

import NumberConversionManager from "../core/NumberConversionManager";

export default class CodeSlicer{
    private mainAddress:string;
    private varAddress:string;
    private nc:NumberConversionManager;

    constructor(mainAddress:string,varAddress:string){
        this.mainAddress=mainAddress;
        this.varAddress=varAddress;
        //this.log=new GregLogs();
        this.nc=new NumberConversionManager()
    }

    getCodeSections(code:string){
        //DIVIDE CODE INTO TEXT BLOCKS
        //Slice main procedure
        let {mainCode,leftCode,mainPresent}=this.sliceMainBlock(code);
        //Slice all procedures
        const res=this.sliceProcedures(leftCode);
        const procedures=res.procedures;
        leftCode= res.leftCode;
        //Slice interrupt routines
        const intRes=this.sliceInterruptRoutines(leftCode);
        const interruptRoutines= intRes.interrupt_routines;
        leftCode= intRes.leftCode;
        //Get remaining equ and db directives
        const {equDirs,dbDirs}=this.getEquAndDbDirectives(leftCode);


        //Map main
        const res2=this.preprocessInstructionBlock(mainCode,this.mainAddress)
        const mainArr=res2.linesArr;
        const jumpDb=res2.jumpDb;
        const lastMainAddress= res2.lastAddress;


        //Map procedures
        let proceduresData:{
            [key:string]:{
                firstAddress: string;
                data: string[];
                jumpDb:{[key:string]:string};
            }
        }={}
        let proceduresAddressTable:{[key:string]:string;}={}
        console.log(lastMainAddress)
        let procAddressCounter= lastMainAddress+1;
        for(const procedure of procedures){
            const currAddrCounterBinary=this.nc.dec2binUnsigned(procAddressCounter,16)
            const currAddrCounter=this.nc.bin2hex(currAddrCounterBinary)+"h"
            const {linesArr,jumpDb,lastAddress}=this.preprocessInstructionBlock(procedure.text,currAddrCounter)
            proceduresData[procedure.name]={
                firstAddress:currAddrCounter,
                data:linesArr,
                jumpDb
            }
            proceduresAddressTable[procedure.name]=currAddrCounter
            //increment proc counter
            procAddressCounter=lastAddress+1;
        }

        //Map interrupt routines
        let interruptRoutinesData:{
            [key:string]:{
                firstAddress: string;
                data: string[];
                jumpDb:{[key:string]:string};
            }
        }={};
        let interruptRoutinesAddressTable:{[key:string]:string;}={}
        let interruptAddressCounter= procAddressCounter;
        console.log("first interrupt routine addr:"+interruptAddressCounter)
        let ivt:string[]=[];
        let routineNumber=0;
        for(const routine of interruptRoutines){
            const currAddrCounterBinary=this.nc.dec2binUnsigned(interruptAddressCounter,16)
            const currAddrCounter=this.nc.bin2hex(currAddrCounterBinary)+"h"
            const {linesArr,jumpDb,lastAddress}=this.preprocessInstructionBlock(routine.text,currAddrCounter)
            interruptRoutinesData[routine.name]={
                firstAddress:currAddrCounter,
                data:linesArr,
                jumpDb
            };
            interruptRoutinesAddressTable[routine.name]=currAddrCounter

            const currAddrCounterBinary32=this.nc.dec2binUnsigned(interruptAddressCounter,32)
            const currAddrCounter32=this.nc.bin2hex(currAddrCounterBinary32)
            ivt[routineNumber]=currAddrCounter32;
            //increment proc counter
            interruptAddressCounter=lastAddress+1;
        }


        //Map Db Addresses
        const currAddressString=this.nc.hex2bin(this.varAddress,16);
        let currAddress=this.nc.bin2decUnsigned(currAddressString);
        var calculatedDbDirs:{[key:string]:string}={}
        for(var k in dbDirs){
            var binAddress=this.nc.dec2binUnsigned(currAddress,16)
            var hexAddress=this.nc.bin2hex(binAddress)+"h"
            calculatedDbDirs[k]=hexAddress;
            currAddress=currAddress+(parseInt(dbDirs[k]))
        }
        return {
            main:{
                firstAddress: this.mainAddress,
                data: mainArr,
                jumpDb:jumpDb,
                isPresent:mainPresent
            },

            Nprocs:procedures.length,
            procedures:proceduresData,
            procsPublicDb:proceduresAddressTable,

            NinterruptRoutines:interruptRoutines.length,
            interruptRoutines:interruptRoutinesData,
            interruptRoutinesPublicDb:interruptRoutinesAddressTable,
            ivt,

            equ:equDirs,
            db:calculatedDbDirs
        }
    }

    private preprocessInstructionBlock(block:string, firstAddress:string){
        const dirtyArr=block.split("\n")
        //Clean empty lines
        let linesArr:string[]=[];
        for(let i=0;i<dirtyArr.length;i++){
            const line=dirtyArr[i].trim()
            if(line&&line!=""){
                linesArr.push(line);
            }
        }
        //Get first and last address
        const firstAddressBinary=this.nc.hex2bin(firstAddress,16);
        let start:number=this.nc.bin2decUnsigned(firstAddressBinary);
        let end:number= start+linesArr.length-1;
        //Parse jump labels
        var jumpDb:{
            [key:string]:string;
        }={};
        for(let i=0;i<linesArr.length;i++){
            //check for jump addresses (end: addi r1,r0,4)
            var tmp=linesArr[i].split(":")
            //console.log(tmp)
            if(tmp.length>1){
                linesArr[i]=tmp[1].trim();
                const labelName=tmp[0].trim();
                const currAddressWithOffset=start+i
                const labelAddressBinary=this.nc.dec2binUnsigned(currAddressWithOffset,16);
                const labelAddress=this.nc.bin2hex(labelAddressBinary);
                //Then there is a : in the line
                //this.log.trace("Adding jump label '"+labelName+"', address: "+labelAddress)
                jumpDb[labelName]=labelAddress+"h"
            }        
        }
        return {linesArr,jumpDb,lastAddress:end}
    }

    //---DIVIDE CODE INTO SECTIONS---
    private sliceProcedures(code:string){
        const re = new RegExp("procedure(.*){");
        let leftCode=code;
        let counter=0;
        let rawProcArr:{
            name:string;
            text:string;
        }[]=[]
        while(re.test(leftCode)){
            const res= this.sliceProc(leftCode);
            leftCode=res.leftCode;
            rawProcArr.push({
                name: res.procName,
                text: res.procCode
            });
            counter++;
        }
        //this.log.trace("Finished reading "+counter+" Procedures")
        console.log("added "+rawProcArr.length+" procedures")
        return {procedures:rawProcArr,leftCode}
    }

    private sliceProc(code:string){
        const re = new RegExp("procedure(.*){");
        var res=re.exec(code);
        var index=res?.index as number;
        //this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var procName=code.slice(index+10,openBracketIndex)
        var block=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        return {procName,procCode:block,leftCode: leftslice+rightslice}
    }

    private sliceInterruptRoutines(code:string){
        const re = new RegExp("interrupt_routine(.*){");
        let leftCode=code;
        let counter=0;
        let rawProcArr:{
            name:string;
            text:string;
        }[]=[]
        while(re.test(leftCode)){
            const res= this.sliceInterruptRoutine(leftCode);
            leftCode=res.leftCode;
            rawProcArr.push({
                name: res.procName,
                text: res.procCode
            });
            counter++;
        }
        //this.log.trace("Finished reading "+counter+" Procedures")
        console.log("added "+rawProcArr.length+" interrupt routines")
        return {interrupt_routines:rawProcArr,leftCode}
    }

    private sliceInterruptRoutine(code:string){
        const re = new RegExp("interrupt_routine(.*){");
        var res=re.exec(code);
        var index=res?.index as number;
        //this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var procName=code.slice(index+12,openBracketIndex)
        var block=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        return {procName,procCode:block,leftCode: leftslice+rightslice}
    }

    private sliceMainBlock(code:string){
        const re = new RegExp("procedure *main *{");
        if(!re.test(code)){
            //this.log.debug("Main not present in module")
            return {mainCode:"",leftCode:code,mainPresent:false}
        }
        var res=re.exec(code);
        var index=res?.index as number;
        //this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var mainBlock=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        console.log("added main procedure")
        return {mainCode:mainBlock,leftCode: leftslice+rightslice,mainPresent:true}
    }

    private getEquAndDbDirectives(cleanCode:string){
        //at this point in clean code there are only includes and equ/db
        //Divide and clean remaining lines
        var temp=cleanCode.split("\n")
        var lineArr:string[]=[]
        for(let i=0;i<temp.length;i++){
            var el=temp[i].trim()
            if(el!=""){
                lineArr.push(el)
            }
        }
        //Get EQU Directives
        var equDirs:{
            [key:string]:string;
        }={}
        const re = new RegExp("equ");
        for(let i=0;i<lineArr.length;i++){
            if(re.test(lineArr[i])){
                const res=re.exec(lineArr[i])
                const index=res?.index as number;
                const left=lineArr[i].slice(0,index-1).trim();
                const right=lineArr[i].slice(index+3,lineArr[i].length).trim();
                equDirs[left]=right;
            }   
        }
        console.log("added "+Object.keys(equDirs).length+" equ directives")
        //Get DB Directives
        var dbDirs:{
            [key:string]:string;
        }={}
        const re1 = new RegExp("db");
        for(let i=0;i<lineArr.length;i++){
            if(re1.test(lineArr[i])){
                const res=re1.exec(lineArr[i])
                const index=res?.index as number;
                const left=lineArr[i].slice(0,index-1).trim();
                const right=lineArr[i].slice(index+2,lineArr[i].length).trim();
                dbDirs[left]=right;
            }   
        }
        console.log("added "+Object.keys(dbDirs).length+" db directives")
        return {equDirs,dbDirs}
    }
}