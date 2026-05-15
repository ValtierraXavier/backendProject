import app from '../../src/app.js'
import request from 'supertest'
import {test, expect} from 'vitest'
import crypto from "crypto"

const generateID = ()=>{
    return crypto.randomUUID()
}
test("tests the health endpoint. expect {ok: true}", async ()=>{
    const res = await request(app)
        .get('/health')
        .expect("Content-Type", /json/)
        .expect(200)
    expect(res.body).toEqual({ok: true})
})
test("tests a fake endpoint expectiong 404 status.", async()=>{
    const res = await request(app)
        .get('/fakeEP/')
        .expect('Content-Type', /json/)
        .expect(404)
    expect(res.body).toEqual({
        ok: false, 
        error: {
            code: 'INVALID_ROUTE',
            message: 'Route not found.'
        }
    })
})

test('Test missing request body to respond with status 400.', async()=>{

    const res = await request(app)
        .post('/events')
        .send(undefined)
        .set('Accept', 'aplication/json')
        .expect(400)
    expect(res.body).toEqual({
        error:{
            code:'INVALID_EVENT',
            message: "Request Body required."
        }
    })
})

test('Test request with empty json to respond with status 400.', async()=>{
    const res = await request(app)
        .post('/events')
        .send({})
        .set('Accept', "application/json")
        .expect(400)
    expect(res.body).toEqual({
            error: {
                code: "INVALID_EVENT",
                message: "JSON object is Empty."
            }
        })
})

test('Test request with object to respond with status of 201 and the object sent.', async()=>{
    const date = new Date().toISOString()
    const res = await request(app)
        .post('/events')
        .send({
            "id": "12345",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
        .set('Accept', "application/json")
        .expect(201)
    expect(res.body).toEqual({
            "id": "12345",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
})

test('Test event validation INVALID_ID. respond with 400 status.', async ()=>{
    const date = new Date().toISOString()
    const res = await request(app)
        .post('/events')
        .set("Accept", "application/json")
        .send({
            "id": 12345,
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
        .expect(400)
    expect(res.body).toEqual({
        error:{
            code:'INVALID_ID',
            message: "Id must be a non-empty string."
        }
    })
})

test("test with body object containing invalid type. reaponds with 400", async()=>{
    const date = new Date().toISOString()
    const res = await request(app)
        .post("/events")
        .set("Accept", "application/json")
        .send({
                "id": '12345',
                "type": "",
                "timestamp": date,
                "payload": {}
            })
        .expect(400)
    expect(res.body).toEqual({
            error: {
                    code: "INVALID_TYPE",
                    message: "Type must be a non-empty string."
            }
        })
})

test("Test /events with body object containing invalid timestamp.", async ()=>{
    const date = "10:50"
    const res = await request(app)
        .post('/events')
        .set("Accept", "application/json")
        .send({
            "id": "12345",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
        .expect(400)
    expect(res.body).toEqual({
        error: {
                code: "INVALID_TIMESTAMP",
                message: "Timestamp must be a valid ISO-8601 date string."
            }
        })

})

test("tests /events with invalid payload object.", async()=>{
    const date = new Date().toISOString()
    const res = await request(app)
        .post("/events")
        .set("Accept", "application/json")
        .send({
            "id": "12345",
            "type": "json",
            "timestamp": date,
            "payload": []
        })
        .expect(400)
    expect(res.body).toEqual({
            error:{
                code: "INVALID_PAYLOAD",
                message: "Payload must be an object."
            }
        })
})

test('Dedupe service event with the same id within 60 seconds. should reject second request.', async ()=>{
    const date = new Date().toISOString()

    const res1 = await request(app)
        .post("/events")
        .send({
            "id": "123456",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
        .expect(201)
    const res2 = await request(app)
        .post("/events")
        .send({
            "id": "123456",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
        .expect(409)
    expect(res1.body).toEqual({
            "id": "123456",
            "type": "json",
            "timestamp": date,
            "payload": {}
        })
    expect(res2.body).toEqual({
            ok: false,
            error:{
                code: "DUPLICATE_EVENT",
                message: "This request is currently being processed or has expired."
            }
        })
})