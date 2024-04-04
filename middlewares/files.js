
import multer from 'multer'
import __dirname from '../utils.js'

//upload.array("thumbnails")


    const imageStorage = multer.diskStorage({
        destination: (req, file, cb) => {
          console.log('destination : '+__dirname+'/public/images')
          cb(null, __dirname+'/public/images/')
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname)
        },
      })

      /*
      const uploadFiles = multer({
        storage : imageStorage,
        //limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
      }).array('thumbnails', 10)
      //.array('thumbnails', 10)
*/

      const whitelist = [
        'image/png',
        'image/jpeg',
        'image/jpg',
      ]


      export  const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                console.log('destination : '+__dirname+'/public/images')
                cb(null, __dirname+'/public/images/')
              },
          filename: (req, file, cb) => {
            const originalname = file.originalname.split(".");
            const name = originalname[0]
            const extension = originalname[1]
            cb(null, `${name}_${new Date().getDay()}.${extension}`)
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!whitelist.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
          }

          cb(null, true)
        }
      }).array('thumbnails', 5)


      /*
    export  function upload (res,req,next)  {
        uploadFiles(req, res, function (err) {
            if (err) {
              // An error occurred when uploading
              return
            }

            // Everything went fine
            console.log('ok next')
            next()
          })
      }
      */


      /* OLD */



      /*
      uploadImages = async(req,res,next) => {

  const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('destination : '+__dirname+'/public/images')
      cb(null, __dirname+'/public/images/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  })

  const up = multer({
    storage : imageStorage,
    //limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  }).array('thumbnails', 10)


  up(req, res, (err) => {
    console.log('trying to uploading images')

    if (err) {
        // A Multer error occurred when uploading.
       console.log(err)
       return res.status(201).json({status: true, message : 'product creation success but error uploading images'})
    } else {
      console.log('uploadimages passs.. verifyin body')

      //return res.status(200).json(result)

      const { title, description, code, price, stock, status, category , thumbnails } = req.body
      console.log('title 2 ?',title)
      console.log(thumbnails)
      return next()

    }
  })
}

/*
createProduct = async (req,res,next) => {

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('destination : '+__dirname+'/public/images')
    cb(null, __dirname+'/public/images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const uploadImages = multer({
  storage : imageStorage,
  //limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
}).array('thumbnails', 10)

let upload = multer().any()

        upload(req,res , async (err) => {
          console.log('into upload any')
          console.log(err)
          //console.log( req.body )

          const { title, description, code, price, stock, status, category , thumbnails } = req.body
          console.log(title)
          console.log(code)
          let data = {
            title : title ? title : null,
            description: description ? description : null,
            code: code ? code : null,
            price : price ? price : null,
            stock : stock ? stock : null,
            status : status ? Boolean(status) : null,
            category: category ? category : null,
            thumbnails : thumbnails ? thumbnails : null
          }
          console.log(data)

          try {
            const result = await productService.addProduct(data)
            //producto guardado exitosamente, procedo a cargar imagenes
            if(result.status == true){
            console.log('producto se guardo exitosamente')
            return next()

            }else{
              console.log('return error',result)
            return res.status(200).json(result)

            }

          }catch (error) {
            console.log(error)
            return res.status(200).json({status: false, message: error})
          }


        })


        console.log('----trying to uploading images---')
        uploadImages(req, res, (err) => {
          console.log('trying to uploading images')

          if (err) {
              // A Multer error occurred when uploading.
             console.log(err)
             return res.status(201).json({status: true, message : 'product creation success but error uploading images'})
          } else {
            console.log('uploadimages passs.. verifyin body')

            //return res.status(200).json(result)

            const { title, description, code, price, stock, status, category , thumbnails } = req.body
            console.log('title 2 ?',title)
            console.log(thumbnails)

          }
        })












       // return res.status(400).json({status: false, message: 'There was an error trying to create product'});

}
*/