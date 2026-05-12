import express from 'express'
import { readEvents, saveEvent } from './storage/memory.store.js'
import {validateEvent} from './middleware/validate.middleware.js'

const app = express()

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.get('/',(req, res)=>{
    res.send('Hello World')
})
app.get('/health',(req, res)=>{
    res.status(200).json({ok:true})
})

app.post('/events', validateEvent, async (req,res) => {
    const response = req.body
    const storedEvent = await saveEvent(response)
    res.status(201).json(storedEvent)
})

app.get('/events/saved', async (req, res)=> {
    res.json(await readEvents())
})

app.use((req, res)=>{
    res.status(404).json({ok: false, error: {code: '404', message: 'Route not found.'}})
})

app.use((err, req, res, next)=>{
    console.error(err)
    res.status(500).json({ok: false, error: 'Internal server Error.'})
})

export default app