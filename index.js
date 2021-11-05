const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
var admin = require('firebase-admin');
var serviceAccount = require("./secret/config.json");
var multer = require('multer');
var path = require('path');
const saltedMd5=require('salted-md5')

app.use(cors());
const upload=multer({storage: multer.memoryStorage()})

require('dotenv').config()
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//serve static files

// app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, '//frontend/public')));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:"https://console.firebase.google.com/project/portfolio-88cee/firestore",
  storageBucket: process.env.BUCKET_URL
});

const db = admin.firestore();
const userService = require("./user_service");
app.locals.bucket = admin.storage().bucket();
// Cloud storage
app.post('/upload',upload.single('file'),async(req,res)=>{
    try {
    const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!') 
  const fileName =(req.file.originalname)
  await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer);
  res.json({
    fileName
  })
  } catch (error) {
    res.json({
      success:false,
      message:"file not uploaded"
    })
  }
  })

app.get("/upload", upload.single('file'),async(req,res) => {
  try {
        const bucket = admin.storage().bucket();
        const fileName =(req.file.originalname)
        const file = bucket.file(fileName);
        const signedURLconfig = { action: 'read', expires: '08-12-2025' }; 
        const signedURLArray = await file.getSignedUrl(signedURLconfig);
        const url = signedURLArray[0];
        await admin.firestore().collection('image').add({ fileName: fileName, signedURL: url })
        res.json({
          fileName,
          url
        })
    } catch (error) {
        res.json({
          success:false,
          message:"file not uploaded"
        })
    }
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.addUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    res.json({
      success:false,
      message:"no user added"
     });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.authenticate(email, password);
    res.json(user);
  } catch (err) {
    res.status(404).json({ 
      success:false,
      message:"no user found"
    });
  }
});

app.get("/me", (req, res) => {
  res.json({
    Name: "Diana Iminza",
    description:"Junior Web developer",
    skills:"HTML/CSS|Bootstrap|JavaScript|React|Node|"
  });
});

async function storeFood(food) {
    const docRef = await db.collection('Food').add(food)
    console.log('Added document with ID: ', docRef.id);
}



async function getFoods() {
  const snapshot = await db.collection('Food').get()
  const collection = [];
  snapshot.forEach(doc => {
    let food=doc.data();
    food['id']=doc.id
      collection.push(food);
  });
  return collection;
}

app.post("/foods", cors(), async (req,res) =>{
     var title     = req.body.title;
	  var description = req.body.description;
	  var image   = req.body.image;
	  var id = req.body.id;
    var price=req.body.price;
    var foodType=req.body.foodType;

	    var food  = {
	        title: title,
	        description: description,
	        id: id,
	        price: price,
            image:image,
          foodType: foodType
	      };
        res.json({
          food
        })  
          await storeFood( food);
          return food
      
})
app.get('/foods/:id', cors(),async (req,res) =>{
   const snapshot = await db.collection("Food").get();
   snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
     food=doc.data();
    food['id']=doc.id
      
     })
  console.log(food)
  if(food){
   res.json({
     food
   })
  }else
  {
    res.json({
      success:false,
      message:"no food found"
    })
  }   
});

app.get("/foods",cors(), async (req,res)=>{
  
  var generatedFood = await getFoods();
  if (generatedFood != null)
  res.json(generatedFood)
  else
  res.json({
    success:false,
    message:"no projects available"
  })
})

app.put("/foods/edit/:id", cors(),async (req,res)=>{
  var title     = req.body.title;
  var description = req.body.description;
  var price   = req.body.price;
  var image   = req.body.image;
  var foodType=req.body.foodType;
  
  var postsRef = db.collection('Food');
  var query = postsRef.where('id', '==', req.params.id).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          var updateDoc = db.collection('Food').doc(doc.id).update({
            title,
            description,
            price,
            }).then(() => {
              res.json({
                success:true,
                message:"successfully updated your document"
              })
            } 
            );
        });
      })
});
app.delete('/foods/delete/:id', async (req, res) => {
  var postsRef = db.collection('Food');
  var query = postsRef.where('id', '==', req.params.id).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          var deleteDoc = db.collection('Food').doc(doc.id).delete();
        });
      })
      res.json({
        success:true,
        message:"project successfully deleted"
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
});

if(process.env.NODE_ENV ==='production'){
app.use(express.static('client/build'));

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(__dirname, 'client','build','index.html'));

});
}


app.listen(process.env.PORT || 5000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
