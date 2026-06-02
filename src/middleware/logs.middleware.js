export const reqLogger = (req, res, next) => {
if(process.env.NODE_ENV = "test") return next()
    const start = Date.now()
    const method = req.method
    const path = req.path
    const status = res.statusCode
    res.on('finish', ()=>{
        const duration = Date.now() - start
        console.log(`${method}, ${path}, ${status}, ${duration}ms`)
    })
    next()
}