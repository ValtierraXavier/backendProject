import { getEventById } from "../storage/memory.store.js";

export const handleGetEventById = (req, res) => {
    const id = req.params.id
    const event = getEventById(id)
    if(!event){
        return res.status(404).json({
            ok: false,
            error: {
                code: "NOT_FOUND",
                message: `Event with ID: ${id} does not exist.`
            }
        })
    }
    return  res.status(200).json({
            ok: true,
            data: event
        }) 
}