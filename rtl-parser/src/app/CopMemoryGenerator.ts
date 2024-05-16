import CopMemoryCell from "../core/CopMemoryCell";
import * as fs from 'fs';

export default class CopMemoryGenerator{
    private isa:any;
    constructor(){
        const file= fs.readFileSync("../assembler/src/VSHAssemblerNaive/resources/VirtualShockIsa.js").toString();
        this.isa= JSON.parse(file.replace("__JSON_ISA_PUBLIC__=",""))
        console.log(this.isa)
    }

    generateCopMemory(lines:string[]){
        const unorderedCopMemory= this.generateUnorderedCopMemory(lines);
        const copMemory: CopMemoryCell[]=[];
        for(let i=0;i<64;i++){//Cycle all cop memory cells
            const cell=this.getCellByAddress(i,unorderedCopMemory)
            copMemory.push(cell)
        }
        return copMemory;
    }

    getCellByAddress(address:number,copMemory:CopMemoryCell[]):CopMemoryCell{
        for(const cell of copMemory){
            const copName= cell.getCopName();
            const copBits= this.isa.data[cell.getCopName()].copBytes;
            const intAddress= this.bin2decUnsigned(copBits)
            if(intAddress==address){
                console.log("Cop name: "+copName+", bits: "+copBits)
                return cell;
            }
        }
        const emptyCell= new CopMemoryCell();
        emptyCell.setCopName("empty-cell");
        emptyCell.setInstructionType('r');
        emptyCell.setStartAddress(0);
        emptyCell.setCounterCompareValue(0);
        return emptyCell;
    }

    bin2decUnsigned(n:string){
        let out=0;
        for(let i=0;i<n.length;i++){ 
            const bit=parseInt(n.charAt(n.length-i-1))
            const weight=Math.pow(2,i)
            out=out+(bit*weight)
        }
        return out
    }

    generateUnorderedCopMemory(lines:string[]){
        let copMemory: CopMemoryCell[]=[];
        let currAddress=0;
        let currLink="";
        let currLinkStartAddress=0;
        for(const line of lines){
            //console.log("line: "+line)
            if(!line.startsWith("@")){
                currAddress++
            }else{
                if(currLink!=""){
                    const counterCompareValue= (currAddress-1)-currLinkStartAddress
                    const copName= currLink.split(":")[0].replace("@","");
                    const instrType= currLink.split(":")[1];
                    console.log("Linked "+currLink+", start address: "+currLinkStartAddress+", counter compare value: "+counterCompareValue)
                    const cell= new CopMemoryCell();
                    cell.setCopName(copName)
                    cell.setInstructionType(instrType as 'r'|'i'|'j');
                    cell.setStartAddress(currLinkStartAddress);
                    cell.setCounterCompareValue(counterCompareValue);
                    copMemory.push(cell);
                }
                //Execute anyways
                currLink=line;
                currLinkStartAddress=currAddress;
                //console.log("Linking "+currLink+" to start address: "+currAddress)
            }
        }
        //Parse last link
        if(currLink!=""){
            const counterCompareValue= (currAddress-1)-currLinkStartAddress
            const copName= currLink.split(":")[0].replace("@","");
            const instrType= currLink.split(":")[1];
            console.log("Linked "+currLink+", start address: "+currLinkStartAddress+", counter compare value: "+counterCompareValue)
            const cell= new CopMemoryCell();
            cell.setCopName(copName)
            cell.setInstructionType(instrType as 'r'|'i'|'j');
            cell.setStartAddress(currLinkStartAddress);
            cell.setCounterCompareValue(counterCompareValue);
            copMemory.push(cell);
        }
        return copMemory;
    }

    

    removeLinks(lines:string[]){
        const out:string[]=[];
        for(const line of lines){
            if(!line.startsWith("@")){
                out.push(line)
            }
        }
        return out;
    }

}