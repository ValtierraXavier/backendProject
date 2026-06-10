import { Router } from "express"
import * as eventController from "../controllers/events.controller.js"
import { validateEvent, validateQuery } from "../middleware/validate.middleware.js";

const router = Router()
router.get("/", validateQuery, eventController.handleGetEvents)
router.get("/:id", eventController.handleGetEventById)
router.post("/", validateEvent, eventController.handlePostEvent)

export default router