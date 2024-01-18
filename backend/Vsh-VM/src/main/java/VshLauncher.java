import api.VmApi;
import Vm.ProgramLoader;

import java.util.List;
import java.util.Objects;



public class VshLauncher {
    public static void main(String[] args) throws Exception {
        // TITLE
        System.out.println("### VIRTUAL SHOCK LAUNCHER ###");

        // ARGS
        String app="";
        int port=8080;
        String programPath="testProgram.txt";
        if(args.length>0){
            app=args[0];
            for(int i=1; i<args.length;i++){
                switch (args[i]){
                    case "-program":
                        programPath=args[i+1];
                        break;
                    case "-port":
                        port=Integer.parseInt(args[i+1]);
                        break;
                }
            }
        }else{
            printHelp();
        }

        if(!Objects.equals(app, "")) System.out.println("Starting app: "+app);
        // START VM
        if(app.equals("vm")){
            // LOAD PROGRAM
            System.out.println("** Loading program: "+programPath);
            List<Integer> program=ProgramLoader.loadProgram(programPath);
            for(int i=0; i<program.size();i++){
                System.out.println("Program line "+i+": "+program.get(i));
            }

            // START VM
            Vm.VshVirtualMachine vm= new Vm.VshVirtualMachine(1024,program);
            System.out.println("\n** Launching Virtual Shock VM");
            System.out.println("---Program-Output---");
            vm.start(true);

        }
        // START API
        if(app.equals("api")){
            System.out.println("** Launching VM Api");
            VmApi api= new VmApi(port,"/vshapi");
            api.start();
        }

    }

    private static void printHelp(){
        System.out.println("> HELP");
        System.out.println("java -jar vsh-vm-0.0.1-SNAPSHOT.jar vm -program ./simpleProgram.txt");
    }

}
