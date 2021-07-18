const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')
const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')

// @desc     Get courses
// @route    Get /api/v1/courses
// @route    Get /api/v1/bootcamps/:bootcampId/courses
// @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query
    
    if(req.params.bootcampId){
        query = Course.find({ bootcamp: req.params.bootcampId})
    } else {
        //populate method to get bootcamp inside courses with only name & description field
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        })
    }

    const courses = await query
    
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})

// @desc    Get single course
// @route   Get /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if(!course){
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler( async (req, res, next) => {
    console.log(`course added`)
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp w/ id of ${req.params.bootcampId}`, 404))
    }

    const course = await Course.create(req.body)
    console.log(`course added`)
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler( async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course w/ id of ${req.params.id}`, 404))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler( async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course) {
        return next(new ErrorResponse(`No course w/ id of ${req.params.id}`, 404))
    }
    
    // course.remove() method is used so that pre('remove') middleware runs in Course model
    course.remove()

    res.status(200).json({
        success: true,
        data: `Course w/ id ${req.params.id} is deleted`
    })
})