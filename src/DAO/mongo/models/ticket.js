import mongoose from 'mongoose'

const ticketSchema = mongoose.Schema({

    code:{
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    operation_status: {
        type: String,
        required: true
    },
    status: {
        type: String,
        requred: true
    },
    purchaser: {
        type: String,
        required: true
    },

    purchase_datetime : {
        type: Date,
        required: true,
        default: Date.now
    }

})

const TicketModel = mongoose.model('tickets', ticketSchema)


export default TicketModel