
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'


const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    user: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });


const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code:{
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    status :{
        type: Boolean,
        requred: true
    },
    stock: {
        type: Number,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    thumbnails: {
        type: Array,
        'default': []
    },
    owner: {
        type: String,
        required: true
    },
    owner_id: {
        type: String,
        required: true
    },

    comments: [commentSchema]

})

productSchema.plugin(mongoosePaginate)

const ProductModel = mongoose.model('products', productSchema)



export default ProductModel
