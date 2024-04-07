
import express from 'express'
import UserController from '../controllers/userController.js'

const router = express.Router()

export default router

const userController = new UserController()

router.post('/', userController.register)
