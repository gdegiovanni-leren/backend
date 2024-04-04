import config from "../config/config.js";
import mongoose from "mongoose";

export let UserDAO
export let ProductDAO
export let CartDAO
export let TicketDAO

/* Se incluye el patrón factory funcional solo para conexion con Mongo,
se omitirá el uso de persistencia de file o memoria para esta entrega,
en caso de cambiar el tipo de persistencia a file por ejemplo, se
creara por defecto mongo */


console.log(`Trying to connect DB with config: ${config.persistence}`)

switch (config.persistence) {
    case "MONGO":

        mongoose.connect(config.mongoURL,{
         useNewUrlParser: true,
          useUnifiedTopology: true,
        }).then(console.log("Connected to database!"))
        .catch(err => console.log(err))

        const { default: UserMongo } = await import('./mongo/userDAO.js')
        const { default: ProductMongo } = await import('./mongo/productDAO.js')
        const { default: CartMongo } = await import('./mongo/cartDAO.js')
        const { default: TicketMongo } = await import('./mongo/ticketDAO.js')

        ProductDAO = ProductMongo
        CartDAO = CartMongo
        UserDAO = UserMongo
        TicketDAO = TicketMongo

        break;

    case "FILE":

    mongoose.connect(config.mongoURL,{
        useNewUrlParser: true,
         useUnifiedTopology: true,
       }).then(console.log("Connected to database!"))
       .catch(err => console.log(err))

       const { default: UserFile } = await import('./mongo/userDAO.js')
       const { default: ProductFile } = await import('./mongo/productDAO.js')
       const { default: CartFile } = await import('./mongo/cartDAO.js')
       const { default: TicketFile } = await import('./mongo/ticketDAO.js')

       ProductDAO = ProductFile
       CartDAO = CartFile
       UserDAO = UserFile
       TicketDAO = TicketFile

       break;

    default:
        throw new Error('Persistence not recognized')
}
