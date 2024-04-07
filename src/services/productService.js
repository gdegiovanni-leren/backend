
import ProductModel from '../DAO/mongo/models/product.js'
import { validateFieldsForCreate, validateFieldsForUpdate } from '../validators/productValidator.js'
import config from '../config/config.js'
import productDTO from '../DTO/productDTO.js'
import { userService } from './indexService.js'
import { sendProductDeletedEmail } from '../handlers/emailHandler.js'

class ProductService {

    constructor(dao){
      console.log('Product Service initialization')
      this.productDAO = dao
    }

    getProductById = async(_id) => {
        try{
            const product = await this.productDAO.findById(_id)
            return product
        }catch(e){
            //console.log(e)
            console.log('error!')
        }
        return null
    }

  getProducts = async(limit,queryFilter,category,price,availability,page) => {

    try{
        if(isNaN(parseInt(page)) || parseInt(page) <= 0 ){
            return { status: false, payload : [] , error: 'Error. Invalid page' }
        }
        console.log('PAGE: '+page+' | LIMIT: '+limit)

        let options = {
            page,
            limit,
            lean: true,
        }

        let query = {}

          if(queryFilter){
            query["$or"] =  [
              { title: { '$regex': queryFilter, '$options': 'i' } },
              { description: { '$regex': queryFilter, '$options': 'i' } },
              { code: { '$regex': queryFilter, '$options': 'i' } }
             ]
          }

          if(category && category != 'All'){
            query["category"] = category
          }

          if(availability && availability != 'All'){
            if(availability === 'Stock'){
              query["stock"] = { $gt: 0  }
            }else{
              query["stock"] = { $lt: 1  }
            }
          }

          if(price && price != 'All'){

            switch (price){
              case 'Asc':
                console.log('priceasc: '+price)
                options.sort = { price: 1 }
              break;
              case 'Desc' :
                console.log('pricedesc: '+price)
                options.sort = { price: -1 }
              break;
              }
          }

        const result = await ProductModel.paginate(query, options)

        let prevLink = null
        let nextLink = null

        if(result.prevPage){

          prevLink = `${config.base_url}api/products?page=${result.prevPage}`
          if(queryFilter){
            prevLink = prevLink+`&query=${queryFilter}`
          }
          if(limit){
            prevLink = prevLink+`&limit=${limit}`
          }
          if(category && category != 'All'){
            prevLink = prevLink+`&category=${category}`
          }
          if(availability && availability != 'All'){
            prevLink = prevLink+`&availability=${availability}`
          }
          if(price && price != 'All'){
            prevLink = prevLink+`&price=${price}`
          }
        }

        if(result.nextPage){

          nextLink = `${config.base_url}api/products?page=${result.nextPage}`
          if(queryFilter){
            nextLink = nextLink+`&query=${queryFilter}`
          }
          if(limit){
            nextLink = nextLink+`&limit=${limit}`
          }
          if(category && category != 'All'){
            nextLink = nextLink+`&category=${category}`
          }
          if(availability && availability != 'All'){
            nextLink = nextLink+`&availability=${availability}`
          }
          if(price && price != 'All'){
            nextLink = nextLink+`&price=${price}`
          }
        }
        //filter sensible data
        for(let prod of result.docs){
          delete prod.owner
          delete prod.owner_id
        }
        result.payload = result.docs
        result.status = true
        delete result.docs

        result.prevLink = prevLink
        result.nextLink = nextLink
        return result

    } catch (error) {
      console.log(error)
      return { status: false, payload : [] , error: 'Products could not be obtained' }
    }

  }

    codeExists = async (code) => {
         const exists = await this.productDAO.findByCode(code)
         return exists ? true : false
    }


    productExists = async (id) => {

        const product = await this.productDAO.findById(id)

        return product ?
        { status: true ,  product : product , message : '' } :
        { status: false , product : null,  message : `Product not found with ID ${id}`}
    }



    stockDiscount = async (pid,quantity) => {
      try{
          return await this.productDAO.stockDiscount(pid,quantity)
      }catch(e){
        console.log(e)
      }
      return false
    }


    addProduct =  async (data,files,username) => {

        try{
            const user = await userService.getUserByUsername(username)
            console.log('add product user found? ',user)
            if(!user) return {status: false, message : `User not found` }

            const validator = validateFieldsForCreate(data)
            if(validator.status == false) return validator

            if(await this.codeExists(data.code)) return {status: false, message : `The product could not be added. The entered code already exists` }

            //process files
            let thumbnails_url = Array()
            for await (const file of files){
              console.log('file found')
              //const originalname = file.originalname.split(".");
             // const name = originalname[0]
              //const extension = originalname[1]
              //thumbnails_url.push(`${name}_${new Date().getDay()}.${extension}`)
              //thumbnails_url.push('assets/images/'+file.filename)
              console.log('base url: ',config.base_url)
              let url = `${config.base_url}assets/products/${file.filename}`
              const url_thumbnail = url.replace("=", "");

               console.log('thumnail push to destination:')
              console.log(url_thumbnail)
              thumbnails_url.push(url_thumbnail)

            }

            console.log(thumbnails_url)

            const product = new productDTO(data,thumbnails_url,user)
            const result = await this.productDAO.saveProduct(product)

            if(result){
                return {status : true , message : 'Product successfully added!'}
            }else{
                return {status : false , message : 'Product could not be created'}
            }

        }catch(e){
          console.log(e)
        }
      return {status : false , message : 'There was an error creating the product'}
    }


    updateProduct = async (id,data,user) => {

        try{
            //validate fields
            const validator = validateFieldsForUpdate(data)
            if(validator.status == false) return validator

            //validation code
            const codeExists = await this.productDAO.findByCode(data.code)
            if(codeExists &&  codeExists._id != id) return {status : false, message : 'The product code already exists' }

            //verify owner
            const product =  await this.getProductById(id)
            if(user.role == 'premium' && user.id != product.owner_id){
              console.log('update: user role premium ok y diff')
              return {status : false , message : 'You dont have permissons to update this product!'}
            }
            //update
            const result = await this.productDAO.update(id,data)
            if(result == true){
              return {status : true , message : 'Update done successfully!'}
            }else{
              return {status : false , message : 'here was an error in product update.'}
            }

        }catch(e){
            console.log(e)
        }
     return {status : false , message : 'There was an error in product update.'}
    }


  deleteProduct = async(id,user) => {
    try{
        //verify product
        let exists = await this.productExists(id)
        if(exists.status == false) return {status : false , message : 'No product found to remove'}

            //verify owner
            if(user.role == 'premium' && user.id != exists.product.owner_id){
              console.log('user role premium ok y diff')
              return {status : false , message : 'You dont have permissons to delete this product!'}
            }

            //verify if owner is premium
            console.log(exists.product.owner_id)
            if(exists.product.owner == 'premium' && exists.product.owner_id){
              console.log('exists product owner & id')
              const userPremium = await userService.getUserById(exists.product.owner_id)
              if(userPremium && userPremium.username){
                //send email
                console.log('sending email')
                sendProductDeletedEmail(userPremium.username,exists.product.title)
              }
            }
            //delete
            const result = await this.productDAO.delete(id)
            if(result){
                return {status : true , message : 'Product successfully removed!'}
            }else{
                return {status : false , message : 'No product found to remove'}
            }

    }catch(e){
      console.log(e)
    }
    return {status : false , message : 'Error: Product could not be deleted'}
   }


   getComments = async(id) => {
    try{
     return await this.productDAO.getComments(id)
    }catch(e){
      console.log(e)
    }
    return false
   }


   addNewComment = async (id,comment,username) => {
    try{
       await this.productDAO.createComment(id,comment,username)
      return true
    }catch(e){
      console.log(e)
    }

     return false
   }


}


export default ProductService