import {readEvents} from "../storage/memory.store.js"

export const queryFilter = (query) => {
    let filteredEvents = readEvents()
    const from = query.from? Date.parse(query.from): null
    const to = query.to? Date.parse(query.to): null
    const type = query.type? query.type: null
    
    if(type !== null){
        filteredEvents = filteredEvents.filter((event) => event.type === type)
    }
    if(from !== null){
        filteredEvents = filteredEvents.filter(event => Date.parse(event.timestamp) >= from)
    }
    if(to !== null){
        filteredEvents = filteredEvents.filter(event => Date.parse(event.timestamp) <= to)
    }
    return filteredEvents
}

export const paginationHelper = (query = {}, items = []) => {
    const page = query.page? Number(query.page): 1
    const limit = query.limit? Number(query.limit): 10
    
    const orderEvents = (items) =>{
        return items.sort((a, b) => {
            if(a.timestamp === b.timestamp) return a.id === b.id? 0: a.id > b.id? -1:  1
            if(a.timestamp < b.timestamp) return 1
            if(a.timestamp > b.timestamp) return -1
        })
    }
    items = orderEvents(items)
    const output = {
        items: items.slice((page - 1) * limit, page * limit),
        page: page,
        limit: limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit)
    }
    return output
}