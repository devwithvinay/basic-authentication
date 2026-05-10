import mongoose from "mongoose";

const db = ()=> { 
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log('mongodb is connected'))
    .catch((err)=>{
        console.log('Error to connecting',err);
    })
         

}
export default db ;