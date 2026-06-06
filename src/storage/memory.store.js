const events = []
export const saveEvent = (event) => {
    events.push(event)
    return event
}
export const readEvents = () => {
    return events
}

export const resetEvents = () => {
    events.length = 0
}

export const getEventById = (id) => {
    return events.find(e => e.id === id) || null
}