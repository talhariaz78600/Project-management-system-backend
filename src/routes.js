const authRoute=require('./routes/authRoute')
const userRoute=require('./routes/userRoute')
const projectRoute=require('./routes/projectRoute')
const logsRoute=require('./routes/LogsRoute')
const taskRoute=require('./routes/taskRoute')
const associateRoute=require('./routes/assocaiteRoute')
const roleRoute=require('./routes/roleRoute')
const notificationRoute=require('./routes/notificationRoute')
const budgetMilestoneRoute=require('./routes/budgetMilestoneRoute')

module.exports={
    authRoute,
    userRoute,
    projectRoute,
    logsRoute,
    taskRoute,
    associateRoute,
    roleRoute,
    notificationRoute,
    budgetMilestoneRoute
}