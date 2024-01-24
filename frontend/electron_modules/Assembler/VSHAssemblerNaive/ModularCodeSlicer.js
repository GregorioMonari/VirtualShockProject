const CodeSlicer= require("./core/extended/CodeSlicer")
module.exports=class ModularCodeSlicer extends CodeSlicer{
    constructor(wordSize,mainAddress,varAddress,procAddress){
        super(wordSize,mainAddress,varAddress,procAddress)
    }


    //@OVERRIDE
    getCodeSections(code){
        var res;
        //GET MAIN BLOCK
        this.log.debug("(1/6) Slicing main block")
        res=this.sliceMainBlock(code);
        var mainBlock=res[0]; //MAIN
        var codeLeft=res[1];
        var mainPresent=res[2];


        //!THESE TWO CAN BE EXPORTED!
        //GET PROCEDURES
        this.log.debug("(2/6) Slicing procedures")
        res=this.sliceProcedures(codeLeft)
        var procedures=res[0];
        codeLeft=res[1]

        //GET EQU AND DB DIRECTIVES
        this.log.debug("(3/6) Slicing directives")
        res=this.getDirs(codeLeft);
        var equDirs=res[0]; //EQU
        var dbDirs=res[1]; //DB
        var includesArr=res[2] //INCLUDES
        var exportedEquDirsArr=res[3]
        var exportedDbDirsArr=res[4]


        //-----------------------------------------------------
        this.log.debug("(4/6) Preprocess Main Block")
        var mainRes;
        var mainArr=[];
        var jumpDb;
        if(mainPresent){
            mainRes=this.preprocessInstructionBlock(mainBlock,this.mainAddress)
            mainArr=mainRes[0];
            jumpDb=mainRes[1];
            this.log.trace("MainArr: "+mainArr)
        }else{
            this.log.debug("Skipping main block")
        }


        this.log.debug("(5/6) Preprocess Procedures Array")
        var allProcs={}
        var procsPublicDb={}
        var procAddressCounter=this.nc.hex2bin(this.procAddress,16);
        procAddressCounter=this.nc.bin2decUnsigned(procAddressCounter);
        for(var i in procedures){
            
            var currAddrCounter=this.nc.dec2binUnsigned(procAddressCounter,16)
            currAddrCounter=this.nc.bin2hex(currAddrCounter)+"h"

            var procName=procedures[i].procName
            var procBlock=procedures[i].textData
            var isExported=procedures[i].isExported
            this.log.trace("ProcName: "+procName)
            this.log.trace("ProcBlock: "+procBlock)
            this.log.trace("IsExported: "+isExported)


            var procRes=this.preprocessInstructionBlock(procBlock,currAddrCounter)
            var procArr=procRes[0];
            var procJumpDb=procRes[1];
            

            allProcs[procName]={
                "isExported":isExported,
                "firstAddress":currAddrCounter,
                "data":procArr,
                "jumpDb":procJumpDb 
            }

            procsPublicDb[procName]=currAddrCounter

            //increment proc counter
            procAddressCounter=procAddressCounter+(procArr.length*this.wordSize)
        }
        //Get last address of procs
        var lastProcsAddress=this.nc.dec2binUnsigned(procAddressCounter,16)
        lastProcsAddress=this.nc.bin2hex(lastProcsAddress)+"h"

        //Calculate Db Addresses
        this.log.debug("(6/6) Calculating db addresses")
        var currAddress=this.nc.hex2bin(this.varAddress);
        currAddress=this.nc.bin2decUnsigned(currAddress);
        this.log.trace("First variable address: "+currAddress);
        var calculatedDbDirs={}
        
        for(var k in dbDirs){
            var binAddress=this.nc.dec2binUnsigned(currAddress,16)
            var hexAddress=this.nc.bin2hex(binAddress)+"h"
            calculatedDbDirs[k]=hexAddress;
            currAddress=currAddress+(parseInt(dbDirs[k])*this.wordSize)
        }
        var lastDbAddress=this.nc.dec2binUnsigned(currAddress,16)
        lastDbAddress=this.nc.bin2hex(lastDbAddress)+"h"

        return {
            "main":{
                "firstAddress":this.mainAddress,
                "data":mainArr,
                "jumpDb":jumpDb,
                "isPresent":mainPresent
            },
            "includes":includesArr,
            "Nincludes":includesArr.length,
            "Nprocs":procedures.length,
            "procedures":allProcs,
            "procsPublicDb":procsPublicDb,
            "lastProcsAddress":lastProcsAddress,
            "lastDbAddress":lastDbAddress,
            "equ":equDirs,
            "exportedEquDirs":exportedEquDirsArr,
            "db":calculatedDbDirs,
            "exportedDbDirs":exportedDbDirsArr
        }
    }


    //@OVERRIDE
    sliceProcedures(code){
        const re = new RegExp("proc(.*){");
        var leftCode=code;
        var counter=0;
        var rawProcArr=[]
        while(re.test(leftCode)){

            var cell={}
            var res=this.sliceProc(leftCode);
            var procName=res[0];
            this.log.trace("Read procedure: "+procName)
            var block=res[1];
            leftCode=res[2];
            var isExported=res[3];

            cell["procName"]=procName;
            cell["textData"]=block;
            cell["isExported"]=isExported;

            rawProcArr.push(cell)


            counter++
            cell={}
        }
        this.log.trace("Finished reading "+counter+" Procedures")
        return [rawProcArr,leftCode]
    }
    //@OVERRIDE
    sliceProc(code){
        const re = new RegExp("proc(.*){");
        const re1 = new RegExp("export(.*)proc(.*){");
        if(!re1.test(code)){ //allora non ci sono più procedure esportate
            var res=re.exec(code);
            var index=res.index;
            this.log.trace("Found procedure (not exported)")
            this.log.trace(res)
            var openBracketIndex=code.indexOf("{",index);
            var closedBracketIndex=code.indexOf("}",index);
            
            var procName=code.slice(index+5,openBracketIndex).trim()
            var block=code.slice(openBracketIndex+1,closedBracketIndex);
            var leftslice=code.slice(0,index);
            var rightslice=code.slice(closedBracketIndex+1,code.length)
            var exported=false;
            return [procName,block,leftslice+rightslice,exported]
        }else{
            //?QUI SIAMO NELL'EXPORT
            var res=re1.exec(code);
            var index=res.index;
            this.log.trace("Found procedure (exported)")
            this.log.trace(res)
            //OVERRIDE INDEX
            index=code.indexOf("proc",index)

            var openBracketIndex=code.indexOf("{",index);
            var closedBracketIndex=code.indexOf("}",index);
            
            var procName=code.slice(index+5,openBracketIndex).trim()
            var block=code.slice(openBracketIndex+1,closedBracketIndex);
            var leftslice=code.slice(0,index);
            var rightslice=code.slice(closedBracketIndex+1,code.length)
            var exported=true;
            return [procName,block,leftslice+rightslice,exported]            
        }

    }


    //@OVERRIDE
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
        //this.log.debug(lineArr)
        var equDirs={}
        var exportedEquDirsArr=[]
        const re = new RegExp("equ");
        const reExp= new RegExp("export(.*)equ")
        Object.keys(lineArr).forEach(k=>{
            if(reExp.test(lineArr[k])){
                var splitLine=lineArr[k].split(" ")
                var left=splitLine[1].trim()
                var right=splitLine[3].trim()
                equDirs[left]=right
                exportedEquDirsArr.push(left)
            }else{
                if(re.test(lineArr[k])){
                    var res=re.exec(lineArr[k])
                    var index=res.index;
                    var left=lineArr[k].slice(0,index-1).trim();
                    var right=lineArr[k].slice(index+3,lineArr[k].length).trim();
                    equDirs[left]=right
                }
            }

        })

        this.log.debug(equDirs)
        //throw new Error("MAO")
        //Get DB Directives
        //this.log.debug(lineArr)
        var dbDirs={}
        var exportedDbDirsArr=[]
        const re1 = new RegExp("db");
        const reExp1= new RegExp("export(.*)db")
        Object.keys(lineArr).forEach(k=>{
            if(reExp1.test(lineArr[k])){
                var splitLine=lineArr[k].split(" ")
                var left=splitLine[1].trim()
                var right=splitLine[3].trim()
                dbDirs[left]=right
                exportedDbDirsArr.push(left)
            }else{
                if(re1.test(lineArr[k])){
                    var res=re1.exec(lineArr[k])
                    var index=res.index;
                    var left=lineArr[k].slice(0,index-1).trim();
                    var right=lineArr[k].slice(index+2,lineArr[k].length).trim();
                    dbDirs[left]=right;
                }   
            }

        })

        this.log.trace("Extracted dbDirs: "+dbDirs)

        var includesArr=[]
        const re2=new RegExp("#include ");
        Object.keys(lineArr).forEach(k=>{
            if(re2.test(lineArr[k])){
                const splitLine=lineArr[k].split(" ")
                var includedFile=splitLine[1].trim();
                includedFile=includedFile.slice(1,includedFile.length-1);
                includesArr.push(includedFile)
            }   
        })


        return [equDirs,dbDirs,includesArr,exportedEquDirsArr,exportedDbDirsArr]
    }
    


}