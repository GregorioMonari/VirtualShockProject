log=new GregLogs()
var editor=document.getElementById("AssemblyEditor")
var mcPreview=document.getElementById("MachineCodePreview")
var assembler= new VshAssembler();
//assemble()
editor.textContent=`

#include <stdio.h>

a equ 10
b equ 20
c db 3

proc main {



    addi r1,r0,04Fh
    add r2,r1,r0

    addi r2, r1,00h
}

proc multiply{

}

`


function assemble(){
    var rawText=editor.innerHTML
    var machineCode = assembler.assembleRawTxtAssembly(rawText);
    this.log.trace(machineCode)
    mcPreview.innerHTML=JSON.stringify(machineCode)
}


