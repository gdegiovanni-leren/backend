
import express from 'express'

import CartController from '../controllers/cartController.js'
import  { auth , authorization }  from '../middlewares/auth.js'

const router = express.Router()

export default router

const cartController = new CartController()

router.get('/', auth, authorization(['user','premium']), cartController.createCart )
router.get("/:cid", auth, authorization(['user','premium']), cartController.getCart )
router.post("/:cid/products/:pid", auth, authorization(['user','premium']), cartController.addNewProduct )
router.put("/:cid/products/:pid" , auth, authorization(['user','premium']), cartController.addQuantity )
router.put("/:cid", auth, authorization(['user','premium']), cartController.updateCart )
router.delete("/:cid", auth, authorization(['user','premium']), cartController.deleteAllProducts )
router.delete("/:cid/products/:pid", auth, authorization(['user','premium']), cartController.deleteProduct )

router.post("/:cid/purchase", auth, authorization(['user','premium']), cartController.purchase )

//MercadoPago Payment
router.post("/:cid/create_preference", auth, authorization(['user','premium']), cartController.createPreference )
//Webhook MercadoPago
router.post("/payment_notification" , cartController.paymentNotification )