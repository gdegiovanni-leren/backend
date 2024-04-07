
import mongoose from 'mongoose'


const cartSchema = mongoose.Schema({
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: {
                    type: Number,
                    default : 0
                }
            },

        ],

        default: []
    },
    cart_owner: {
        type: String,
        required: false,
        default: ''
    },
    preference_setup: {
        type: Boolean,
        required: false,
        default: false
    },
    preference_id: {
        type: String,
        required: false,
        default: ''
    },
    payment_status:{
        type: Boolean,
        required: false,
        default: false
    },
    payment_id:{
        type: String,
        required: false,
        default: ''
    },
    status: {
        type:String,
        required: false,
        default: 'pending'
    }
}, { minimize: false })


cartSchema.pre('findOne', function() {
    this.populate('products.product')
})


const cartModel = mongoose.model('carts', cartSchema)

export default cartModel
