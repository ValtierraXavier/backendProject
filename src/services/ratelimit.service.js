export  const createRateLimiter = ({limitWindow = 60000, now = Date.now, limit = 10} = {}) => {
    const seen = new Map()

    const checkRateLimit = (key) => {
        if(seen.has(key)){
            const record = seen.get(key)
            if(now() >= record.windowResetTime){
                record.windowResetTime = now() + limitWindow
                record.count = 1
                record.allow = true
            }else{
                if(record.count < limit){
                    record.count++
                    record.allow = true
                }else{
                    record.allow = false
                }

            }
        }else{
            seen.set(key, {
                allow: true,
                windowResetTime: now() + limitWindow,
                count: 1
            })
        }
        return seen.get(key)
    }

    const resetSeen = () => {
        seen.clear()
    }

    return {checkRateLimit, resetSeen}
}

/*
i want to limit the amount of requests i get per minute from a specific API-key, and if not available, the IP address. 

    check if i have an API-key
        if so use as a key for tracking
        if not request IP adress
            use as a key for tracking
    i need a map to store the information on:{
        key: API-key/IP address.
        data: {
            windowResetTime: now() + resetTime,
            currentCount: 0,
        }
    }
    check if the API-key or the IP adress is a key in the map.
    if it is:
        then check its current request count.
        if its less than the limit:
            add 1 to the count
            allow request through
        if its over the limit:
            check if the tracking window is still active:
                if yes:
                    deny request
                if no: 
                    {
                        API/IP,
                        data: {
                            windowResetTime: now() + limitWindow,
                            currentCount: 1
                        }
                    }
                    allow request through
    if not:
        {
            API/IP,
            data: {
                windowResetTime: now() + limitWindow,
                currentCount: 1
            }
        }
*/