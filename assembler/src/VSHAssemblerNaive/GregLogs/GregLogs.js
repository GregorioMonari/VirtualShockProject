require("./config")
module.exports=class GregLogs{
    constructor() {
      this.loglevel=this.getLogLevel();
      this.separator=this.getSeparator();
      //this.info("New Greglogs logger created!")
      var divLoggerConfig=this.getDivLogger();
      this.divLoggerEnabled=divLoggerConfig.enabled;
      this.divLoggerLogLevel=divLoggerConfig.logLevel;
    }

    overrideDivLoggerEnable(enable){
      this.divLoggerEnabled=enable
    }

    getSeparator(){
      return __GREGLOGS_LOGGER_CONFIG__.separator
    }

    getLogLevel(){
      return __GREGLOGS_LOGGER_CONFIG__.logLevel
    }

    getDivLogger(){
      return __GREGLOGS_LOGGER_CONFIG__.divLogger
    }
    //=========
    //[3] LOG
    //logLevel(level){
    //  this.loglevel=level;
    //}
    trace(text){
      if(this.loglevel<1){
        console.log(get_current_timestamp()+this.separator+"[trace] ",text);
      }            
    }
    debug(text){
      if(this.loglevel<2){
        console.log(get_current_timestamp()+this.separator+"[debug] ",text);
      }  
    }
    info(text){
      //var string=this.info.caller.name
      if(this.loglevel<3){
        console.log(get_current_timestamp()+this.separator+"[info] ",text);
      }  
    }
    warning(text){
      if(this.loglevel<4){
        console.log(get_current_timestamp()+this.separator+"[WARNING] ",text);
      }  
    }
    error(text){
      console.error(get_current_timestamp()+this.separator+"[ERROR] ",text);  
    }
  }
  
  
  
  //----------------------
  //NAME: GET CURRENT TIME
  //DESCRIPTION: returns the current formatted time
  function get_current_timestamp(){
      const date=new Date();
      var string_timestamp=date.toISOString()
      var stArr=string_timestamp.split("T");
      string_timestamp=stArr.join(" ");
      //console.log(stringa)
      return string_timestamp
  }//get_current_timestamp()



  //module.exports = GregLogs;