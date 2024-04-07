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
    profile_name: {
        type: String,
        default: null,
        required: false
    },
    profile_address: {
        type: String,
        default: null,
        required: false
    },
    profile_phone: {
        type: String,
        default: null,
        required: false
    },
    profile_picture: {
        type: String,
        default: null,
        required: false
    },
    identification_file:{
        type:String,
        default: null,
        required: false
    },
    address_file:{
        type:String,
        default: null,
        required: false
    },
    status_account_file:{
        type:String,
        default: null,
        required: false
    },
    documents_status: {
        type: Boolean,
        default: false
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
    },
    last_connection : {
       type: Date,
       required: true,
       default: Date.now
    }
})

const User = mongoose.model('user', userSchema)

export default User
