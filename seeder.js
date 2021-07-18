const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')
// const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')


//Load env vars
dotenv.config({ path: './config/config.env'})

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

//Read JSON files
// const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/course.json`, 'utf-8'))

//Import into DB
const importData = async () => {
    try {
        // await Bootcamp.create(bootcamps)
        await Course.create(courses)

        console.log('Data Imported...'.green.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

const deleteData = async () => {
    try {
        // await Bootcamp.deleteMany(bootcamps)
        await Course.deleteMany(courses)

        console.log('Data Destroyed...'.red.inverse)
        process.exit()
    } catch (error) {
        console.error(err)
    }
}

if(process.argv[2] === '-i') {
    importData()
} else if(process.argv[2] === '-d') {
    deleteData()
}