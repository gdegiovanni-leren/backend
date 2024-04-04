import express from 'express'
import  { auth , authorization }  from '../middlewares/auth.js'
import MessageController from "../controllers/messageController.js"

const router = express.Router()


const messageController = new MessageController()
//TODO :  use sockets for handle comments (final version)
router.get("/asd", auth, messageController.getMessages)



export default router
