package Vm;

import lib.InstructionDecoder;
import java.util.ArrayList;
import java.util.List;

public class VshVirtualMachine {
    private final int[] rf= new int[32]; //Register File
    private int pc=0;
    private int a,b,ir;
    private int[] memory; //DLX mem
    private final int memorySize;
    //Flags
    private String state;

    //Utility
    private InstructionDecoder decode= new InstructionDecoder();

    public VshVirtualMachine(List<Integer> program, int memorySize) throws Exception {
        if(program.isEmpty()) throw new Exception("Program can't be empty");
        this.memorySize=memorySize;
        memory=new int[this.memorySize];
        for(int i=0;i<32;i++){
            rf[i]=0;
        }
        //Load program in memory
        for(int i=0;i<program.size();i++){
            memory[i]=program.get(i);
        }
    }


    public String step() throws Exception {
        String stepOutput="";
        //1. FETCH
        ir=memory[pc];
        //2. DECODE
        pc=pc+1; //celle a 32 bit, quindi niente +4
        a=rf[decode.getRs1FromIr(ir)];
        b=rf[decode.getRs2FromIr(ir)];
        //2. Come faccio a estrarre i fields da ir?
        int cop=decode.getCopFromIr(ir);
        System.out.println("Cop: "+cop);
        switch (cop){
            //ALU - REGISTER FORMAT
            case 0: rf[decode.getRsdFromIr(ir)]=a+b;break;
            case 1: rf[decode.getRsdFromIr(ir)]=a-b;break;
            case 2: rf[decode.getRsdFromIr(ir)]=a*b;break;
            case 3: rf[decode.getRsdFromIr(ir)]=a/b;break;
            case 4: rf[decode.getRsdFromIr(ir)]=a%b;break;
            case 5: rf[decode.getRsdFromIr(ir)]=a&b;break;
            case 6: rf[decode.getRsdFromIr(ir)]=a|b;break;
            case 7: throw new Exception("Not implemented");
            case 8: throw new Exception("Not implemented");
            case 9: throw new Exception("Not implemented");
            //ALU - IMMEDIATE FORMAT
            case 10: rf[decode.getRs2FromIr(ir)]=a+decode.getImmediateConst(ir);break;
            case 11: rf[decode.getRs2FromIr(ir)]=a-decode.getImmediateConst(ir);break;
            case 12: rf[decode.getRs2FromIr(ir)]=a*decode.getImmediateConst(ir);break;
            case 13: rf[decode.getRs2FromIr(ir)]=a/decode.getImmediateConst(ir);break;
            case 14: rf[decode.getRs2FromIr(ir)]=a%decode.getImmediateConst(ir);break;
            case 15: rf[decode.getRs2FromIr(ir)]=a&decode.getImmediateConst(ir);break;
            case 16: rf[decode.getRs2FromIr(ir)]=a|decode.getImmediateConst(ir);break;
            case 17: throw new Exception("Not implemented");
            case 18: throw new Exception("Not implemented");
            case 19: throw new Exception("Not implemented");
            //STORE/LOAD - IMMEDIATE
            case 20: memory[a+decode.getImmediateConst(ir)]=b;break;
            case 21: rf[decode.getRs2FromIr(ir)]=memory[a+decode.getImmediateConst(ir)];break;
            //JUMP
            case 22: pc=rf[decode.getRs1FromIr(ir)];break; //JR
            case 23: throw new Exception("Not implemented");
            case 24: throw new Exception("Not implemented");
            case 25: pc=pc+decode.getJumpConst(ir);break;
            //BEQZ/BNEQZ - IMMEDIATE
            case 26: if(a==0) pc=pc+decode.getImmediateConst(ir);break;
            case 27: if(a!=0) pc=pc+decode.getImmediateConst(ir);break;
            //CONFRONTO - REGISTER
            case 28: rf[decode.getRsdFromIr(ir)]= (a==b)?1:0;break;
            case 29: rf[decode.getRsdFromIr(ir)]= (a!=b)?1:0;break;
            case 30: rf[decode.getRsdFromIr(ir)]= (a<b)?1:0;break;
            case 31: rf[decode.getRsdFromIr(ir)]= (a>b)?1:0;break;
            case 32: rf[decode.getRsdFromIr(ir)]= (a<=b)?1:0;break;
            case 33: rf[decode.getRsdFromIr(ir)]= (a>=b)?1:0;break;
            //CONFRONTO - IMMEDIATE
            case 34: rf[decode.getRs2FromIr(ir)]= (a==decode.getImmediateConst(ir))?1:0;break;
            case 35: rf[decode.getRs2FromIr(ir)]= (a!=decode.getImmediateConst(ir))?1:0;break;
            case 36: rf[decode.getRs2FromIr(ir)]= (a<decode.getImmediateConst(ir))?1:0;break;
            case 37: rf[decode.getRs2FromIr(ir)]= (a>decode.getImmediateConst(ir))?1:0;break;
            case 38: rf[decode.getRs2FromIr(ir)]= (a<=decode.getImmediateConst(ir))?1:0;break;
            case 39: rf[decode.getRs2FromIr(ir)]= (a>=decode.getImmediateConst(ir))?1:0;break;
            //PUSH-POP
            case 40:
                rf[30]=rf[30]-1;//prima decremento sp
                memory[rf[30]]=rf[decode.getRs2FromIr(ir)];//poi pusho b in r[30]
                break;
            case 41:
                rf[decode.getRs2FromIr(ir)]=memory[rf[30]];//prima pop r[30] in rs2
                rf[30]=rf[30]+1; //libero la cella
                break;
            //STI-CLI-RFE
            case 42: throw new Exception("Not implemented");
            case 43: throw new Exception("Not implemented");
            case 44: throw new Exception("Not implemented");
            //INTERRUPT
            case 45: throw new Exception("Not implemented");
            //...


            //CUSTOM
            //DEBUG
            case 62:
                String newOutput= String.valueOf(rf[decode.getRs1FromIr(ir)]);
                stepOutput=newOutput+"\n"; //add to machine special output
                System.out.println(newOutput);
                break;
            case 63:
                isRunning=false;
                stepOutput="halting\n"; //add to machine special output
                System.out.println("halting");
                break;
            default:
                System.out.println("Skipping unknown instruction, cop: "+cop);
        }
        return stepOutput;
    }

    public String start() throws Exception {
        String currentOutput="";
        isRunning=true;
        long startTime = System.currentTimeMillis();// Record the start time
        while(isRunning){//NOI SIAMO L'UDC, I FIELDS SONO IL DATAPATH
            currentOutput= currentOutput + step();
        }
        System.out.println("---The-Machine-Terminated---");
        long endTime = System.currentTimeMillis();// Record the end time
        long elapsedTime = endTime - startTime;// Calculate the elapsed time
        System.out.println("> Execution time: " + elapsedTime + " milliseconds");// Display the result
        return currentOutput;
    }

    public String start(boolean debug) throws Exception {
        String currentOutput="";
        isRunning=true;
        if(debug){
            long startTime = System.currentTimeMillis();
            while(isRunning){
                printInfo();
                currentOutput= currentOutput + step();
            }
            System.out.println("---The-Machine-Terminated---");
            long endTime = System.currentTimeMillis();// Record the end time
            long elapsedTime = endTime - startTime;// Calculate the elapsed time
            System.out.println("> Execution time: " + elapsedTime + " milliseconds");
            return currentOutput;
        }else{
            return start();
        }
    }

    public void stop(){
        System.out.println("Stopping VM");
        this.isRunning=false;
    }

}
