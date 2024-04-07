
import express from 'express'
import  { auth , authorization }  from '../middlewares/auth.js'
import   { upload }   from '../middlewares/files.js'
import ProductController from '../controllers/productController.js'


const router = express.Router()

const productController = new ProductController()

router.get('/',auth ,productController.getProducts)
router.get("/:id",auth, productController.getProductById)
router.post("/", auth , authorization(['admin','premium']), upload, productController.createProduct )
router.delete("/:id",auth, authorization(['admin','premium']), productController.deleteProduct)
router.put("/:pid", auth, authorization(['admin','premium']), productController.updateProduct)

//TODO :  use sockets for handle comments
router.get("/:id/comments",auth, productController.getComments)
router.post("/:id/comments",auth, authorization(['user','premium']), productController.addNewComment)


export default router
