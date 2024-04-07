import { cartService, userService } from '../services/indexService.js'
import { MercadoPagoConfig , Preference, MerchantOrder , Payment  } from 'mercadopago';
import config from '../config/config.js';

class CartController {

constructor(){}

/*
const client = new MercadoPago({ accessToken: 'ACCESS_TOKEN' });
const customerClient = new MerchantOrder(client);

customerClient.get({ merchantOrderId: '<MERCHANT_ORDER_ID>' }).then(console.log).catch(console.log);
*/

paymentNotification = async( req, res ) => {
  console.log('@@@@@ webhook received @@@@@@')

  let id = req.query.id;
  let topic = req.query.topic;
  console.log('data request: '+id+' '+topic);
  if(topic == 'merchant_order'){
    console.log(' @ TOPIC MERCHANT ORDER')
  }else{
    console.log(' @ TOPIC PAYMENT')

      let body = await req.body
      console.log('body data',body.data)

      let notification_id = body.id ?? null;
      let action = body.action ?? null;
      let type = body.type ?? null;
      let date_created = body.date_created ?? null;
      let payment_id = body.data.id ?? null;

    let mp_payment = {
      notification_id : notification_id,
      status : action,
      payment_type : type,
      date_created : date_created,
      payment_id : payment_id
    }
    console.log(mp_payment)

    try{
      const mercadopago = new MercadoPagoConfig({ accessToken: 'TEST-2560306983812053-042718-778c75b9047a1615c853929a0f1b1798-249531119' });
      const payment_instance = new Payment(mercadopago)
      console.log('PAYMENT  ID TO SET',payment_id)
      await payment_instance.get({ id: payment_id }).then( async (payment) => {
        console.log(payment)
        const payment_method = payment.payment_method
        const payment_method_id = payment.payment_method_id
        const payment_type_id = payment.payment_type_id
        const status = payment.status
        const status_detail = payment.status_detail
        const transaction_amount = payment.transaction_amount
        //THE CART ID
        const cid = payment.external_reference

        console.log(payment_method,payment_method_id,payment_type_id,status,status_detail,transaction_amount,cid)

        if(status == 'approved'){
          console.log('STATUS APPROVED!!!')
          const result = await cartService.updateStatusCart(cid,payment_id,status)
          console.log('status result update cart? ',result)
        }else{
          console.log('status not approved')
        }


     }).catch( (e) => {
      console.log(e)
    });

    }catch(e){
      console.log(e)
    }

  }


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