import {createDedupeService} from "../services/dedupe.service.js"

export const dedupe = createDedupeService({ttlMs: 60000})

const sendValidationError = (req, res, status, code, message) => {
    const err = {ok: false, error: {code, message}}
    console.warn(code, {path: req.path, method: req.method, err})
    return res.status(status).json(err)
}

export const validateEvent = (req, res, next) => {
    const event = req.body
     if(!event){
        return sendValidationError(req, res, 400, "INVALID_EVENT", "Request Body required." )
    }
    if(Object.keys(event).length === 0){
        return sendValidationError(req, res, 400, "INVALID_EVENT", "JSON object is empty.")
    }
    if(typeof event.id !== "string" || event.id.trim() === ""){
        return sendValidationError(req, res, 400, "INVALID_ID", "Id must be a non-empty string.")
    }
    if(typeof event.type !== "string" || event.type.trim() === ""){
        return sendValidationError(req, res, 400, "INVALID_TYPE", "Type must be a non-empty string.")
    }
    if(typeof event.timestamp !== "string" || Number.isNaN(Date.parse(event.timestamp))){
        return sendValidationError(req, res, 400, "INVALID_TIMESTAMP", "Timestamp must be a valid ISO-8601 date string.")
    }
    if(
        typeof event.payload !== "object" ||
        event.payload === null ||
        Array.isArray(event.payload)
    ){
        return sendValidationError(req, res, 400, "INVALID_PAYLOAD", "Payload must be an object.")
    }
    if(dedupe.isDuplpicate(event.id)){
        return sendValidationError(req, res, 409, "DUPLICATE_EVENT", "This request is currently being processed or has expired.")
    }
    next()
}

//validates from/to as valid ISO-8601 date string. 
export const validateQuery = (req, res, next) => {
    const queries = req.query
    const from = queries.from
    const to = queries.to
    const page = queries.page
    const limit = queries.limit

    if(from !== undefined && Number.isNaN(Date.parse(from))){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"from\" is not in a valid format."
            }
        })
    }
    if(to !== undefined && Number.isNaN(Date.parse(to))){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"to\" is not in a valid format."
            }
        })
    }
    if(page !== undefined && (Number.isNaN(Number(page)) || Number(page) < 1)){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"page\" is not in a valid format."
            }
        })
    }
    if(limit !== undefined && (Number.isNaN(Number(limit)) || Number(limit) < 1)){
        return res.status(400).json({
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: "Query \"limit\" is not in a valid format."
            }
        })
    }
    next()
}

export const validateParams = (req, res, next) => {
    const id = req.params.id
    if(id === undefined){
        return next()
    }
    if(!idExists){
        return res.status(404).json({
            ok: false,
            error: {
                code: "RECORD_NOT_FOUND",
                message: `Record for ID: ${id} does not exist.`
            }
        })
    }
        
}