import express from 'express'
import { saveEvent } from './storage/memory.store.js'
import { validateEvent, validateQuery } from './middleware/validate.middleware.js'
import { queryFilter, paginationHelper } from './services/events.service.js';
import { rateLimiter } from './middleware/ratelimit.middelware.js';
import { reqLogger } from './middleware/logs.middleware.js';
import {handleGetEventById} from "./controllers/events.controller.js"

const app = express()

app.use(
    express.json(),
    express.urlencoded({extended: true}),
    reqLogger
)
if(process.env.NODE_ENV !== "test") {
    app.use(rateLimiter())
}

app.get('/health',(req, res)=>{
    res.status(200).json({ok:true})
})

app.get("/events", validateQuery, async (req, res) => {
    const queries = req.query
    const filteredData = queryFilter(queries)
    const paginatedData = paginationHelper(queries, filteredData)
        res.status(200).json({
            ok: true,
            data: paginatedData.items,
            pagination: paginatedData.pagination
        })
})

app.post('/events', validateEvent, async (req,res) => {
    const response = req.body
    const storedEvent = saveEvent(response)
    res.status(201).json({
        ok: true,
        data: storedEvent
    })
})

app.get("/events/:id", handleGetEventById)

app.use((req, res)=>{
    res.status(404).json({
        ok: false, 
        error: {
            code: 'INVALID_ROUTE',
            message: 'Route not found.'
        }
    })
})

app.use((err, req, res, next)=>{
    console.error(err)
    res.status(500).json({ok: false, error: 'Internal server Error.'})
})
export default app