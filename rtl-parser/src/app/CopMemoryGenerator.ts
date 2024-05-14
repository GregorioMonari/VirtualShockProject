import CopMemoryCell from "../core/CopMemoryCell";

export default class CopMemoryGenerator{
    constructor(){}

    generateCopMemory(lines:string[]){
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
                    const instrType= currLink.split(":")[1];
                    console.log("Linked "+currLink+", start address: "+currLinkStartAddress+", counter compare value: "+counterCompareValue)
                    const cell= new CopMemoryCell();
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
            const instrType= currLink.split(":")[1];
            console.log("Linked "+currLink+", start address: "+currLinkStartAddress+", counter compare value: "+counterCompareValue)
            const cell= new CopMemoryCell();
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