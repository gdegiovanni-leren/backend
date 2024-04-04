import TicketModel from './models/ticket.js'

export default class ticketDAO {

    create = async ticket => { return await TicketModel.create(ticket) }

}