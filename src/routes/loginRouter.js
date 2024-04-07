
import express from 'express'
import UserController from '../controllers/userController.js'

const router = express.Router()

export default router

const userController = new UserController()

router.post('/', userController.login)
router.post('/logout', userController.logout)

router.post('/password_recovery', userController.passwordRecovery)
router.post('/recovery_request', userController.recoveryRequest)
router.post('/update_password', userController.updatePassword)
