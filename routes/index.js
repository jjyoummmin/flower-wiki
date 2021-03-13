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


router.get('/flower_get', function(req, res, next) {
  locationModel.find({},{_id:0, __v:0})
               .then((result)=>{
                 res.json({message:"success", data:result})
               }).catch((error)=>{
                 res.json({message:"error"});
               })
});



// router.post('/flower_register', function(req, res, next) {
//   let location = new locationModel();
//   location.title = req.body.title;
//   location.address = req.body.address;
//   location.lat = req.body.lat;
//   location.lng = req.body.lng;
//   console.log(req.body);
//   // save to db
//   location.save()
//           .then((result)=>{
//             res.send("success");
//           })
//           .catch((error)=>{
//             console.log(error);
//             res.send("failed");
//           })
// });

// router.post('/flower_delete', function(req, res, next) {
//   locationModel.find({},{_id:0, __v:0})
//                .then((result)=>{
//                  console.log(result);
//                  res.json({message:"success", data:result})
//                }).catch((error)=>{
//                  console.log(error);
//                  res.json({message:"error"});
//                })
// });

module.exports = router;
