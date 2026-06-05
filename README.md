# Backend Project
This is a small backend project to familiarize myself with express and network arcitecture.

## Technologies

- Node.js
- Express
- Vitest
- Supertest


## Features
- Event Ingestion
- Validation Middleware
- Deduplication Window
- Filtering
- Pagination
- Request Logging
- Rate Limiting
- Integration Tests

## Structure
- Routes - Handles requests and responses.
- Middleware - Handles validation, logging, and rate limiting.
- Services - Contains middleware functionality logic.
- Storage - Manages persistent data. 

## Installation
```bash
git clone https://github.com/ValtierraXavier/backendProject.git
cd backendProject
npm install
```

## Running the Application
```bash
npm run start
```

## Running Tests
```bash
npm run test

```

## API Documentation

### GET "/health"
---
Returns {ok: true}

### GET "/events"
---
Returns a paginated array of events. 
#### Query Parameters
| Name | Type | Required | Default | Description | 
|---|---|---|---|---|
|`from`|ISO 8601 Date String|No|N/A|Only return items after the supplied timestamp.|
|`to`|ISO 8601 Date String|No|N/A|Only return items before the supplied timestamp.|
|`type`|String|No|N/A|Only return items of the same supplied type.|
|`page`|Integer|No|"1"|Only return items from the indicated page.|
|`limit`|Integer|No|"10"|Limits the number of items per page.| 

#### Success Response
Status: 200 OK

```js
{
    ok: true,
    data:{
        items: []
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }
}
```

#### Error Response
Status: 400 Bad Request / 409 Conflict
```js
{
    ok:false,
    error:{
        code: "INVALID_PAYLOAD",
        message: "Payload must be an object"
    }
}
```

### POST "/events"
---
Creates a new event.
#### Success Response

Status - 201 Created
```js
{
    ok: true,
    data: {
        id: "1A2B3C4D5E",
        type: "json",
        timestamp: "2026-05-04T00:00:00.000Z",
        payload: {}
    }
}
```

#### Error Response:
```js
{
    ok: false,
    error:{
        code: "INVALID_TIMESTAMP",
        message: "timestamp must be a valid ISO-8601 date string."
    }
}
```

### GET "/events/saved"
---
Returns a paginated array of all events.

#### Success Response

Status - 200 OK
```js
{
    ok: true,
    data: {
        items: []
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }
}
```