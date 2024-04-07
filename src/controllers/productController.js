

import { productService } from '../services/indexService.js'
import multer from 'multer'
import __dirname from '../utils.js'

class ProductController {

constructor(){}

getProducts = async (req, res) => {

    console.log('get products call')

    const limit = parseInt(req.query?.limit ?? 10)
    const queryFilter = req.query?.query ?? null
    const category = req.query?.category ?? null
    const price = req.query?.price ?? null
    const availability = req.query?.availability ?? null
    const page = req.query.page ? req.query.page : 1

    const result = await productService.getProducts(limit,queryFilter,category,price,availability,page)

     res.status(200).json(result)
}


getProductById = async( req, res ) => {

 try{
  const { id } = req.params
  const product = await productService.getProductById(id)
  if(product) return res.status(200).json(product)
 }catch(e){
    console.log('error finding product')
 }
 return res.status(404).json({ error: "Product not found" })

}



createProduct = async(req,res,next) => {

 // console.log(req.body)
  console.log(req.files)

  const { title, description, code, price, stock, status, category  } = req.body
  let data = { title, description, code, price, stock, status, category }


  const user = await req.user
  console.log(user)
  console.log(data)
  try {
    //process the product data, thumbnails url and user role for product role owner
    const result = await productService.addProduct(data,req.files,user.username)
    if(result.status == true){
    console.log('producto se guardo exitosamente')
    return res.status(200).json(result)
    }else{
      console.log('return error',result)
    return res.status(200).json(result)

    }

  }catch (error) {
    console.log(error)
    return res.status(200).json({status: false, message: error})
  }

}


updateProduct = async (req ,res) => {

    const { pid } = req.params
    const data = req.body
    const user = await req.user

    console.log(user.id)

    if(!pid) return res.status(200).json({status: false, message: 'Product id not found ('+pid+') for update'})
      try{
         const result = await productService.updateProduct(pid,data,user)
         result.status ?
           res.status(200).json(result) :
           res.status(405).json(result)
      }catch(e){
        console.log(e)
        return res.status(500).json({status: false, message: 'Error updating product with id ('+pid+') '})
      }

    }


  deleteProduct = async( req, res) => {

    const { id } = req.params
    const user = await req.user

    if(!id) return res.status(404).json({ status: false, message: "Product ID not found" })

    try{
        const result = await productService.deleteProduct(id,user)
        result.status ?
               res.status(200).json(result) :
               res.status(405).json(result)
    }catch(e){
    console.log(e)
    return res.status(500).json({status: false, message: 'Error deleting product with id ('+id+') '})
    }

  }


   getComments = async (req, res) => {
    const {id} = req.params
    try{
      const comments = await productService.getComments(id)
      //console.log('comments found? ',comments)
      if(!comments){
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(comments)
    }catch(error){
    console.log(error);
    }

   }

   addNewComment = async (req ,res) => {
    const { id } = req.params;
     const {comment, username} = req.body
      try {
        const updatedProduct = await productService.addNewComment(id,comment,username)
        if (!updatedProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json("Comment Added!")
      } catch (error) {
        console.log(error);
        res.status(404).json({ error: "error adding comment" });
      }

   }

}


export default ProductController