import * as fs from 'fs'
import RtlParser from './app/RtlParser';


//Start the application
main();

async function main(){
    console.log("### RTL MAPPER ###")
    const {filePath,verbose}= getArgs();
    //const filePath= "./examples/rtl-test.txt";
    const rtlFile= fs.readFileSync(filePath).toString();
    console.log("Imported",filePath,"("+rtlFile.length+" bytes)")
    const parser= new RtlParser();

    //Parse and write microcode to file
    const file= parser.getAsLogisimMemoryFile(rtlFile);
    fs.writeFileSync(filePath.replace(".txt","")+"-microcode.txt",file)

    //Parse and write copmemory to file
    const copMem= parser.getCopMemoryAsLogisimMemoryFile(rtlFile)
    fs.writeFileSync(filePath.replace(".txt","")+"-copmemory.txt",copMem)
    console.log("---process completed, output written to files---")
}

function getArgs(){
    const args= process.argv.slice(2);
    let filePath="./examples/rtl-test.txt";
    let verbose=false;
    for(let i=0; i<args.length;i++){
        if(args[i]=="-f"){
            filePath=args[i+1]
            i++
        }else if(args[i]=="-v"){
            verbose=true;
        }
    }
    return {filePath,verbose}
}
