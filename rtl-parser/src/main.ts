import * as fs from 'fs'
import RtlParser from './RtlParser';


//Start the application
main();

async function main(){
    console.log("### RTL MAPPER ###")
    const filePath= "./test/rtl-test.txt";
    const rtlFile= fs.readFileSync(filePath).toString();
    console.log("Imported",filePath,"("+rtlFile.length+" bytes)")
    const parser= new RtlParser();
    const file= parser.getAsLogisimMemoryFile(rtlFile);


    fs.writeFileSync(filePath.replace(".txt","")+"-out.txt",file)
}
