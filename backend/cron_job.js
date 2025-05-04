// cronJobs.js
const cron = require('node-cron');
const CustomerController = require('./controllers/customerController');
const  AdminController=require('./controllers/adminController')
function scheduleCacheUpdates() {
    // Run every hour
    cron.schedule('* * * * *', async () => {
        console.log('Running cache update for top cities distributors');
        try {
            await CustomerController.cacheTopCitiesDistributors();
            await CustomerController.cacheDashboardItems();
            console.log('CustomerController updated ')
            // AdminController cache updates
            await AdminController.cacheAdminDashboard();
            await AdminController.cacheRatingsData();
            await AdminController.cacheRatedAndUnratedVendors();
            await AdminController.cacheTopItemEachYear();
            await AdminController.cacheTopVendorEachYear();
            await AdminController.cacheUserCountsByCity();
            await AdminController.cacheCustomerAnalysis();
            await AdminController.cachePurchasesAnalysis();
            console.log('AdminController cache update completed');
            console.log('Cache update completed');
        } catch (error) {
            console.error('Cache update failed:', error);
        }
    });
}

module.exports = { scheduleCacheUpdates };