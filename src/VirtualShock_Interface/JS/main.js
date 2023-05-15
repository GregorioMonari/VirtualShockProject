console.log("##########################")
console.log("# VirtualShock Assembler #")
console.log("##########################")



document.getElementById("console").innerHTML="MAO"

log=new GregLogs()

var editor=document.getElementById("AssemblyEditor")
var mcPreview=document.getElementById("MachineCodePreview")
var assembler= new VshAssembler();
//assemble()
editor.textContent=`

#include <stdio.h>

ab equ 10
b equ 20
c db 3

proc main {
    j mult
    start: add r29,   r1,r0
    addi r2,r1,ab
    j start
}


proc mult{
    start: addi r1,r0,2
    add r2,r1,r0
    j start
}

proc print{
    addi r1,r2,4h
    j 0h
}

`




function assemble(){
    this.log.info("##################################################")
    this.log.info("######[ Starting VirtualShock Assembler... ]######")
    var rawText=editor.innerText
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
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+i+": "+mainMachineCode[i]
    }

    mcPreview.innerHTML=mcPreview.innerHTML+"<br><br><b> PROCEDURES</b><br>Address - Data";
    for(var i in procMachineCode){
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+i+": "+procMachineCode[i]
    }

    var el=document.getElementById("console-topbar")
    el.innerHTML="";
    el.innerHTML="<b>Output terminal</b> | Assembling completed in "+(t1-t0)+"ms!"
    console.log(" ")
}










