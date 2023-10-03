import mongoose from 'mongoose'
const connectDB  = async ()=>{
    console.log(process.env.DB_URl);
    return await mongoose.connect(`${process.env.DB_URl}`,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(res=>console.log(`DB Connected successfully `))
    .catch(err=>console.log(` Fail to connect  DB.........${err} `))
}




export default connectDB;