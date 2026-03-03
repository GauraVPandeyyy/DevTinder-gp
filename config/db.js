const mongoose = require("mongoose")

const ConnectDB = async ()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL)
       console.log("DB Connected")
    } catch (error) {
        console.error("DB not connected", error.message);
        process.exit(1)
    }
}

module.exports = ConnectDB;