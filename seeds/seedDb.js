const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campgrounds')

mongoose.connect('mongodb://localhost:27017/yelps', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })
const sample = array => array[Math.floor(Math.random()*array.length)];
const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i=0; i<250; i++){
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '626a28235c450866d47fbd82',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry : { 
                type : "Point", 
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dpizrebuv/image/upload/v1651414981/myyelp/oqkv6nal97gd61xkbvml.jpg',
                  filename: 'myyelp/mc8s1ya1q8wbffmsgb3e',
                },
                {
                  url: 'https://res.cloudinary.com/dpizrebuv/image/upload/v1651233637/myyelp/prmbhxjqzz18enwzx7fw.png',
                  filename: 'myyelp/prmbhxjqzz18enwzx7fw',
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save()
        console.log(camp)
    }
}
seedDb().then(() => {
    mongoose.connection.close();
})

