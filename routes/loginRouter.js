
import express from 'express'
import UserController from '../controllers/userController.js'
import  { auth , authorization }  from '../middlewares/auth.js'

const router = express.Router()

export default router

const userController = new UserController()

router.post('/', userController.login)

router.post('/password_recovery', userController.passwordRecovery)
router.post('/recovery_request', userController.recoveryRequest)
router.post('/update_password', userController.updatePassword)
