package Vm;

import lib.InstructionDecoder;
import java.util.ArrayList;
import java.util.List;
public class VshVirtualMachine {
    //Registers
    private int[] rf= new int[32]; //Register File
    private int a,b,ir;
    private int c,temp,iar,mar,mdr;//OPZIONALI
    private int pc=0;
    //Memory
    private final int memorySize;
    private int[] memory; //Memoria DLX

    //Utility
    private InstructionDecoder decode= new InstructionDecoder();
    private boolean isRunning=false;

    public int[] getRf(){return this.rf;}
    public int[] getMemory(){return this.memory;}
    public int getPc(){return this.pc;}
    public boolean isRunning(){
        return isRunning;
    }
    public void printInfo(){
        String msg="(debug) pc:"+pc+", rf: ";
        for(int i=0;i<rf.length;i++){
            if(rf[i]!=0){
                msg=msg+"R"+i+"="+rf[i]+" ";
            }
        }
        msg=msg+", stack: ";
        if(rf[30]!=memorySize){
            for(var i=0;i<memorySize-rf[30];i++){
                int currAddr=(memorySize-i);
                msg=msg+"M["+currAddr+"]="+memory[currAddr]+" ";
            }
        }else{
            msg=msg+"empty";
        }
        System.out.println(msg);
    }

    public void initVM(){
        memory=new int[this.memorySize];
        //Init RF
        for(int i=0;i<32;i++){
            rf[i]=0;
        }
        //STACK POINTER?
        rf[30]=memorySize; //l'ultima cella occupata
    }

    public VshVirtualMachine(int memorySize,int[] program) throws Exception {
        if(program.length==0) throw new Exception("Program can't be empty");
        //1. SET FINAL VARIABLE MEMORY SIZE IN THE CONSTRUCTOR
        this.memorySize=memorySize;
        //2. INITIALIZE VM (clean registers, etc...)
        initVM();
        //3. COPY PROGRAM IN MEMORY
        for(int i=0;i<program.length;i++){
            memory[i]=program[i];
        }
    }
    public VshVirtualMachine(int memorySize,List<Integer> program) throws Exception {
        if(program.size()==0) throw new Exception("Program can't be empty");
        //1. SET FINAL VARIABLE MEMORY SIZE IN THE CONSTRUCTOR
        this.memorySize=memorySize;
        //2. INITIALIZE VM (clean registers, etc...)
        initVM();
        //3. COPY PROGRAM IN MEMORY
        for(int i=0;i<program.size();i++){
            memory[i]=program.get(i);
        }
    }


    public String step() throws Exception {
        String stepOutput="";
        if(!isRunning){
            if(pc==0){
                isRunning=true;//force activate machine if manual stepping
            }else{
                //the machine has been halted by a halt function, further step is not allowed
                System.out.println("Machine is halted, cannot step");
                return "";
            }
        }
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
