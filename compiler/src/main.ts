import CompilerArgumentsParser, {CompilerConfiguration} from "./utils/CompilerArgumentsParser"
import RtlParser from './rtl-parser/app/RtlParser';
import * as fs from 'fs'
import VshAssembler from "./assembler/app/VshAssembler";

main()
async function main(){
    const cmdArgsParser= new CompilerArgumentsParser()
    const config= cmdArgsParser.parseArguments();
    if(config.command=="assemble"){
        if(config.source){
            await assemble(config.source as string,config.target as string|null,config.customConfig as string|null)
        }else{
            console.log("missing source, args:",process.argv)
            printHelp()
            return;
        }
    }else if(config.command=="map"){
        if(config.source&&config.target){
            await mapRtl(config.source as string,config.target as string, config.target2 as string|null, config.customConfig as string|null)
        }else{
            console.log("missing source and target")
            printHelp()
            return;
        }
    }else{
        console.log("unknown command")
        printHelp()
        return;
    }
}

async function assemble(sourcePath: string, targetPath: string|null, configPath:string|null){
    console.time("completed in")
    const assemblyFile= fs.readFileSync(sourcePath).toString();
    console.log("assembling file: ",sourcePath)
    const assembler= new VshAssembler(configPath?configPath:"../resources/virtualshock-config.json");

    //Parse and write machineCode to file
    const file= assembler.assemble(assemblyFile,"v2.0 raw");
    let cleanTargetPath=""
    if(targetPath){
        cleanTargetPath=targetPath;
    }else{
        cleanTargetPath= sourcePath.replace(".txt","");
        cleanTargetPath=cleanTargetPath.replace(".ass","");
        cleanTargetPath=cleanTargetPath+".raw.txt"
    }
    fs.writeFileSync(cleanTargetPath,file)
    console.log("output written to file: "+cleanTargetPath)
    console.timeEnd("completed in")
}

async function mapRtl(sourcePath:string, targetPath1:string, targetPath2: string|null,configPath:string|null){
    console.log("### RTL MAPPER ###")
    const rtlFile= fs.readFileSync(sourcePath).toString();
    console.log("Imported",sourcePath,"("+rtlFile.length+" bytes)")
    const parser= new RtlParser(configPath?configPath:"../resources/virtualshock-config.json");

    //Parse and write microcode to file
    const file= parser.getAsLogisimMemoryFile(rtlFile);
    fs.writeFileSync(targetPath1,file)//(filePath.replace(".txt","")+"-microcode.txt",file)

    //Parse and write copmemory to file
    if(targetPath2){
        const copMem= parser.getCopMemoryAsLogisimMemoryFile(rtlFile)
        fs.writeFileSync(targetPath2,copMem)//(filePath.replace(".txt","")+"-copmemory.txt",copMem)
    }
    console.log("---process completed, output written to files---")   
}

function printHelp(){
    console.log("Example command: npm start -- assemble -s ./test.txt -t ./out.txt")
}

/*
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
*/