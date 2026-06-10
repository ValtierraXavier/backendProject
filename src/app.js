import express from 'express'
import { rateLimiter } from './middleware/ratelimit.middelware.js';
import { reqLogger } from './middleware/logs.middleware.js';
import router from "./routes/index.routes.js"

const app = express()

app.use(
    express.json(),
    express.urlencoded({extended: true}),
    reqLogger
)
app.use("/", router)

if(process.env.NODE_ENV !== "test") {
    app.use(rateLimiter())
}

app.use((req, res)=>{
    res.status(404).json({
        ok: false, 
        error: {
            code: 'INVALID_ROUTE',
            message: 'Route not found.'
        }
    })
})

app.use((err, req, res, next)=>{
    console.error(err)
    res.status(500).json({ok: false, error: 'Internal server Error.'})
})
export default app