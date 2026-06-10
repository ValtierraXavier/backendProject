import { getEventById, saveEvent } from "../storage/memory.store.js";
import { paginationHelper, queryFilter } from "../services/events.service.js"

export const handleGetEvents = async (req, res) => {
    const queries = req.query
    const filteredData = queryFilter(queries)
    const paginatedData = paginationHelper(queries, filteredData)
        res.status(200).json({
            ok: true,
            data: paginatedData.items,
            pagination: paginatedData.pagination
        })
}

export const handleGetEventById = async (req, res) => {
    const id = req.params.id
    const event = getEventById(id)
    if(!event){
        res.status(404).json({
            ok: false,
            error: {
                code: "NOT_FOUND",
                message: `Event with ID: ${id} does not exist.`
            }
        })
    }
    res.status(200).json({
            ok: true,
            data: event
    }) 
}

export const handlePostEvent = async (req, res) => {
     const response = req.body
    const storedEvent = saveEvent(response)
    res.status(201).json({
        ok: true,
        data: storedEvent
    })
}