import { cartService } from '../services/indexService.js'
import { MercadoPagoConfig , Preference } from 'mercadopago';

class CartController {

constructor(){}


createPreference = async( req , res ) => {

// Add Your credentials
const client = new MercadoPagoConfig({ accessToken: 'TEST-2560306983812053-042718-778c75b9047a1615c853929a0f1b1798-249531119' });
const preference = new Preference(client);

preference.create({
    body: {
      items: [
        {
          title: 'My product',
          quantity: 1,
          unit_price: 2000
        }
      ],
    }
  })
  .then( result => {
    console.log(result)
    return res.status(200).json({message: result})
  })
  .catch( error => {
    console.log(error);
    return res.status(200).json({message: 'fail'})
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