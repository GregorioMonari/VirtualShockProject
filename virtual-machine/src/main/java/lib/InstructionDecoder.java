package lib;

public class InstructionDecoder {
    public InstructionDecoder(){}
    public int getCopFromIr(int register){
        int copMask=0b11111100000000000000000000000000;
        int signedCop=(register&copMask)>>26;
        if(signedCop<0) signedCop=signedCop+64; //int è signed, così lo rendi unsigned
        return signedCop;
    }
    public int getRs1FromIr(int register){
        int copMask=0b00000011111000000000000000000000;
        return (register&copMask)>>21;
    }
    public int getRs2FromIr(int register){
        int copMask=0b00000000000111110000000000000000;
        return (register&copMask)>>16;
    }
    public int getRsdFromIr(int register){
        int copMask=0b00000000000000001111100000000000;
        return (register&copMask)>>11;
    }
    public int getImmediateConst(int register){ //TODO: GET SIGNED
        int signBitMask= 0b00000000000000001000000000000000;
        int signBit=register&signBitMask;
        int sign= signBit==0? 0:-signBitMask;
        int rightmostBitsMask= 0b00000000000000000111111111111111;
        int rightmostBits= register&rightmostBitsMask;
        return sign+rightmostBits;
    }
    public int getJumpConst(int register){ //TODO: GET SIGNED
        int signBitMask= 0b00000010000000000000000000000000;
        int signBit=register&signBitMask;
        int sign= signBit==0? 0:-signBitMask;
        int rightmostBitsMask= 0b00000001111111111111111111111111;
        int rightmostBits= register&rightmostBitsMask;
        return sign+rightmostBits;
    }
}
