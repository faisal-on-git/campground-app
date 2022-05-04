const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
   // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '625044f28b6743d423a3a8b1',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
        
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dbolvhlch/image/upload/v1651550172/YelpCamp/qebt5bgjzhikyz2ipsiw.jpg',
                  filename: 'YelpCamp/qebt5bgjzhikyz2ipsiw',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dbolvhlch/image/upload/v1651550172/YelpCamp/fngp303ypnx0tuftocq5.jpg',
                  filename: 'YelpCamp/fngp303ypnx0tuftocq5',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dbolvhlch/image/upload/v1651550173/YelpCamp/aaat4r5prdugsimwn6dh.gif',
                  filename: 'YelpCamp/aaat4r5prdugsimwn6dh',
                
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

