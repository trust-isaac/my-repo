const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary, 
    params:{
        folder:'myyelp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

module.exports = {
    cloudinary,
    storage
}

//A MODULE IS EXPORTED AS AN OBJECT AND ANYTHING THAT IS EXPORTED 
//FROM IT IS INSERTED INTO THAT OBJECT AS KEY-VALUE PAIR