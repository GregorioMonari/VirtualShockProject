# VirtualShockProject
## Introduction
VirtualShock project allows to **write, test and run assembly code** in a simple and visual way.

## Modules
- `hardware`: logisim components, ram and roms
- `frontend`: angular ide
- `virtual-machine`: websocket based virtual machine
- `parser`: http based assembly parser

## Quick start for developers
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

## Issues
Warning: D:\HomeBase\git\VirtualShockProject\frontend\src\app\components\code-editor\code-editor.component.ts depends on 'ace-builds'. CommonJS or AMD dependencies can cause optimization bailouts.
For more info see: https://angular.io/guide/build#configuring-commonjs-dependencies
