class CodeSlicer{
    constructor(wordSize,mainAddress,varAddress,procAddress){
        this.wordSize=wordSize;
        this.mainAddress=mainAddress;
        this.varAddress=varAddress;
        this.procAddress=procAddress;
       
        this.log=new GregLogs();
        this.nc=new NumberConversionManager()
    }


    preprocessInstructionBlock(block,firstAddress){
        var dirtyArr=block.split("\n")
        var mainArr=[];
        var firstMainArrCounter=this.nc.hex2bin(firstAddress,16);
        firstMainArrCounter=this.nc.bin2decUnsigned(firstMainArrCounter);
        var counter=0;
        var jumpDb={};
        Object.keys(dirtyArr).forEach(k=>{
            var line=dirtyArr[k].trim()
            if(line!=""){
                mainArr[counter]=line
                
                //check for jump addresses (end: addi r1,r0,4)
                var tmp=line.split(":")
                console.log(tmp)
                if(tmp.length>1){
                    mainArr[counter]=tmp[1].trim();
                    var jumpName=tmp[0].trim();
                    var currAddrCount=firstMainArrCounter+(counter*this.wordSize)
                    var jumpAddr=this.nc.dec2binUnsigned(currAddrCount,16);
                    jumpAddr=this.nc.bin2hex(jumpAddr);
                    //Then there is a : in the line
                    this.log.debug("Adding jump label '"+jumpName+"', address: "+jumpAddr)
                    jumpDb[jumpName]=jumpAddr+"h"
                }
                
                counter++;
            }
                          
        })
        return [mainArr,jumpDb]
    }


    getCodeSections(code){
        var res;
        res=this.sliceMainBlock(code);
        var mainBlock=res[0]; //MAIN
        var codeLeft=res[1];


        res=this.getProcedures(codeLeft)
        var procedures=res[0];
        codeLeft=res[1]


        var mainRes=this.preprocessInstructionBlock(mainBlock,this.mainAddress)
        var mainArr=mainRes[0];
        var jumpDb=mainRes[1];
        this.log.debug(mainArr)


        for(var i in procedures){
            console.log(procedures[i].procName)
        }




        //---------------------------------------------------------------
        //GET EQU AND DB DIRECTIVES
        res=this.getDirs(codeLeft);
        var equDirs=res[0]; //EQU
        var dbDirs=res[1]; //DB


        //Calculate Db Addresses
        var currAddress=this.nc.hex2bin(this.varAddress);
        currAddress=this.nc.bin2decUnsigned(currAddress);
        this.log.debug("First variable address: "+currAddress);
        var calculatedDbDirs={}
        
        for(var k in dbDirs){
            var binAddress=this.nc.dec2binUnsigned(currAddress,16)
            var hexAddress=this.nc.bin2hex(binAddress)+"h"
            calculatedDbDirs[k]=hexAddress;
            currAddress=currAddress+(parseInt(dbDirs[k])*this.wordSize)
        }


        return {
            "main":{
                "firstAddress":this.mainAddress,
                "data":mainArr,
                "jumpDb":jumpDb
            },
            "procedures":[],
            "equ":equDirs,
            "db":calculatedDbDirs
        }
    }


    getProcedures(code){
        const re = new RegExp("proc(.*){");
        var leftCode=code;
        var counter=0;
        var rawProcArr=[]
        while(re.test(leftCode)){

            var cell={}
            var res=this.sliceProc(leftCode);
            var procName=res[0]
            console.log(procName)
            var block=res[1]
            leftCode=res[2];

            cell["procName"]=procName;
            cell["textData"]=block;

            rawProcArr.push(cell)


            counter++
            cell={}
        }
        console.log("Finished reading "+counter+" Procedures")
        return [rawProcArr,leftCode]
    }
    sliceProc(code){
        const re = new RegExp("proc(.*){");
        var res=re.exec(code);
        var index=res.index;
        this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var procName=code.slice(index+5,openBracketIndex)
        var block=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        return [procName,block,leftslice+rightslice]
    }


    sliceMainBlock(code){
        const re = new RegExp("proc *main *{");
        var res=re.exec(code);
        var index=res.index;
        this.log.trace(res)
        var openBracketIndex=code.indexOf("{",index);
        var closedBracketIndex=code.indexOf("}",index);
        
        var mainBlock=code.slice(openBracketIndex+1,closedBracketIndex);
        var leftslice=code.slice(0,index);
        var rightslice=code.slice(closedBracketIndex+1,code.length)
        return [mainBlock,leftslice+rightslice]
    }

    getDirs(cleanCode){
        //at this point in clean code there are only includes and equ/db
        //Divide and clean remaining lines
        var lineArr=cleanCode.split("\n")
        var temp=[]
        Object.keys(lineArr).forEach(k=>{
            var el=lineArr[k].trim()
            if(el!=""){
                temp.push(el)
            }
        })
        lineArr=temp

        //Get EQU Directives
        this.log.debug(lineArr)
        var equDirs={}
        const re = new RegExp("equ");
        Object.keys(lineArr).forEach(k=>{
            if(re.test(lineArr[k])){
                var res=re.exec(lineArr[k])
                var index=res.index;
                var left=lineArr[k].slice(0,index-1).trim();
                var right=lineArr[k].slice(index+3,lineArr[k].length).trim();
                equDirs[left]=right;
            }   
        })

        this.log.debug(equDirs)

        //Get DB Directives
        //this.log.debug(lineArr)
        var dbDirs={}
        const re1 = new RegExp("db");
        Object.keys(lineArr).forEach(k=>{
            if(re1.test(lineArr[k])){
                var res=re1.exec(lineArr[k])
                var index=res.index;
                var left=lineArr[k].slice(0,index-1).trim();
                var right=lineArr[k].slice(index+2,lineArr[k].length).trim();
                dbDirs[left]=right;
            }   
        })

        this.log.debug(dbDirs)
        return [equDirs,dbDirs]
    }
    

}