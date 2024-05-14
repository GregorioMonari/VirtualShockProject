import * as fs from 'fs'
import MicroCodeCell from './MicroCodeCell';

export default class StatementMapper{
    private map:any;
    constructor(){
        const strMap=fs.readFileSync("./config/rtl-map.json").toString()
        this.map= JSON.parse(strMap)
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
        //Check if statement contains memory operation
        if(this.isMemOperation(statement)){
            console.log("** mapping memory operation: "+statement)
            this.mapMemoryOperation(statement, cell)
            return;
        }

        //Check if it has branch condition

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
            member=="ir"
        ){
            //console.log(member+" control bit: "+this.map.registers[member][type])
            cell.setControlBit(this.map.registers[member][type]);
            return;
        }

        //Register file
        if(type!="wr" && member=="rs1"){
            cell.setControlBit(this.map.datapath.rd1);
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


    //---Manage Memory microoperations---
    private mapMemoryOperation(statement:string, cell:MicroCodeCell){
        const {destination,source}= this.getSourceAndDest(statement)
        console.log("dest: "+destination)
        console.log("source: "+source)
        //Detect if it is read or write and if it is mem or i/o
        const isRead= this.isReadMemOperation(destination,source);
        const wrEnable= "memwr";
        const rdEnable= "memrd";

        //Manage the memory member
        let memReg=this.getMemOperationRegister(isRead?source:destination);
        //es ir<-m[pc], mdr<-m[pc], mdr<-m[mar]
        //mi: 0=mar, 1=pc (per emettere ind da pc invece che da mar: 1)
        console.log(`memory read operation`)
        if(memReg&&(memReg=="pc"||memReg=="mar")){
            cell.setControlBit(this.map.registers[memReg].oe2); //oe2 pc o mar
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

    private getMemOperationRegister(member:string){
        const myRegex: RegExp = /m\[(.*?)\]/;
        const match = member.match(myRegex);
        if (match && match[1]) {
            return match[1];
            //console.log("String contains content within square brackets:", contentInsideBrackets);
        } else return null;
    }
}