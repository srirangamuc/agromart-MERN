const app = require("./app")

const { scheduleCacheUpdates } = require('./cron_job');
const PORT = process.env.PORT || 5000;
scheduleCacheUpdates();

if(process.env.NODE_ENV !== "test"){
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })
}else {
    console.log("Running in test environment. Server not started.");
}