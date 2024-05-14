import * as fs from 'fs'
import MicroCodeCell from './MicroCodeCell';


export default class RtlParser{
    private map:any;
    constructor(){
        const strMap=fs.readFileSync("./config/rtl-map.json").toString()
        this.map= JSON.parse(strMap)
    }

    getAsLogisimMemoryFile(rtlFile:string){
        const arr= this.parse(rtlFile)
        let file="v2.0 raw\n"
        for(const cell of arr){
            file=file+cell.getAsHexString()+"\n"
        }
        return file;
    }

    parse(rtlFile:string){
        const lines= this.getLines(rtlFile)
        console.log("Mapping "+lines.length+" lines")
        const microCodeMemory:MicroCodeCell[]=[];
        let currAddress=0;
        let lastTaggedAddress:number|null=null
        const copMemory: string[]=[];
        for(const line of lines){
            //console.log(line)
            if(line.startsWith("@")){
                console.log(line)
            }else{
                const statements= line.split(",");
                //let controlBits= Array(64).fill(0)
                const cell= new MicroCodeCell(64)
                for(const statement of statements){
                    this.mapStatement(statement,cell);
                }
                console.log(cell.getAsBinaryArray())
                microCodeMemory.push(cell);
                currAddress++
            }
        }
        return microCodeMemory;
    }

    private mapStatement(statement: string, cell:MicroCodeCell){
        //console.log(statement)
        const statementMembers= statement.split("<-");
        console.log(statementMembers);
        const destination= statementMembers[0].trim();
        const source= statementMembers.length>1?statementMembers[1].trim():"";
        this.mapSingleMember(destination,"wr",cell);
        this.mapSource(source,cell);
    }
    
    private mapSource(source:string,cell: MicroCodeCell){
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
        //Memory
        const memReg= this.getMemOperationRegister(member);
        if(memReg&&(memReg=="pc"||memReg=="mar")){
            cell.setControlBit(this.map.registers[memReg].oe2); //oe2 pc o mar
            cell.setControlBit(
                type=="wr"?
                    this.map.memory.memwr:
                    this.map.memory.memrd
            );
            return;
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
            console.log(member+" control bit: "+this.map.registers[member][type])
            cell.setControlBit(this.map.registers[member][type]);
            return;
        }
        //Register file
        if(type!="wr" && member=="rs1"){
            cell.setControlBit(this.map.datapath.rs1);
            return;
        }
        if(member=="rs2"){
            cell.setControlBit(this.map.datapath.rs2);
            if(type=="wr") cell.setControlBit(this.map.datapath.rs2_as_member);
            return;
        }
        if(type=="wr"&&member=="rd"){
            cell.setControlBit(this.map.datapath[member])
            return;
        }

        throw new Error(memberType+" not found: "+member)
    }



    private getMemOperationRegister(member:string){
        const myRegex: RegExp = /m\[(.*?)\]/;
        const match = member.match(myRegex);
        if (match && match[1]) {
            return match[1];
            //console.log("String contains content within square brackets:", contentInsideBrackets);
        } else return null;
    }

    private getLines(rtlFile:string){
        let lines= rtlFile.split("\n");
        //console.log(lines)
        //clean
        let cleanLines:string[]=[]
        for(const line of lines){
            if(line!=''){
                const cleanLine= line.trim().replace("\r",'');
                cleanLines.push(cleanLine)
            }
        }
        //console.log(cleanLines)
        return cleanLines
    }
}