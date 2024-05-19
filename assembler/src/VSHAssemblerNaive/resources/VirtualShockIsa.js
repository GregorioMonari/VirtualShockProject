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
            "copBytes":"000000"
        },
        "sub":{
            "type":"register",
            "copBytes":"000001"
        },
        "and":{
            "type":"register",
            "copBytes":"000101"
        },
        "or":{
            "type":"register",
            "copBytes":"000110"
        },
        "addi":{
            "type":"immediate",
            "copBytes":"001010"
        },
        "subi":{
            "type":"immediate",
            "copBytes":"001011"
        },



        "sw":{
            "type":"immediate",
            "copBytes":"010100",
            "fields":["cost(rs1)","rs2"]
        },
        "lw":{
            "type":"immediate",
            "copBytes":"010101",
            "fields":["rs2","cost(rs1)"]
        },


        "jr":{
            "type":"register",
            "copBytes":"010011"
        },
        "j":{
            "type":"jump",
            "copBytes":"010100",
            "fields":["cost"]
        },


        "beqz": {
            "type":"immediate",
            "copBytes":"011010",
            "fields":["r0","rs1","cost"]
        },
        "bneqz": {
            "type":"immediate",
            "copBytes":"011011",
            "fields":["r0","rs1","cost"]
        },


        "seq":{
            "type":"register",
            "copBytes":"011100"
        },
        

        "push":{
            "type":"immediate",
            "copBytes":"101000",
            "fields":["rs2","r30","0"]
        },
        "pop":{
            "type":"immediate",
            "copBytes":"101001",
            "fields":["rs2","r30","0"]
        },

        "out":{
            "type":"immediate",
            "copBytes":"101010",
            "fields":["cost(rs1)","rs2"]
        },
        "in":{
            "type":"immediate",
            "copBytes":"101011",
            "fields":["rs2","cost(rs1)"]
        },

        "print":{
            "type":"register",
            "copBytes":"111110",
            "fields":["r0","rs1","r0"]
        },
        "halt":{
            "type":"register",
            "copBytes":"111111",
            "fields":["r0","r0","r0"]
        }
    }
}