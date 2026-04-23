import express from 'express'

const app = express()

app.get('/',(req, res)=>{
    res.send('Hello World')
})
app.get('/health',(req, res)=>{
    res.status(200).json({ok:true})
})
app.use((req, res)=>{
    res.status(404).json({error: 'Something went wrong here.'})
})

app.use((err, req, res, next)=>{
    res.status(500).json({error: ' Internal server Error.'})
})

export default app