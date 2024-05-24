import * as fs from 'fs'
import MicroCodeCell from './MicroCodeCell';

export default class StatementMapper{
    private map:any;
    constructor(configPath:string){
        const strMap=fs.readFileSync(configPath).toString()
        this.map= JSON.parse(strMap).rtlMap
        console.log(this.map)
    }

    //---Map a single rtl statement, like: c<-a+b, mdr<-m[mar], a==b?
    public mapRTLInstruction2MicrocodeCell(statementLine: string): MicroCodeCell{
        const cell= new MicroCodeCell(64);
        const statementsArr= statementLine.split(","); //split parallel microoperations

        for(const statement of statementsArr){
            this.mapStatement(statement,cell);
        }

        return cell;
    }

    private mapStatement(statement: string, cell:MicroCodeCell){
        //Check if statement contains INTA operation
        if(this.isINTAOperation(statement)){
            console.log("** mapping inta operation: "+statement)
            this.mapINTAOperation(cell);
            return;
        }

        //Check if statement contains ien operations
        if(this.isIenOperation(statement)){
            console.log("** mapping ien operation: "+statement)
            this.mapIenOperation(statement,cell);
            return;
        }

        //Check if statement contains memory operation
        if(this.isMemOperation(statement)){
            console.log("** mapping memory operation: "+statement)
            this.mapMemoryOperation(statement, cell)
            return;
        }

        //Check if it has branch condition
        if(this.isBranchOperation(statement)){
            console.log("** mapping branch operation: "+statement)
            this.mapBranchOperation(statement,cell);
            return;
        }

        //Else, proceed with standard flow
        console.log("** mapping micro operation: "+statement)
        this.mapStandardStatement(statement,cell)
    }

    private getSourceAndDest(statement: string){
        const statementMembers= statement.split("<-");
        console.log(statementMembers);
        const destination= statementMembers[0].trim();
        const source= statementMembers.length>1?statementMembers[1].trim():"";
        return {destination,source}
    }
    

    //---Manage ien and mdr<-n operations---
    private isIenOperation(statement:string){
        //es. ien<-1
        const myRegex: RegExp = /(ien)( *)(<-)( *)(0|1)/;
        return myRegex.test(statement)
    }

    private mapIenOperation(statement:string, cell: MicroCodeCell){
        const {destination,source}= this.getSourceAndDest(statement)
        cell.setControlBit(this.map.udc.ien_wr);
        if(source=="1") cell.setControlBit(this.map.udc.ien);
    }

    private isINTAOperation(statement:string){
        //es. mdr<-n
        const myRegex: RegExp = /(mdr)( *)(<-)( *)(n)/;
        return myRegex.test(statement)
    } 

    private mapINTAOperation(cell: MicroCodeCell){
        //Only the operation mdr<-n triggers this method
        cell.setControlBit(this.map.registers.mdr.wr);
        cell.setControlBit(this.map.datapath.md) //1: data from outside

        cell.setControlBit(this.map.udc.start_inta)
        cell.setControlBit(this.map.udc.ask_ready)
    }



    //---Manage standard microoperations, like c<-a+b
    private mapStandardStatement(statement:string, cell: MicroCodeCell){
        const {destination,source}= this.getSourceAndDest(statement)
        //Map destination
        this.mapSingleMember(destination,"wr",cell);
        //Map source
        const operation= this.getOperation(source);
        if(!operation){
            this.mapSingleMember(source,"oe1",cell);
        }else{
            console.log("mapping operation: '"+operation+"'")
            const arr= source.split(operation);
            const op1= arr[0].trim();
            const op2= arr[1].trim();
            this.mapSingleMember(op1,"oe1",cell)
            if(operation=="+"&&op2=="1"){
                cell.setManyControlBits(this.map.alu["+1"])
                return;
            }
            if(operation=="-"&&op2=="1"){
                cell.setManyControlBits(this.map.alu["-1"])
                return;
            }
            //second member
            this.mapSingleMember(op2,"oe2",cell)
            //operation
            if(this.map.alu[operation]){
                cell.setManyControlBits(this.map.alu[operation]);
                return;
            }
            throw new Error("operation not found")
        }
    } 

    private getOperation(str: string): string | null {
        const regex = /^([a-zA-Z]+)([^a-zA-Z]+)(([a-zA-Z]+)|1|4)$/;
    
        const match = str.match(regex);
        //console.log(match)
        if (match) {
            return match[2];
        } else {
            return null;
        }
    }

    /*
    hasOperation(source:string){
        if(/\+|\-|\/|\*|>>|>|<|==|!=|<=|>=/.test(source)) return true;
        return false;
    }*/

    private mapSingleMember(member:string,type:"wr"|"oe1"|"oe2",cell: MicroCodeCell){
        const memberType= type=="wr"?"dest":"source"
        console.log(`${memberType}: `+member) //wr enable - memwr - outwr
        //Constant
        if(member=="cost"){
            if(type!="oe2"){
                throw new Error("cost can be used only on bus S2")
            }else{
                cell.setControlBit(this.map.datapath.cost);
                return;
            }
        }
        
        //Registers
        if(
            member=="a"||
            member=="b"||
            member=="c"||
            member=="pc"||
            member=="temp"||
            member=="iar"||
            member=="mar"||
            member=="mdr"||
            member=="ir" ||
            member=="r30" //l'udc ha un or su questi bit di enable speciali che forza r30
        ){
            //console.log(member+" control bit: "+this.map.registers[member][type])
            cell.setControlBit(this.map.registers[member][type]);
            return;
        }

        //Register file
        if(member=="rs1"){
            if(type=="wr"){
                cell.setControlBit(this.map.datapath.wr)
                cell.setControlBit(this.map.datapath.rs1_as_dest)
            }else{
                cell.setControlBit(this.map.datapath.rd1);
            }
            return;
        }
        if(member=="rs2"){
            if(type=="wr") {
                cell.setControlBit(this.map.datapath.wr); //Attiva rd invece che rs2, ci pensa l'udc a cambiare
                cell.setControlBit(this.map.datapath.rs2_as_dest);
            }else{
                cell.setControlBit(this.map.datapath.rd2);
            }
            return;
        }
        if(type=="wr"&&member=="rd"){
            cell.setControlBit(this.map.datapath.wr)
            return;
        }

        throw new Error(memberType+" not found: "+member)
    }


    //---Manage branch microoperations---
    private mapBranchOperation(statement:string,cell:MicroCodeCell){
        if(statement.includes("==")){
            //beqz
            cell.setControlBit(this.map.udc.branch_enable)
            //Set output enable
            const reg2compare= statement.split("==")[0].trim();
            cell.setControlBit(this.map.registers[reg2compare].oe1)
            //Set alu op= x
            cell.setManyControlBits(this.map.alu.x)
        }else{
            //bneqz
            cell.setControlBit(this.map.udc.branch_enable)
            cell.setControlBit(this.map.udc.bneqz)
            //set output enable
            const reg2compare= statement.split("!=")[0].trim();
            cell.setControlBit(this.map.registers[reg2compare].oe1)
            //Set alu op=x
            cell.setManyControlBits(this.map.alu.x)
        }
    }

    private isBranchOperation(statement:string){
        //es. a==0?
        const myRegex: RegExp = /(.*)( *)(==|!=)( *)(0)( *)(\?)/;
        return myRegex.test(statement)
    }


    //---Manage Memory microoperations---
    private mapMemoryOperation(statement:string, cell:MicroCodeCell){
        const {destination,source}= this.getSourceAndDest(statement)
        console.log("dest: "+destination)
        console.log("source: "+source)
        //Detect if it is read or write and if it is mem or i/o
        const isRead= this.isReadMemOperation(destination,source);
        const isIO= this.isIoOperation(statement)
        let wrEnable= "memwr";
        let rdEnable= "memrd";
        if(isIO){
            wrEnable= "iowr";
            rdEnable= "iord";
        }

        //Manage the memory member
        let memReg=this.getMemOperationRegister(isRead?source:destination);
        //es ir<-m[pc], mdr<-m[pc], mdr<-m[mar]
        //mi: 0=mar, 1=pc (per emettere ind da pc invece che da mar: 1)
        console.log(`memory read operation`)
        if(memReg&&(memReg=="pc"||memReg=="mar")){
            if(memReg=="pc"){
                cell.setControlBit(this.map.registers.pc.oe2); //oe2 pc
            }else{
                cell.setControlBit(this.map.registers.mar.oe1); //oe1 mar
            }
            cell.setControlBit(
                isRead? this.map.memory[rdEnable]:
                    this.map.memory[wrEnable]
            ); ///memory read or write enable
            if(memReg=="pc") cell.setControlBit(this.map.datapath.ma); //metti a 1 se emetti da pc
        }else{
            throw new Error("invalid memory register, accepted: pc, mar, received: "+memReg)
        }

        //Now manage the source/destination of the memory
        //md: 1=data from outside (per scriver in mdr, md=1)
        if(isRead){
            if(destination=="ir"||destination=="mdr"){
                cell.setControlBit(this.map.registers[destination].wr) //set write enable for register
                if(destination=="mdr") cell.setControlBit(this.map.datapath.md) //1: data from outside
            }else{
                throw new Error("invalid memory destination, accepted: ir, mdr, received: "+destination)
            }
        }else{
            if(source=="mdr"){
                cell.setControlBit(this.map.registers.mdr.oe2) //!needs to be oe2, oe1 is not connected to data bus
            }else{
                throw new Error("invalid memory source, accepted: mdr, received: "+destination)
            }
        }

    }

    private isReadMemOperation(dest:string,source:string){
        let sourceReg= this.getMemOperationRegister(source);
        if(sourceReg) {
            return true;
        }else return false;
    }

    private isMemOperation(statement:string): boolean{
        const myRegex: RegExp = /(m|io|i\/o)(\[(.*?)\])/;
        return myRegex.test(statement)
    }

    private isIoOperation(statement:string): boolean{
        const myRegex: RegExp = /(io|i\/o)(\[(.*?)\])/;
        return myRegex.test(statement)
    }

    private getMemOperationRegister(member:string){
        const myRegex: RegExp = /(m|io|i\/o)\[(.*?)\]/;
        const match = member.match(myRegex);
        //console.log(match)
        if (match && match[2]) {
            return match[2];
            //console.log("String contains content within square brackets:", contentInsideBrackets);
        } else return null;
    }
}