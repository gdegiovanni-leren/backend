class SocketController {



    constructor(socket){
      this.socket = socket
    }

    getMessages = async (req, res) => {

        const socket = req.app.get('socket');
        console.log('socket found ?')
        console.log(socket)

        socket.emit('algo','mensaje enviado')

         console.log('calling get messages controller')
         res.status(200).json({message: 'OK'})
    }

}


    export default SocketController