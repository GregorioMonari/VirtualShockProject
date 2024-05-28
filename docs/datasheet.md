# VirtualShock system - datasheet
## Memory space mapping
> N bits give 2^n different options, from 0 to 2^(n-1).  

**CHIPS ADDRESSES**: Each chip has i=10 -> 2^10 cells
- Rom1 (0000 0000h): program(low)/ivt(high)
```
      ba30              ba15  ba8 ba7   ba0
start: 00000000 00000000 00000000 00000000 = 0000 0000h
end:   00000000 00000000 00000011 11111111 = 0000 03ffh

IVT: rom1 end -> i=8, 2^8=256 cells
start: 00000000 00000000 00000011 00000000 = 0000 0300h
end:   00000000 00000000 00000011 11111111 = 0000 03ffh
```
- Ram1 (00000400h): variables(low)/stack(high)
```
start: 00000000 00000000 00000100 00000000 = 0000 0400h
end:   00000000 00000000 00000111 11111111 = 0000 07ffh

Stack pointer: 0000 07ffh + 1 = 0000 0800h
```
**CHIP SELECT**: Decoder with address bits 10-13 as select bits (max 16 chips)
```
CS1 -> /ba13 * /ba12 * /ba11 * /ba10 (0000)
CS2 -> /ba13 * /ba12 * /ba11 * ba10 (0001)
...
CS16 -> ba13 * ba12 * ba11 * ba10 (1111)
```

## I/O space mapping
**CHIPS ADDRESSES**: Each chip ha at max i=8 -> 2^8 cells  
```
PIC: CS2(100h)  
STATUS_LED: CS3(200h)  
LEDS: CS4(300h)  
TTY: CS5(400h)  
KEYBOARD: CS6(500h)  
```

**CHIP SELECT**: Decoder with address bits 8-11 as select bits (max 16 chips)
```
CS1 -> /ba11 * /ba10 * /ba9 * /ba8 (0000)
CS2 -> /ba11 * /ba10 * /ba9 * ba8 (0001)
...
CS16 -> ba11 * ba10 * ba9 * ba8 (1111)
```

