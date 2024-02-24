const VshAssembler= require("../src/VSHAssemblerNaive/core/extended/VshAssembler");

var _mainFirstAddress="0000h"
var _variablesFirstAddress="0010h"
var _proceduresFirstAddress="1000h"
var assembler=new VshAssembler(_mainFirstAddress,_variablesFirstAddress,_proceduresFirstAddress);

test('Register instructions', () => {
  const rawText=`
proc main {
  add r0,r0,r0
  add r3,r1,r2
}`
  var out = assembler.assembleRawTxtAssembly(rawText);
  var mainMachineCode=out["mainMc"];
  console.log(mainMachineCode)
  expect(mainMachineCode.length).toBe(2);
  expect(mainMachineCode[0]).toBe("00000000")
  expect(mainMachineCode[1]).toBe("00221800")
});

test('Immediate instructions', () => {
  const rawText=`
proc main {
  addi r1,r0,10
  addi r2,r0,-5
  addi r3,r0,27h
  addi r4,r0,0011b
}`
  var out = assembler.assembleRawTxtAssembly(rawText);
  var mainMachineCode=out["mainMc"];
  console.log(mainMachineCode)
  expect(mainMachineCode.length).toBe(4);
  expect(mainMachineCode[0]).toBe("2801000a")
  expect(mainMachineCode[1]).toBe("2802fffb")
  expect(mainMachineCode[2]).toBe("28030027")
  expect(mainMachineCode[3]).toBe("28040003")
});

test('Equ, Db', () => {
  const rawText=`
ciao equ 15h
vsh equ 2022
a db 2
b db 1

proc main {
  addi r1,r0,ciao
  addi r2,r0,vsh
  addi r3,r0,a
  addi r4,r0,b
}`
  var out = assembler.assembleRawTxtAssembly(rawText);
  var mainMachineCode=out["mainMc"];
  console.log(mainMachineCode)
  expect(mainMachineCode.length).toBe(4);
  expect(mainMachineCode[0]).toBe("28010015")
  expect(mainMachineCode[1]).toBe("280207e6")
  expect(mainMachineCode[2].slice(4)).toBe(_variablesFirstAddress.slice(0,_variablesFirstAddress.length-1))
  //TODO: last case check
});

test('Beqz, bneqz, labels', () => {
  const rawText=`
proc main {
  beqz r1,end
  add r3,r1,r2
  end: add r4,r3,r1
}`
  var out = assembler.assembleRawTxtAssembly(rawText);
  var mainMachineCode=out["mainMc"];
  console.log(mainMachineCode)
  expect(mainMachineCode.length).toBe(3);
  expect(mainMachineCode[0]).toBe("68200001")
  expect(mainMachineCode[1]).toBe("00221800")
  expect(mainMachineCode[2]).toBe("00612000")
});

test('Store, load', () => {
  const rawText=`
a db 15
proc main {
  sw 10(r2), r1
  lw r1, 10(r3)
  sw a(r2), r1
  lw r1, a(r3)
}`
  var out = assembler.assembleRawTxtAssembly(rawText);
  var mainMachineCode=out["mainMc"];
  console.log(mainMachineCode)
  expect(mainMachineCode.length).toBe(4);
  expect(mainMachineCode[0]).toBe("5041000a")
  expect(mainMachineCode[1]).toBe("5461000a")
  //TODO: check last cases
});