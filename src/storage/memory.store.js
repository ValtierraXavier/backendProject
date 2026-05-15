const events = []
export const saveEvent = async (event) => {
    events.push(event)
    return event
}
export const readEvents = async () => {
    return events
}

