export const createDedupeService = ({ttlMs = 60000, now = Date.now} = {}) => {
    const TTL = new Map()
    const isDuplpicate = (id) => {
        if(TTL.has(id) && TTL.get(id).expiresAt > now()){
            return true
        }
        TTL.set(id,{createdAt: now(), expiresAt: now() + ttlMs})
        return false
    }
    return {isDuplpicate}
}

//i want to make an expiration window. 
/*
the event object will have a structure like: 
    {
        id: string,
        type: string,
        timeStamp: ISO-8601 string,
        payload; Object
    }
    i want to save to the ttl map with a structure like :
        id => {
            exp: Date,
            created: Date,
            data: Event Object
        }
    
    1. check if the event id is in the map and its expTime <= current time. 
        -if eval === true:
            - reject request
                - res.status(400).json({ok: false, error:{code: "DUPLICATE_EVENT", message: "this request is currently being processed or has expired."}})
        - if eval === false:
            - save the key pair [event.id, {currTime, expTime, event}]
*/