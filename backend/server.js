const app = require("./app")

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV !== "test"){
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })
}else {
    console.log("Running in test environment. Server not started.");
}