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
    addi r1,r0,ab
    start: add r29,r1,r0
    addi r2,r1,04fh
    j start
}


proc mult{
    start: addi r1,r0,2
    add r2,r1,r0
    j start
}

`




function assemble(){
    var rawText=editor.innerText
    this.log.debug(rawText);
    var t0 = performance.now();
    var machineCode = assembler.assembleRawTxtAssembly(rawText);

    var t1 = performance.now();
    console.log((t1-t0))
    this.log.trace(machineCode)


    mcPreview.innerHTML="<b> MAIN MEMORY</b><br>Address - Data";
    for(var i in machineCode){
        mcPreview.innerHTML=mcPreview.innerHTML+"<br>"+""+i+": "+machineCode[i]
    }
}










