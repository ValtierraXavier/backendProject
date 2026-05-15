import {createDedupeService} from "../services/dedupe.service.js"

const dedupe = createDedupeService({ttlMs: 60000})

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
                message: "Id must be a non-empty string."
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
    if(dedupe.isDuplpicate(event.id)){
        return res.status(409).json({
            ok: false,
            error:{
                code: "DUPLICATE_EVENT",
                message: "This request is currently being processed or has expired."
            }
        })
    }
    next()
}

//validates from/to as valid ISO-8601 date string. 
export const validateQuery = (req, res, next) => {
    const queries = req.query
    const from = queries.from
    const to = queries.to

    if(from !== undefined || typeof from !== "string" || Number.isNaN(Date.parse(from))){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"from\" is not in a valid format."
            }
        })
    }
    if(to !== undefined || typeof to !== "string" || Number.isNaN(Date.parse(to))){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"to\" is not in a valid format."
            }
        })
    }
    next()
}