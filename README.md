# ⚡VirtualShockProject
![virtualshock](docs/VirtualShock.png)

## Introduction
The VirtualShock project enables the **execution of assembly code** on a simulated DLX processor while providing **real-time execution analysis**. This offers a more interactive and visual approach to understanding processors operations.
To facilitate writing and debugging DLX programs, the project includes an integrated Assembly and RTL IDE.
Based on my bachelor's degree thesis: https://amslaurea.unibo.it/25411/  
### Modules
- `hardware`: logisim components, ram and roms
- `frontend`: angular ide
- `virtual-machine`: java based virtual machine
- `compiler`: node based assembly and rtl parser



## INSTALLATION
### Prerequisites
- https://github.com/logisim-evolution/logisim-evolution/releases
### CPU
Clone this repo to get started. 
### IDE
1. **Download the latest release** at: https://github.com/GregorioMonari/VirtualShockProject/releases
2. Unzip
3. Click `electron.exe` to launch the application
### ASSEMBLER
To run the IDE components independently, java and nodejs are required.



## USAGE
Quick-start:
- open logisim and load the circuit: `logisim-cpu/hardware/CPU.circ`
- refresh with `ctrl+r`
- start/stop the simulation with `ctrl+k`



## DEVELOPMENT
1. From the root directory, build the backend with docker-compose:  
`docker-compose build`
2. Deploy the backend:  
`docker-compose up`
3. Cd into the Frontend folder:  
`cd ./frontend`
4. Launch Angular frontend:  
`ng serve`
5. Open a browser and go to url:  
`http://localhost:4200`
