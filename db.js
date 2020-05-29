const mongodb=require("mongodb");
let mongoclient=mongodb.MongoClient;
let db;
const str="mongodb+srv://NodeCode:DCJBr9BW0SD9T87h@vibrants-0fbgh.mongodb.net/test?retryWrites=true&w=majority";
const mongoconnect=callback => {
    mongoclient.connect(str).
     then(
          client=>{console.log("Connected")
          db=client.db('Vibrant');
          callback();
}).
      catch(err=>{
          console.log("error");
      })
    }
    
   function getdb(){
       if(db)
       return db;
   } 
exports.MongoConnect=mongoconnect;     
exports.getdb=getdb;