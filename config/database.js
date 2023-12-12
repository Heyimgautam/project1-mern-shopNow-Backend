const mongoose = require('mongoose')

const connectDatabase = ()=>{mongoose.connect(process.env.DB_URL,{
    dbname : "Ecommerce"
}).then(res=>{
    console.log(`Database is connected in ${res.connection.host}`)
}).catch(error=>{
    console.log(error)
})
}

module.exports = connectDatabase;