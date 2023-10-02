import mongoose from 'mongoose'
const connectDB  = async ()=>{
    console.log(process.env.DB_URl);
    return await mongoose.connect(process.env.DB_URl)
    .then(res=>console.log(`DB Connected successfully on .........`))
    .catch(err=>console.log(` Fail to connect  DB.........${err} `))
}


export default connectDB;