import app from '../../src/app.js'
import request from 'supertest'
import {test, expect} from 'vitest'

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
    expect(res.body).toEqual({error: 'Route not found.'})
})

test('Test missing request body to respond with status 400.', async()=>{

    const res = await request(app)
        .post('/events')
        .send(undefined)
        .set('Accept', 'aplication/json')
        .expect(400)
    expect(res.body).toEqual({"error":"Request Body required."})
})

test('Test request with empty json to respond with status 400.', async()=>{
    const res = await request(app)
        .post('/events')
        .send({})
        .set('Accept', "application/json")
        .expect(400)
    expect(res.body).toEqual({"error":"JSON object is Empty."})
})

test('Test request with object to respond with status of 201 and the object sent.', async()=>{
    const res = await request(app)
        .post('/events')
        .send({name: 'xavier'})
        .set('Accept', "application/json")
        .expect(201)
    expect(res.body).toEqual({name: 'xavier'})
})