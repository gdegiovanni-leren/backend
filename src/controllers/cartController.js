import { cartService, userService } from '../services/indexService.js'
import { MercadoPagoConfig , Preference } from 'mercadopago';
import config from '../config/config.js';

class CartController {

constructor(){}

paymentNotification = async( req, res ) => {
  console.log('@@@@@ webhook received @@@@@@')
  console.log(req)
  console.log(req.body)
  console.log(req.data)
  return res.status(200).json({messsage: 'OK'})
}



createPreference = async( req , res ) => {

const { cid } = req.params
const { username } = await req.user
console.log('creating preference for cid ',cid)

const user = await userService.getUserByUsername(username)
const cart = await cartService.getCart(cid)

if(!cart || cart.status == false ) return res.status(404).json({ status: false, message: 'Cannot create preference, cart not found'})

console.log('user found?', user)
console.log('cart found?', cart)

// Add Your credentials
const client = new MercadoPagoConfig({ accessToken: 'TEST-2560306983812053-042718-778c75b9047a1615c853929a0f1b1798-249531119' });
const preference = new Preference(client);

console.log('notification calback to ')
console.log(`${config.base_url}api/carts/payment_notification`)
//notification_url: `${config.base_url}api/carts/payment_notification`,
//notification_url = https://backend-production-2f21.up.railway.app/api/carts/payment_notification


preference.create({
    body: {
      items: [
        {
          title: 'My product 1',
          quantity: 1,
          unit_price: 2000
        },
        {
          title: 'My product 2',
          quantity: 1,
          unit_price: 2000
        }
      ],
      payer: {
        name: user.profile_name ? user.profile_name : user.username,
        email: user.username,
        phone: {
            area_code: '',
            number: user.profile_phone ??  0
        },
        identification: {
            type: 'DNI',
            number: ''
        },
        address: {}
      },
      external_reference: cid,
      notification_url : `https://backend-production-2f21.up.railway.app/api/carts/payment_notification`,
      statement_descriptor: 'Pago de orden usuario '+user.username
    }
  })
  .then( async result => {
    console.log('result id ?',result.id)
    if(result.id){
      cart.preference_id = result.id
      cart.preference_setup = true
      const updatecart = await cartService.updateCartPreferences(cid,cart)
      if(updatecart == true){
        return res.status(200).json({ status:  true, preference_id : result.id, message: 'Cart preferences updated'})
      }else{
        return res.status(500).json({ status:  false, message: 'Error updating cart preferences'})
      }
    }

  })
  .catch( error => {
    console.log(error);
    return res.status(200).json({status: false, message: 'fail'})
  })
}


createCart = async (req, res) => {
    const cart_id = await cartService.createCart()
    if(cart_id){
     res.status(200).json(cart_id)
    }else{
     res.status(200).json({ status: false, error: 'There was an error creating a new cart' })
    }
}


//get cart with populate products
getCart = async (req, res) => {
    const { cid } = req.params
    const cart = await cartService.getCart(cid)
    res.status(200).json(cart)
}


addNewProduct = async (req , res ) => {
        const {cid , pid} = req.params
        let  quantity = req.body?.quantity ?? 1
        const user = await req.user

        if(cid && pid && user){
            const result = await cartService.addNewProduct(cid,pid,quantity,user)
            return res.json(result)
        }
    return res.json({ status: false ,  message : `The product could not be added to the cart.`})
}


addQuantity = async (req, res) => {
        const {cid , pid} = req.params
        const  quantity  = req.body?.quantity ?? 1

        if(cid && pid && !isNaN(parseInt(quantity))){
            const result = await cartService.addQuantity(cid,pid,quantity)
            return res.json(result)
        }
    return res.json({ status: false ,  message : `The product could not be updated.`})
}


updateCart = async ( req , res ) => {
        const {cid } = req.params
        const  products  = req.body

        if(cid && Array.isArray(products)){
          const result = await cartService.updateCart(cid,products)
          return res.json(result)
        }
    return res.json({ status: false ,  message : `The cart could not be updated.`})
}



//delete all products in cart
deleteAllProducts = async (req , res) => {
    const { cid } = req.params

    if(cid){
      const result = await cartService.deleteAllProducts(cid)
      return res.status(200).json(result)
    }
  return res.json({ status: false ,  message : `The products could not be removed from the cart.`})
}



//delete specific product in cart
deleteProduct = async( req, res) => {
    const {cid , pid} = req.params

    if(cid && pid){
        const result = await cartService.deleteProduct(cid,pid)
        return res.status(200).json(result)
    }
  return res.json({ status: false , message : `Could not remove product from cart.`})
}



purchase = async (req , res ) => {
    const { cid } = req.params

    if(cid){
    const result = await cartService.purchase(cid)
        if(result.status == true || result.transaction == 'unsuccess'){
            // We return 200 in case the operation is complete, partial,
            // or unsatisfactory (due to lack of stock) to handle from the front,
            // but we return another type of error if the operation fails for another unknown cause
            return res.status(200).json(result)
        }else{
            return res.status(404).json(result)
        }
    }
    return res.status(404).json('Cart id not found')
}


}

export default CartController