const events = []
export const saveEvent = async (event) => {
    events.push(event)
    return event
}
export const readEvents = async () => {
    return events
}

// export const validity = (event) => {
//     if(event.id.length === 0 && event.type.length === 0){

//     }
//     if(event.timestamp == /*some criteria.*/){

//     }
//     if(event instanceof Object){
        
//     }
// }