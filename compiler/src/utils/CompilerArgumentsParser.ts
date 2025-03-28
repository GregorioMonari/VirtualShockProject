import ArgumentsParser from "./ArgumentsParser";

export interface CompilerConfiguration{
    command: 'assemble'|'map';
    source: string;
    target: string;
}

export default class CompilerArgumentsParser extends ArgumentsParser{
    constructor(){
        super({
            command: {
                isOrdered: true
            },
            source: {
                argName: "-s"
            },
            target:{
                argName: "-t"
            },
            target2:{
                argName: "-t2"
            },
            customConfig:{
                argName: "-c"
            }
        });
    }
}