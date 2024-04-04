import mongoose from 'mongoose'


const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    confirmPassword:{
        type: String,

    },
    role:{
        type: String
    },
    recovery_code: {
        type:String,
        default:null,
        required:false
    },
    recovery_expires_at: {
        type: Date,
        default: null,
        required: false
     },
    recovery_sended: {
        type: Boolean,
        default: false,
        required: false
    },
    recovery_token : {
        type: String,
        default: null,
        required:false
    }
})

const User = mongoose.model('user', userSchema)

export default User
