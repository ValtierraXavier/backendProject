import {test, expect} from 'vitest'
import crypto from 'crypto'
import {createDedupeService} from "../../src/services/dedupe.service.js"

const generateID = () => {
    return crypto.randomUUID()
}

test("check if dedupe service will reject non-expired events within the ttl window.", async () => {
    let fakeNow = 0
    const id = generateID()
    const dedupe = createDedupeService({
        ttlMs: 100,
        now: ()=> fakeNow
    })
    expect(dedupe.isDuplpicate(id)).toBe(false)
    fakeNow = 50
    expect(dedupe.isDuplpicate(id)).toBe(true)
    fakeNow = 100
    expect(dedupe.isDuplpicate(id)).toBe(false)
    
})