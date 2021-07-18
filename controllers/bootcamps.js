const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    console.log('req.query')
    console.log(req.query)

    const reqQuery = { ...req.query }
    
    //Fields to Exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    //Loop over removeFields & delete from req.query
    removeFields.forEach(param => delete reqQuery[param])

    //Create query string
    let queryStr = JSON.stringify(reqQuery)

    //Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')
    
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        console.log(fields)
    }

    const bootcamps = await query
    res.status(201).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })    
})

//@desc     Get a bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with id: ${id} doesn't exist`, 400))
    }

    res.status(201).json({
        success: true,
        data: [bootcamp]
    })
})

//@desc     Create a bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.create(req.body)

    res.status(201).json({
        success: true,
        data: bootcamp
    })
})

//@desc     Update a bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with id: ${id} doesn't exist`, 400))
    }

    res.status(200).json({ success: true, data: bootcamp })
})

//@desc     Delete a bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)
    
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with id: ${id} doesn't exist`, 400))
    }

    // bootcamp.remove() method is used so that pre('remove') middleware runs in Bootcamp model
    bootcamp.remove()

    res.status(200).json({
        success: true, 
        data: `bootcamp w/ id: ${id} is deleted`
    })
})

//@desc     Get bootcamps within a radius
//@route    Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    //Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    //Calc radius using radians
    //Divide dist by radius of Earth
    //Earth Radius = 3,963 mi / 6, 378 km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [lat, lng], radius ]}}
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

//@desc     Upload photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const id = req.params.id
    const bootcamp = await Bootcamp.findById(id)
    
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with id: ${id} doesn't exist`, 404))
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`, 400))
    }

    console.log(req.files)
    const file = req.files.file

    // Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload image file`, 400))
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload image less than ${process.env.MAX_FILE_UPLOAD}`))
    }

    // Create custom filename // we can use timestamp for file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.log(err)
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})