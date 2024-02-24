package Vm;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ProgramLoader {

    /*//SIMPLE PROGRAM EXAMPLE
   int[] simpleProgram={
           0b00101000000000010000000000010110, //addi r1,r0,22 -> cop,rs1,rs2/rd,cost
           0b00101000000000100000000000010000, //addi r2,r0,16 -> cop,rs1,rs2/rd,cost
           0b00001000001000100001100000000000, //mult r3,r1,r2
           0b11111000011000000000000000000000, //print r3
           0b11111100000000000000000000000000 //halt
   };
   */
    public static List<Integer> loadProgram(String filePath) throws Exception{
        List<Integer> integersList = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("> Imported line: "+line);
                int intValue= parseLine(line);
                System.out.println(">> Line parsed value: "+intValue);
                integersList.add(intValue);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return integersList;
    }

    public static List<Integer> loadProgramFromString(String string) throws Exception{
        List<Integer> integersList = new ArrayList<>();
        String[] temp= string.split("\n");
        for(String line: temp){
            System.out.println("> Imported line: "+line);
            int intValue= parseLine(line);
            System.out.println(">> Line parsed value: "+intValue);
            integersList.add(intValue);
        }
        return integersList;
    }

    public static int parseLine(String line) throws Exception{
        int intValue;
        if(line.startsWith("0b")){
            //Remove "0b" prefix and parse the binary string to an integer
            String cut=line.substring(2);
            //System.out.println("Cut string:"+cut);
            //String a = "10000000000000000000000000000010";
            long parsed = Long.parseLong(cut, 2);
            //System.out.println("Parsed value: " + parsed); //000...000 100...000
            intValue = (int) parsed; //100...000
            //System.out.println("Int value:"+intValue);
        } else if (line.endsWith("h")||line.endsWith("H")) {
            //Hexadecimal
            throw new Exception("Not implemented yet");
        } else {
            //decimal
            intValue=Integer.parseInt(line);
        }
        return intValue;
    }

}
