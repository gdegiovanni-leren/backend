import config from '../config/config.js'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

class TicketService {

    constructor(dao){
      console.log('Ticket Service initialization')
      this.ticketDAO = dao
    }


    generateTicket = async (data) => {
        try{
            let ticket = {
                code: crypto.randomBytes(20).toString('hex'),
                amount : parseFloat(data.total_amount),
                operation_status : data.transaction,
                status: 'Success' ,
                purchaser : config.purchaser_email_test
            }
            await this.ticketDAO.create(ticket)

            this.sendEmail(data,config.purchaser_email_test)

            return true

        }catch(e){
            console.log('unknown error in TicketService',e)
        }
    return false
    }


    //TODO : GET OWNER OF CART TO SEND EMAIL
    sendEmail = async (data,email) => {
        console.log('@ SENDING PURCHASE EMAIL TO '+email+' @')

        try{
            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: config.nodemailer_user,
                    pass: config.nodemailer_pass
                }
            })
            let body_message = ''
            if(data.transaction == 'complete'){
                body_message = 'Below we show you the details of your purchase. If you have any questions, you can contact support at +3393939322 and we will provide you with immediate attention.'
            }else{
                body_message = 'Below are the details of your purchase. We regret that you were not able to purchase all the products, but we will notify you immediately that we have stock!. You can contact support at +3393939322 and we will provide you with immediate attention.'
            }
            //USE AWAIT ON THIS?
            await transport.sendMail({
                from: 'gergiovanni@gmail.com',
                to: email,
                subject: 'Your purchase details from MY SHOES MARKET',
                html: '<div>'+
                '<h2><strong>Thank you very much for your purchase at MY SHOES MARKET</strong></h2>'+
                '<p>'+body_message+'</p>'+
                '<p>TODO: DETAILS....</p>'+
                '<p> Total: <strong> $'+String(data.total_amount)+'</strong> </p></br></br>'+
                '<p>Thanks for trusting us!</p>'+
                '</div>',
            })
        }catch(e){
            console.log('Unknown error sending email to purchaser..',e)
        }

    }

}

export default TicketService