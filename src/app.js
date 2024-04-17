
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import __dirname from './utils.js'
import loginRouter from './routes/loginRouter.js'
import usersRouter from './routes/userRouter.js'
import registerRouter from './routes/registerRouter.js'
import productsRouter from './routes/productsRouter.js'
import { addComment , getComments } from './handlers/socketHandler.js'
import cartsRouter from './routes/cartsRouter.js'
import config from './config/config.js'
import swaggerJSDoc from 'swagger-jsdoc'
import SwaggerUiExpress from 'swagger-ui-express'
import { Server } from 'socket.io'

const corsOrigin ={
  origin: [ 'https://frontend-production-b6db.up.railway.app/' ,'https://frontend-production-b6db.up.railway.app' ],
  credentials: true,
  optionSuccessStatus:200
}
dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors(corsOrigin))

app.use('/login', loginRouter)
app.use('/register', registerRouter)

app.use('/api/products', productsRouter )
app.use('/api/carts', cartsRouter )
app.use('/api/users', usersRouter )


app.use('/assets',express.static(__dirname + '/public' ))

app.get('/health', (req,res) => {
  console.log('health get ok')
  console.log(req.body)
  res.status(200).send('OK')
})

app.post('/health', (req,res) => {
  console.log('health post ok')
  console.log(req.body)
  res.status(200).send('OK')
})

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación PF My Shoes Market',
      description: 'Documentación PF My Shoes Market'
    }
  },
  apis: [`./docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOptions)
app.use('/apidocs',SwaggerUiExpress.serve,SwaggerUiExpress.setup(specs))


const httpServer = app.listen(config.port, () => console.log('Listening on port '+config.port))


/*SOCKETS */

const socketServer = new Server(httpServer, {
  cors: {
    origin: [ 'https://frontend-production-b6db.up.railway.app/' ,'https://frontend-production-b6db.up.railway.app' ],
    credentials: false
  }
});

socketServer.on('connect', async socket => {

  console.log('Client connected')

    socket.on('add_comment', async comment => {
        const result = await addComment(comment)
        if(result){
          const comments = await getComments(comment.product_id)
          socketServer.emit('incoming_messages', comments)
        }else{
          console.error('Error emmiting message...')
        }
    })
  })
