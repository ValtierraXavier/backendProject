export const validateEvent = (req, res, next) => {
    const event = req.body
     if(!event){
       return res.status(400).json({
            error: {
                code: "INVALID_EVENT" ,
                message: "Request Body required."
            }
        })
    }
    if(Object.keys(event).length === 0){
       return res.status(400).json({
            error: {
                code: "INVALID_EVENT",
                message: "JSON object is Empty."
            }
        })
    }
    if(typeof event.id !== "string" || event.id.trim() === ""){
        return res.status(400).json({
            error: {
                code: "INVALID_ID",
                message: "Id must be non-empty string."
            }
        })
    }
    if(typeof event.type !== "string" || event.type.trim() === ""){
        return res.status(400).json({
            error: {
                    code: "INVALID_TYPE",
                    message: "Type must be a non-empty string."
            }
        })
    }
    if(typeof event.timestamp !== "string" || Number.isNaN(Date.parse(event.timestamp))){
        return res.status(400).json({
            error: {
                code: "INVALID_TIMESTAMP",
                message: "Timestamp must be a valid ISO-8601 date string."
            }
        })
    }
    if(
        typeof event.payload !== "object" ||
        event.payload === null ||
        Array.isArray(event.payload)
    ){
        return res.status(400).json({
            error:{
                code: "INVALID_PAYLOAD",
                message: "Payload must be an object."
            }
        })
    }
    next()
}