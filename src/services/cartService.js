import { productService, userService } from './indexService.js'
import { ticketService } from './indexService.js'


class CartService {

  constructor(dao){
    console.log('Cart Service initialization')
    this.cartDAO = dao
  }

    createCart = async () => {
        const cart = await this.cartDAO.create()
        return cart._id
    }

    getCart = async (cid) => {
      try {
          const cart = await this.cartDAO.findById(cid)
          if(cart) return { status: true , cart : cart }
      } catch (error) {
        console.log(error)
      }
      return { status: false,  message : 'The specified cart could not be found' }
    }


    addNewProduct = async (cid,pid,quantity,user) => {
        try{
            const p = await productService.getProductById(pid)
            //verify existing product
            if(!p) return { status: false ,  message : `Product not found with ID ${pid}`}

            //verify owner
            console.log('verify owner add product')
            console.log(p.owner)
            console.log(p.owner_id)
            console.log(user.id)
            if(p.owner == 'premium' && p.owner_id == user.id){
              console.log('owner premium & match id')
              return { status: false ,  message : `Ups, you cant purchase your own product`}
            }

            //verify quantity
            if(p.stock < quantity) return { status: false ,  message : `Insufficient stock.`}

            //verify cart
            let cart = await this.cartDAO.findById(cid)
            if(!cart) return { status: false ,  message : `Error adding product to cart. Cart not found.`}

            //verify product on cart
            const productOnCart = await cart.products.find(element => element.product._id == pid)

            if(productOnCart){
              productOnCart.quantity = ( parseInt(productOnCart.quantity) + parseInt(quantity) )
              await this.cartDAO.update(cid,cart)
            }else{
              cart.products.push({ product: pid, quantity: quantity })
              await this.cartDAO.update(cid,cart)
            }

          return { status: true ,  message : `Product successfully added!`}
        }catch(e){
            console.log(e)
        }
      return { status: false ,  message : `The product could not be added to the cart.`}
    }


    addQuantity = async (cid,pid,quantity) => {

        try{

            const p = await productService.getProductById(pid)
            if(!p) return { status: false ,  message : `Product not found with ID ${pid}`}
            if(p.stock < quantity) return { status: false ,  message : `Insufficient stock.`}

            let cart = await this.cartDAO.findById(cid)
            if(!cart) return { status: false ,  message : `Error when increasing quantity in cart. Cart not found.`}

            const productOnCart = await cart.products.find(element => element.product._id == pid)

            if(productOnCart){
                //If the quantity is negative to decrease the product, always check that the final quantity is not negative.
                if((quantity < 0 && (productOnCart.quantity + quantity) < 0) ){
                  console.error('overflow quantity error')
                  productOnCart.quantity = 0
                }else{
                  productOnCart.quantity = ( parseInt(productOnCart.quantity) + parseInt(quantity) )
                }

              const result = await this.cartDAO.update(cid,cart)
              return { status: true ,  message : `Product updated successfully!`}
            }else{
              return { status: true ,  message : `Product not found in cart` }
            }

        }catch(e){
            console.log(e)
        }
      return { status: false ,  message : `Error when increasing/decreasing quantity on cart.`}
    }



    updateCart = async (cid , products ) => {
        try{

            let cart = await this.cartDAO.findById(cid)

            if(!cart)  return { status: false ,  message : `The cart could not be updated. Cart with ${cid} not found`}

            cart.products = []
            for( let i = 0 ; i < products.length ; i++){

                if(products[i]._id && products[i].quantity ){

                  const p = await productService.getProductById(products[i]._id)
                  if(!p)  return { status: false ,  message : `The cart could not be updated. Product with ${products[i]._id} not found`}

                  cart.products.push({ product: products[i]._id, quantity: products[i].quantity })
                }else{
                  return { status: false ,  message : `The cart could not be updated.`}
                }
            }
          const result = await this.cartDAO.update(cid,cart)
          return { status: true ,  message : `Products successfully updated on cart`}

          }catch(e){
              console.error(e)
          }
     return { status: false ,  message : `The cart could not be updated.`}
    }



    updateStatusCart = async ( cid, payment_id,status) => {

      try{
        let cart = await this.cartDAO.findById(cid)

        if(!cart)  return { status: false ,  message : `The cart could not be updated. Cart with ${cid} not found`}

        cart.payment_status = true
        cart.payment_id = payment_id
        cart.status = status

       await this.cartDAO.update(cid,cart)
       return {status: true, message: 'OK' }

      }catch(e){
        console.log(e)
        return { status : false, message: 'Unknown error updating status payment cart '}
      }
    }



    deleteAllProducts = async (cid) => {
        try{
            let cart = await this.cartDAO.findById(cid)
            cart.products = []

            const result = await this.cartDAO.update(cid,cart)
            return { status: true ,  message : `Products successfully removed from cart`}

        }catch(e){
          console.log(e)
        }
      return { status: false ,  message : `The products could not be removed from cart`}
    }



    deleteProduct = async (cid,pid) => {

        try{
            const p = await productService.getProductById(pid)
            if(!p) return { status: false ,  message : `Product not found in cart with ID ${pid}`}

            let cart = await this.cartDAO.findById(cid)
            if(!cart) return { status: false ,  message : `The operation failed. Cart not found.`}

            const productOnCart = await cart.products.find(element => element.product._id == pid)

            if(productOnCart){
              cart.products = cart.products.filter(function(item) { return item.product._id != pid })
              const result = await this.cartDAO.update(cid,cart)

                return { status: true ,  message : `Product successfully removed!`}
            }else{
                return{ status: true ,  message : `The operation failed. Product not found in cart.`}
            }
        }catch(e){
            console.log(e)
        }
        return { status: false ,  message : `The product could not be removed from the cart.`}
    }



  updateCartPreferences = async (cid,cart) => {
      try{
        console.log('updating cart', cart)
        await this.cartDAO.update(cid,cart)
        return true
      }catch(e){
        console.log('exception update cart preferences',e)
        return false
      }
  }



    purchase = async (cid) => {
      try{

        let cart = await this.cartDAO.findById(cid)
        if(!cart || cart.products.length <= 0) return { status: false ,  message : `The operation failed. Cart not found or is empty.`}
        let owner = await userService.getUserById(cart.cart_owner)
        console.log('owner of cart found? ',owner)
        if(!owner) return { status: false ,  message : `The operation failed. Cart owner not found.`}

        //validate payment
        if(!cart.payment_status || cart.payment_status == false){
          console.log('cart payment stauts null or false')
          return {
            status: false ,
            message : `You need to payment to finish purchase`,
            pending_payment: true,
            transaction : 'unsuccess',
            total_amount : 0,
            products_success: null,
            products_error: null
          }
        }

        let total_amount = 0
        let products_purchase =  Array()
        let products_error = Array()

        for await (let element of cart.products) {
          //product validation
          let p = await productService.getProductById(element.product._id)
          if(p){
            let pid = p._id.toString()
            //quantity validation
            console.log('p stock: '+p.stock+' vs element quantity '+element.quantity)
            if((p.stock - element.quantity) < 0 ){
              products_error.push({ _id : pid , quantity: element.quantity , price: p.price, title: p.title, message : 'Out of stock' })
            }else{
                products_purchase.push({ _id : pid, quantity: element.quantity , price: p.price, title: p.title,  message: 'Success' })
                //stock discount
                await productService.stockDiscount(pid,element.quantity)
                //delete product from cart
                const result = await this.deleteProduct(cid,pid)
                //amount accum
                total_amount += (p.price * element.quantity)
            }
            }else{
              products_error.push({ _id : pid , quantity: element.quantity , message: 'Product not found' })
            }
        }

        //last validation, in the case that none of the products have been able to be purchased (out of stock or other reason)
        if(products_purchase.length == 0){
          return {
            status: false ,
            message : `Oh! we sorry, none of your products are available at this time, don't worry, we will notify you when there is stock!. We refund your money`,
            pending_payment: false,
            transaction : 'unsuccess',
            total_amount : 0,
            products_success: products_purchase,
            products_error: products_error
          }
        }

        let operation = {
          status: true ,
          message : `OK`,
          pending_payment: false,
          transaction : products_error.length > 0 ? 'partial' : 'complete' ,
          total_amount : total_amount,
          products_success: products_purchase,
          products_error: products_error
        }

        //if everything turned out correctly, we create a ticket and send an email to customer in ticket Service
        const result = await ticketService.generateTicket(operation,products_purchase,owner)

        return operation

      }catch(e){
        console.log(e)
      }

      return { status: false , message : `The operation failed.` }
    }


}

export default CartService