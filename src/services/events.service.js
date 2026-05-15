import {readEvents} from "../storage/memory.store.js"

export const queryFilter = (query) => {
    let filteredEvents = readEvents()
    const from = query.from? Date.parse(query.from): null
    const to = query.to? Date.parse(query.to): null

    if(query.type){
        filteredEvents = filteredEvents.filter(event => event.type === query.type)
    }
    if(query.from){
        filteredEvents = filteredEvents.filter(event => Date.parse(event.timestamp) >= from)
    }
    if(query.to){
        filteredEvents = filteredEvents.filter(event => Date.parse(event.timestamp) <= to)
    }
    
    return filteredEvents
}