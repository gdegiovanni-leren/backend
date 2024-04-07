
import crypto from 'crypto'
import { sendPurchaseEmail } from '../handlers/emailHandler.js'

class TicketService {

    constructor(dao){
      console.log('Ticket Service initialization')
      this.ticketDAO = dao
    }

    generateTicket = async (data,products_success,owner) => {
        try{
            let ticket = {
                code: crypto.randomBytes(20).toString('hex'),
                amount : parseFloat(data.total_amount),
                operation_status : data.transaction,
                status: 'Success',
                purcharser_id : owner._id.toString(),
                purchaser_username : owner.username,
            }
            await this.ticketDAO.create(ticket)

            sendPurchaseEmail(ticket,products_success,owner)

            return true

        }catch(e){
            console.error('Unknown error in Generate Ticket', e)
        }
    return false
    }


}

export default TicketService