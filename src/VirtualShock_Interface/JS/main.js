console.log("##########################")
console.log("# VirtualShock Assembler #")
console.log("##########################")

var log=new GregLogs()
const fs=new FileSystemClient()
const numberConverter= new NumberConversionManager();
let _aceEditor;
let _assembler;
let _fileManager;


init()

async function init(){

    rtlm=new RtlManager()
    rtlm.test()

    throw new Error("MAO")

    //ACE EDITOR SETUP
    _aceEditor = ace.edit("AssemblyEditor");
    _aceEditor.setTheme("ace/theme/monokai");
    _aceEditor.session.setMode("ace/mode/assembly_vsh");
    console.log("_aceEditor initialized")
    //console.log(_aceEditor.getValue())
     
    document.getElementById("console").innerHTML="MAO"
    
    //_assembler= new ModularVshAssembler(_mainFirstAddress,_variablesFirstAddress,_proceduresFirstAddress);
    //this.mainFirstAddress=mainFirstAddress//"0000h"
    //this.variablesFirstAddress=variablesFirstAddress//"0010h"
    //this.proceduresFirstAddress=proceduresFirstAddress//"0fffh"
    //assemble()
    
    /*_aceEditor.setValue(`
    #include </module.ass>
    #include </moduloBello.ass>
    #include <ascii_table>
    
    ab equ 10
    export b equ 20
    c db 3
    
    proc main {
        j mult
        start: add r29, r1, r0
               addi r2, r1, ASCII_A
               j start
    }
    
    
    export proc mult{
        start: addi r1, r0, 2
               add r2, r1, r0
               j start
    }
    
    proc print{
        addi r1, r2, 4h
        j 0h
    }
    
    `)

    assemble()*/

    //var dirs= await fs.ls("./");
    //console.log("DIRECTORIES")
    //console.log(dirs)
    _fileManager= new FileOperationsManager()
    _fileManager.start()

    close_terminal()

}

function save_current_file(){
    _fileManager.save_current_file()
}

function on_file_window_selected(uid){
    _fileManager.on_file_window_selected(uid)
}















//MAIN FUNCTION
async function assemble(){
    var editor=document.getElementById("AssemblyEditor")
    var mcPreview=document.getElementById("MachineCodePreview")
    
    try{
    document.getElementById("console").innerHTML=""
    var _mainFirstAddress="0000h"
    var _variablesFirstAddress="0010h"
    var _proceduresFirstAddress="1000h"
    var assembler=new ModularVshAssembler(_mainFirstAddress,_variablesFirstAddress,_proceduresFirstAddress);
    this.log.info("##################################################")
    this.log.info("######[ Starting VirtualShock Assembler... ]######")
    var rawText=_aceEditor.getValue();//editor.innerText
    this.log.trace(rawText);
    var t0 = performance.now();
    var out = await assembler.assembleRawTxtAssembly(rawText);
    var mainMachineCode=out["mainMc"];
    var procMachineCode=out["procMc"];

    var t1 = performance.now();
    this.log.info("######[ Completed in "+(t1-t0)+"ms ]######")
    this.log.trace(mainMachineCode)


    mcPreview.innerHTML="<b> MAIN MEMORY</b><br>Address - Data";
    var start=numberConverter.hex2bin(_mainFirstAddress);
    start=numberConverter.bin2decUnsigned(start);
    console.log("Start: "+start)
    for(var i in mainMachineCode){
        var currAddr=parseInt(start)+parseInt(i)
        console.log(currAddr)
        var bin=numberConverter.dec2binUnsigned(currAddr,16);
        var hex=numberConverter.bin2hex(bin)
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+hex+":  0x"+mainMachineCode[i]
    }

    mcPreview.innerHTML=mcPreview.innerHTML+"<br><br><b> PROCEDURES</b><br>Address - Data";
    start=numberConverter.hex2bin(_proceduresFirstAddress);
    start=numberConverter.bin2decUnsigned(start);
    for(var i in procMachineCode){
        var currAddr=parseInt(start)+parseInt(i)
        var bin=numberConverter.dec2binUnsigned(currAddr,16);
        var hex=numberConverter.bin2hex(bin)
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+hex+":  0x"+procMachineCode[i]
    }

    var el=document.getElementById("output_result")
    el.innerHTML="";
    el.innerHTML="Assembling completed in "+(t1-t0)+"ms!"
    console.log(" ")

    }catch(e){
        log.error(e)
        var el=document.getElementById("output_result")
        el.innerHTML="";
        el.innerHTML="Error: Assembling failed"
        open_terminal()
    }
}


var console_shown=false;

function open_terminal(){
    console.log("showing terminal")
    document.getElementById("AssemblyEditor").style.height="50vh";
    document.getElementById("MachineCodePreview").style.height="50vh";
    document.getElementById("console").style.display="block";
    console_shown=true;
}
function close_terminal(){
    console.log("hiding terminal")
    document.getElementById("AssemblyEditor").style.height="87vh";
    document.getElementById("MachineCodePreview").style.height="87vh";
    document.getElementById("console").style.display="none";
    console_shown=false;  
}

function switch_terminal(){
    if(console_shown){
        console.log("hiding terminal")
        document.getElementById("AssemblyEditor").style.height="87vh";
        document.getElementById("MachineCodePreview").style.height="87vh";
        document.getElementById("console").style.display="none";
        console_shown=false;
    }else{
        console.log("showing terminal")
        document.getElementById("AssemblyEditor").style.height="50vh";
        document.getElementById("MachineCodePreview").style.height="50vh";
        document.getElementById("console").style.display="block";
        console_shown=true;
    }
}










