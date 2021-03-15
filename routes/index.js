var express = require('express');
var router = express.Router();

// DB 연결
var mongoose = require('mongoose');
var dbconfig = require('../config/dbadmin.json');
var locationModel = require('../public/models/flower_location.js');

let db = mongoose.connection;
db.on('error', console.error);
db.once('open', ()=>{
  console.log('connected to mongoose server');
})

mongoose.connect(`mongodb+srv://dbjimin:${dbconfig.password}@firstmap.mjjdc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
, {useNewUrlParser: true, useUnifiedTopology:true});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

router.get('/add', function(req, res, next) {
  res.render('add');
});


router.get('/flower_fetch', function(req, res, next) {
  locationModel.find()
               .then((result)=>{
                 res.json({message:"success", data:result})
               }).catch((error)=>{
                 res.json({message:"error"});
               })
});


router.post('/flower_register', function(req, res, next) {
  let location = new locationModel();
  let body = req.body;
  location.flower_type = body.flower_type;
  location.lat = body.lat;
  location.lng = body.lng;
  // save to db
  location.save()
          .then((result)=>{
            console.log("register result:", result);
            res.json({message:"success", data:result})
          })
          .catch((error)=>{
            console.log(error);
            res.json({message:"failed"});
          })
});

// router.post('/flower_delete', function(req, res, next) {
//    res.send("삭제 ㅎㅎ");
// });

module.exports = router;
