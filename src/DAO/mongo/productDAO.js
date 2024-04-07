import ProductModel from './models/product.js'

export default class productDAO {

    getProducts = async () => { return ProductModel.find() }

    findById = async _id => { return await ProductModel.findById(_id).lean().exec() }

    findByCode = async code => { return await ProductModel.exists({code: code}) }

    saveProduct = async product => { return await ProductModel.create(product) }

    update = async (id,data) => {
        await ProductModel.findByIdAndUpdate(
            { _id: id },
           {
            $set: {
              title: data.title.trim(),
              description: data.description.trim(),
              code: data.code.trim(),
              price: parseFloat(data.price),
              stock: !isNaN(parseInt(data.stock)) ? parseInt(data.stock) : 0,
              category: data.category.trim()
            }
          },
        { runValidators: true },
        {new: true},
            (err) => {
              if (err) {
                console.error(err)
                return false
              }
            }
          )
        return true
    }

    delete = async id => { return await ProductModel.deleteOne({ _id: id }) }

    stockDiscount = async (id,quantity) => {

     let product = await this.findById(id)
     if(product){
        let new_stock = product.stock - quantity
        await ProductModel.findByIdAndUpdate(
          { _id: id },
         {
          $set: {
            stock: new_stock,
          }
        },
      { runValidators: true },
      {new: true},
          (err) => {
            if (err) {
              console.error(err)
              return false
            }
          }
        )
      return true
    }
    return false
   }


   getComments = async id => {
    return await ProductModel.findById(id, 'comments')
   }

   createComment = async (id,comment,username) => {
    return await ProductModel.findByIdAndUpdate(id, {
      $push: { comments: { text: comment, user: username } },
    },{new: true})

   }


}