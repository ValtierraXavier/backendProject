import app from '../../src/app.js'
import request from 'supertest'
import {test, expect} from 'vitest'
import crypto from "crypto"
import {fakeEvents} from '../../src/storage/fakeMemory.store.js'
import {resetEvents} from "../../src/storage/memory.store.js"
import { dedupe } from '../../src/middleware/validate.middleware.js';
import { paginationHelper } from '../../src/services/events.service.js';

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
        ok: false,
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
        ok: false,
            error: {
                code: "INVALID_EVENT",
                message: "JSON object is empty."
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
        ok: true,
        data: {
            "id": "12345",
            "type": "json",
            "timestamp": date,
            "payload": {}
        }
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
        ok: false,
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
        ok: false,
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
        ok: false,
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
        ok: false,
        error:{
            code: "INVALID_PAYLOAD",
            message: "Payload must be an object."
            }
        })
})

test('Dedupe service event with the same id within 60 seconds. should reject second request.', async ()=>{
    const date = new Date().toISOString()
    const id = generateID()

    const res1 = await request(app)
        .post("/events")
        .set("Accept", "aaplication/json")
        .send({
            id: id,
            type: "json",
            timestamp: date,
            payload: {}
        })
        .expect(201)
    const res2 = await request(app)
        .post("/events")
        .send({
            id: id,
            type: "json",
            timestamp: date,
            payload: {}
        })
        .expect(409)
    expect(res1.body).toEqual({
        ok: true,
        data:{
            id: id,
            type: "json",
            timestamp: date,
            payload: {}
        }
    })
    expect(res2.body).toEqual({
            ok: false,
            error:{
                code: "DUPLICATE_EVENT",
                message: "This request is currently being processed or has expired."
            }
        })
})

test("test fakeEvent dataset for type query filtering response.", async () => {
    resetEvents()
    dedupe.resetTTL()
    for(const event of fakeEvents){
        await request(app)
        .post("/events")
        .send(event)
        .expect(201)
    }

    const res = await request(app)
        .get("/events?type=json")
        .expect(200)
    const paginatedFilter = paginationHelper({page: 1, limit: 20},fakeEvents.filter(e=> e.type === "json")).items
    expect(res.body.data.items.map(e => e.id)).toEqual(paginatedFilter.map(e => e.id))
})

test("Test /events with a from query. fitering seeded events from fakeEvents.", async () => {
    resetEvents()
    dedupe.resetTTL()

    for(const event of fakeEvents){
        await request(app)
        .post("/events")
        .send(event)
        .expect(201)
    }


    const res = await request(app)
        .get("/events?from=2026-05-03T10:30:00.000Z")
        .expect(200)
    const paginatedFilter = paginationHelper({page: 1, limit: 20},fakeEvents.filter(event => event.timestamp >= "2026-05-03T10:30:00.000Z")).items
    expect(res.body.data.items.map(e => e.id)).toEqual(paginatedFilter.map(e => e.id))
})

test("Test /events with a to query. fitering seeded events from fakeEvents.", async () => { 
    resetEvents()
    dedupe.resetTTL()
    for(const event of fakeEvents){
        await request(app)
        .post("/events")
        .send(event)
        .expect(201)
    }
    
    const res = await request(app)
        .get("/events?to=2026-05-03T10:30:00.000Z")
        .expect(200)
    const paginatedFilter = paginationHelper({page: 1, limit: 20}, fakeEvents.filter(event => event.timestamp <= "2026-05-03T10:30:00.000Z")).items
    expect(res.body.data.items.map(e => e.id)).toEqual(paginatedFilter.map(e => e.id))
})
test("combination queries. from and to.", async () => {
    resetEvents()
    dedupe.resetTTL()

    for(const event of fakeEvents){
        await request(app)
        .post("/events")
        .send(event)
        .expect(201)
    }

    const res = await request(app)
        .get("/events?from=2026-05-02T09:15:00.000Z&to=2026-05-06T13:10:00.000Z")
        .expect(200)
        const paginatedFilter = paginationHelper({page: 1, limit: 20}, fakeEvents.filter(
        e => e.timestamp >= "2026-05-02T09:15:00.000Z" && e.timestamp <= "2026-05-06T13:10:00.000Z"
    )).items
    expect(res.body.data.items.map(e => e.id)).toEqual(paginatedFilter.map(e => e.id)
)
})

test("All query combinations.", async () => {
    const from = '2026-05-02T09:15:00.000Z'
    const to = '2026-05-06T13:10:00.000Z'
    const type = 'xml'

    resetEvents()
    dedupe.resetTTL()


    for (const event of fakeEvents){
        await request(app)
            .post("/events")
            .send(event)
            .expect(201)
    }
    const res = await request(app)
        .get(`/events?type=${type}&from=${from}&to=${to}`)
        .expect(200)
        const paginatedFilter = paginationHelper({page: 1, limit: 20},fakeEvents.filter(
        e => 
            e.type === type &&
            e.timestamp >= from &&
            e.timestamp <= to
        )).items
    expect(res.body.data.items.map(e => e.id)).toEqual(paginatedFilter.map(e => e.id))
})

test("deterministic testing of pagination helper.", async () => {
    
    resetEvents()
    dedupe.resetTTL()

    for (const event of fakeEvents){
        await request(app)
            .post("/events")
            .send(event)
            .expect(201)
    }

    const res1 = await request(app)
        .get("/events?page=1&limit=3")
        .expect(200)
    expect(res1.body.data.items.map(e => e.id)).toEqual(["evt-010","evt-009","evt-008"])
    const res2 = await request(app)
        .get("/events?page=2&limit=3")
        .expect(200)
    expect(res2.body.data.items.map(e => e.id)).toEqual(["evt-007","evt-006","evt-005"])
    const res3 = await request(app)
        .get("/events?page=3&limit=3")
        .expect(200)
    expect(res3.body.data.items.map(e => e.id)).toEqual(["evt-004","evt-003","evt-002"])
    const res4 = await request(app)
        .get("/events?page=4&limit=3")
        .expect(200)
    expect(res4.body.data.items.map(e => e.id)).toEqual(["evt-001"])
    const res5 = await request(app)
        .get("/events?page=5&limit=3")
        .expect(200)
    expect(res5.body.data.items.map(e => e.id)).toEqual([])
    const res6 = await request(app)
        .get("/events?page=4&limit=-3")
        .expect(400)
    expect(res6.body).toEqual(
        {
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: 'Query "limit" is not in a valid format.'
            }
        }
    )
    const res7 = await request(app)
        .get("/events?page=-4&limit=3")
        .expect(400)
    expect(res7.body).toEqual(
        {
            ok: false,
            error:{
                code: "INVALID_QUERY",
                message: 'Query "page" is not in a valid format.'
            }
        }
    )
    
})