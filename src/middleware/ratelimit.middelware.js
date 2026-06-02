import {createRateLimiter} from "../services/ratelimit.service.js"


export const rateLimiter = (options = {}) => {
    const meter = createRateLimiter(options)
    return(req, res, next)=>{
        const key = req.headers["x-api-key"] || req.ip
        const result = meter.checkRateLimit(key)
        const timeLeft = Math.ceil((result.windowResetTime - Date.now()) / 1000)
        if(!result.allow){
            return res
            .set("Retry-After", String(timeLeft))
            .status(429)
            .json({
                ok: false,
                error: {
                    code: "RATE_LIMIT_EXEEDED",
                    message: `You have exeeded your rate limit. Try again in: ${timeLeft} seconds.`
                }
            })
        }
        next()
    }
}