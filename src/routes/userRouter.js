
import express from 'express'
import UserController from '../controllers/userController.js'
import  { auth , authorization }  from '../middlewares/auth.js'
import   { uploadProfileImage , uploadDocuments }   from '../middlewares/files.js'

const router = express.Router()

export default router

const userController = new UserController()

//get the profile data of user
router.get('/profile', auth, authorization(['admin','user','premium']), userController.getProfileData )
//update only profile data and profile picture
router.post('/profile', auth, authorization(['admin','user','premium']), uploadProfileImage ,userController.updateProfileData )
//upload documents for user to become a premium member
router.post('/:uid/documents', auth, authorization(['user']), uploadDocuments ,userController.uploadDocuments )
//validate premium membrecy and update
router.post('/premium/:uid', auth, authorization(['user']), userController.updatePremiumMembrecy )
//return all users, only for admin
router.get('/', auth, authorization(['admin']), userController.getUsers)
//update user data (profile name & role) , only admin
router.put('/:uid', auth, authorization(['admin']), userController.updateUser)
//delete one user
router.delete('/:uid', auth, authorization(['admin']), userController.deleteUser)
//delete all users from the past 2 days
router.delete('/', auth, authorization(['admin']), userController.deleteAllUsers)