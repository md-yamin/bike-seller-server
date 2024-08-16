const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.brerg1p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {

        const bikesCollection = client.db("bikeSeller").collection("bikes");

        app.get("/bikes", async (req, res) => {
            const result = await bikesCollection.find().toArray()
            res.send(result)
        })

        app.get("/bikes/filtered", async (req, res) => {
            const { search, minPrice, maxPrice, brands, categories, sortValue } = req.query;
            const query = {};

            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            if (minPrice) {
                query.price = { ...query.price, $gte: parseFloat(minPrice) };
            }
            if (maxPrice) {
                query.price = { ...query.price, $lte: parseFloat(maxPrice) };
            }
            if (brands) {
                query.brand = { $in: brands };
            }
            if (categories) {
                query.category = { $in: categories };
            }

            let sortQuery = {};
            if (sortValue === 'Low to High') {
                sortQuery.price = 1;
            } else if (sortValue === 'High to Low') {
                sortQuery.price = -1;
            }
        
            const result = await bikesCollection.find(query).sort(sortQuery).toArray();
            res.send(result);
        })

    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running properly, no issues here')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})