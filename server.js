const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const path = require('path')
const fileupload = require('express-fileupload')
const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

//Load env vars
dotenv.config({ path: './config/config.env' })

//Connect to database
connectDB()

//Route Files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')

const app = express()

//Body Parser
app.use(express.json())

//Custom logging middleware
app.use(logger)

//Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// File Uploading
app.use(fileupload())

// Set Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses)

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${process.env.PORT}`.yellow.bold)
)

//handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)

    //close server and exit process
    server.close(() => process.exit(1))
})
