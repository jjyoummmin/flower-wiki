const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    flower_type : {type:String, required:true},
    season : {type:String, required:true},
    lat : {type:Number, required:true},
    lng : {type:Number, required:true},
})

module.exports = mongoose.model("flower_location", locationSchema);