package api.services;

import org.java_websocket.WebSocket;

import Vm.ProgramLoader;
import Vm.VshVirtualMachine;

import java.util.List;

public class VmRunService {
    private WebSocket socket;
    private VshVirtualMachine vm= null;
    private boolean isPaused= false;
    public VmRunService(WebSocket webSocket){
        this.socket= webSocket;
    }

    public void load(String source, String value){
        if(this.vm!=null) this.vm=null;
        List<Integer> program= null;

        if(!source.equals("direct")){
            //DA FILE NEL SISTEMA OPERATIVO
            String programPath="./testProgram.txt";
            System.out.println("** Loading program: "+programPath);
            try {
                program = ProgramLoader.loadProgram(programPath);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }else{
            System.out.println("** Loading program from direct source");
            try {
                program = ProgramLoader.loadProgramFromString(value);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        //Load into VM
        for(int i=0; i<program.size();i++){
            System.out.println("Program line "+i+": "+program.get(i));
        }
        try{
            this.vm = new VshVirtualMachine(1024,program);
            System.out.println("New vm created");
            this.socket.send("{\"status\":\"OK\",\"message\":\"loaded\"}");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    public void start(){
        if(this.vm==null){
            this.socket.send("{\"status\":\"error\",\"message\":\"There is no vm to start\"}");
            return;
        }
        System.out.println("\n** Launching Virtual Shock VM");
        try{
            String out=this.vm.step();
            if(!out.isEmpty()) this.socket.send(out);
            while (this.vm.isRunning()){
                if(!isPaused){
                    out=this.vm.step();
                    if(!out.isEmpty()) this.socket.send(out);
                }
            }
            System.out.println("---machine-terminated---");
            this.socket.send("%END:machine-terminated%");
            this.vm=null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    public void stop(){
        if(this.vm==null) return;
        this.vm.stop();
        this.isPaused=false;
        this.vm= null;
    }
    public void pause(){
        if(this.vm==null) return;
        isPaused=!isPaused;
    }

}
