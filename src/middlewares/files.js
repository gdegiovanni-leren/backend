
import multer from 'multer'
import __dirname from '../utils.js'

  const whitelist_profile = [
        'image/png',
        'image/jpeg',
        'image/jpg',
  ]

   const whitelist_products = [
        'image/png',
        'image/jpeg',
        'image/jpg',
  ]

  const whitelist_documents = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf'
  ]


  export  const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                console.log('destination : '+__dirname+'/public/products')
                cb(null, __dirname+'/public/products/')
              },
          filename: (req, file, cb) => {
            const originalname = file.originalname.split(".");
            const name = originalname[0]
            const extension = originalname[1]
            cb(null, `${name}_${new Date().getFullYear()}_${new Date().getMinutes()}.${extension}`)
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!whitelist_products.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
          }

          cb(null, true)
        }
  }).array('thumbnails', 5)



  export  const uploadProfileImage = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                console.log('destination : '+__dirname+'/public/profiles')
                cb(null, __dirname+'/public/profiles/')
              },
          filename: (req, file, cb) => {
            const originalname = file.originalname.split(".");
            const name = originalname[0]
            const extension = originalname[1]
            cb(null, `${name}_${new Date().getFullYear()}_${new Date().getMinutes()}.${extension}`)
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!whitelist_profile.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
          }

          cb(null, true)
        }
  }).single('profile_picture')



  export  const uploadDocuments = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                console.log('destination : '+__dirname+'/public/documents')
                cb(null, __dirname+'/public/documents/')
              },
          filename: (req, file, cb) => {
            const originalname = file.originalname.split(".");
            const name = originalname[0]
            const extension = originalname[1]
            cb(null, `${name}_${new Date().getFullYear()}_${new Date().getMinutes()}.${extension}`)
          },
        }),
        fileFilter: (req, file, cb) => {
          console.log(file.mimetype)
          if (!whitelist_documents.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
          }

          cb(null, true)
        }
  }).fields(
        [
          {
            name: 'identification_file',
            maxCount: 1
          },
          {
            name: 'address_file',
            maxCount: 1
          },
          {
            name: 'status_account_file',
            maxCount: 1
          }
        ]
  );
