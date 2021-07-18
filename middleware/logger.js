const logger = (req, res, next) => {
    console.log('incoming req')

    //hello can be accessed inside next middleware
    req.hello = 'Hello World'
    // console.log(
    //     `Request:    ${req.method}
    //     Protocol:    ${req.protocol}
    //     Host:        ${req.get('host')}
    //     Original Url:    ${req.originalUrl}`
    // )

    //This will call next middleware
    next() 

    console.log('outgoing res')
}

module.exports = logger