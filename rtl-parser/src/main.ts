import * as fs from 'fs'
import RtlParser from './app/RtlParser';


//Start the application
main();

async function main(){
    console.log("### RTL MAPPER ###")
    const filePath= "./examples/rtl-test.txt";
    const rtlFile= fs.readFileSync(filePath).toString();
    console.log("Imported",filePath,"("+rtlFile.length+" bytes)")
    const parser= new RtlParser();
    const file= parser.getAsLogisimMemoryFile(rtlFile);
    const copMem= parser.getCopMemoryAsLogisimMemoryFile(rtlFile)

    fs.writeFileSync(filePath.replace(".txt","")+"-microcode.txt",file)
    fs.writeFileSync(filePath.replace(".txt","")+"-copmemory.txt",copMem)
    console.log("---process completed, output written to files---")
}
