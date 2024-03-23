import { Router } from 'express'
import { handleError, uploadImage } from '../config/multer.js'
import { createUser, deleteUser, getUser, getUserImageProfile, getUsers, updateUser } from '../controllers/users.controller.js'

const router = Router()
router.get('/users/image/:filename', getUserImageProfile)

router.get('/users', getUsers)

router.get('/users/:id', getUser)

router.post('/users', uploadImage.single('profilePicture'), handleError, createUser)

router.patch('/users/:id', uploadImage.single('profilePicture'), handleError, updateUser)

router.delete('/users/:id', deleteUser)

export default router
