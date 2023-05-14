__JSON_ISA_PUBLIC__={
    "version":0.1,
    "name":"VirtualShockIsa",
    "Author": "Gregorio Monari",
    "description": "",
    "options":{
        "word":"32"
    },
    "data":{
        "add":{
            "type":"register",
            "copBytes":"000000",
            "fields":["rd","rs1","rs2"]
        },
        "addi":{
            "type":"immediate",
            "copBytes":"000001",
            "fields":["rs2","rs1","cost"]
        },
        "j":{
            "type":"immediate",
            "copBytes":"000010",
            "fields":["cost"]
        }
    }
}