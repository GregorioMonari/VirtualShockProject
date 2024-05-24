/**
 * [
 *      {
 *          type: "key/flag/value"
 *          argName: "-jsap",
 *          keyMap: "jsapPath",
 *      },
 *      {
 *          argName: "-api"
 *          key: "api",
 *          isFlag: true
 *      },
 *      {
 *          
 *      }
 * ]
 */

export interface KeyMap{
    [key:string]:KeyMapCell
}

export interface KeyMapCell {
    argName?: string;
    isFlag?: boolean;
    isOrdered?: boolean;
}

export interface Config {
    [key:string]: string | null | boolean;
}

export default class ArgumentsParser {
    private argsMap:KeyMap;

    constructor(map:KeyMap){
        this.argsMap=map;
        //log.info(this.argsMap)
    }

    private getCmdArgs():string[]{
        let args= process.argv.slice(2).map(value=>{
            let newValue= value.trim();
            if(newValue.startsWith("\'") || newValue.startsWith("\"")){
                newValue=newValue.slice(1);
            }
            if(newValue.endsWith("\'") || newValue.endsWith("\"")){
                newValue=newValue.slice(0,newValue.length-1);
            }
            return newValue
        })
        return args
    }

    private getClassifiedArgsMap():KeyMap[]{

        let ordered:KeyMap={};
        let notOrdered:KeyMap={};

        Object.keys(this.argsMap).forEach(k=>{
            const cell=this.argsMap[k];
            if(cell.hasOwnProperty("isOrdered")){
                if(cell.isOrdered==true){
                    ordered[k]=cell
                }else{
                    notOrdered[k]=cell
                }
            }else{
                notOrdered[k]=cell
            }
        })


        return [ordered,notOrdered]
    }



    public parseArguments(): Config{
        const args= this.getCmdArgs()
        //log.info(args)
        const [orderedArgs,notOrderedArgs] = this.getClassifiedArgsMap()

        let outConfigMap:Config={}
        Object.keys(this.argsMap).forEach(k=>{
            outConfigMap[k]=null;
        })


        for(var i=0; i<args.length; i++){

            if(i<Object.keys(orderedArgs).length){
                let currOrderedArgCount=0;
                Object.keys(orderedArgs).forEach(k=>{
                    if(currOrderedArgCount==i){
                        outConfigMap[k]=args[i];
                    }
                    currOrderedArgCount++;
                })
            }else{
                //log.trace("Curr arg: "+args[i])
                Object.keys(notOrderedArgs).forEach(k=>{
                    if(args[i]==notOrderedArgs[k].argName){
                        let isFlag=false
                        if(notOrderedArgs[k].hasOwnProperty("isFlag")){
                            if(notOrderedArgs[k].isFlag==true){
                                isFlag=true;
                            }
                        }
                        if(isFlag){
                            outConfigMap[k]=true
                        }else{
                            outConfigMap[k]=args[i+1];
                            i++
                        }
                    }
                })

            }

        }

        return outConfigMap

        /*

        if(args.length==0){
            log.warning("No arguments received, returning empy object")
            let config: JsapTesterConfig = {
                "jsapPath": null,
                "apiModeActive": null,
                "logLevel": null
            };           
            return config
        }

        
        log.debug("Arguments:",args)
        const app=args[0]
        let config: JsapTesterConfig = {
            "jsapPath": app,
            "apiModeActive": null,
            "logLevel": null
        };

        const appArgs=args.splice(1);
        for(var i=0; i<appArgs.length; i++){
            switch (appArgs[i]) {
                case "-jsap":
                    config.jsapPath= appArgs[i+1]
                    i++
                    break;

                case "-loglevel":
                    config.logLevel= parseInt(appArgs[i+1])
                    i++
                    break;
            
                default:
                    break;
            }
        }

        return config
        */
    }



}