import { Router } from "express"
import healthRoutes from "./health.routes.js"
import eventRoutes from "./events.routes.js"
const router = Router()

router.use("/health", healthRoutes)
router.use("/events", eventRoutes)

export default router