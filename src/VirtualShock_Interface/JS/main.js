console.log("##########################")
console.log("# VirtualShock Assembler #")
console.log("##########################")


var aceEditor = ace.edit("AssemblyEditor");
aceEditor.setTheme("ace/theme/monokai");
aceEditor.session.setMode("ace/mode/assembly_vsh");
console.log("aceEditor initialized")
//console.log(aceEditor.getValue())




document.getElementById("console").innerHTML="MAO"

var log=new GregLogs()
var numberConverter= new NumberConversionManager();

var editor=document.getElementById("AssemblyEditor")
var mcPreview=document.getElementById("MachineCodePreview")
var assembler= new VshAssembler();
//assemble()
aceEditor.setValue(`#include <stdio.h>

ab equ 10
b equ 20
c db 3

proc main {
    j mult
    start: add r29, r1, r0
           addi r2, r1, ab
           j start
}


proc mult{
    start: addi r1, r0, 2
           add r2, r1, r0
           j start
}

proc print{
    addi r1, r2, 4h
    j 0h
}

`)




//MAIN FUNCTION
function assemble(){
    
    try{
    document.getElementById("console").innerHTML=""
    
    this.log.info("##################################################")
    this.log.info("######[ Starting VirtualShock Assembler... ]######")
    var rawText=aceEditor.getValue();//editor.innerText
    this.log.trace(rawText);
    var t0 = performance.now();
    var out = assembler.assembleRawTxtAssembly(rawText);
    var mainMachineCode=out["mainMc"];
    var procMachineCode=out["procMc"];

    var t1 = performance.now();
    this.log.info("######[ Completed in "+(t1-t0)+"ms ]######")
    this.log.trace(mainMachineCode)


    mcPreview.innerHTML="<b> MAIN MEMORY</b><br>Address - Data";
    for(var i in mainMachineCode){
        var bin=numberConverter.dec2binUnsigned(i,16);
        var hex=numberConverter.bin2hex(bin)
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+hex+":  0x"+mainMachineCode[i]
    }

    mcPreview.innerHTML=mcPreview.innerHTML+"<br><br><b> PROCEDURES</b><br>Address - Data";
    for(var i in procMachineCode){
        var bin=numberConverter.dec2binUnsigned(i,16);
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
        switch_terminal()
    }
}


var console_shown=true;

switch_terminal()

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










