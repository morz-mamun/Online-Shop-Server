const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

//*** mongoDB code  ***//



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttjbmkn.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productCollection = client.db("TechnologyDB").collection("Products")
        const myCartCollection = client.db("TechnologyDB").collection("MyCarts")


        // add product related API 
        app.get('/products', async(req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/products/:brand_name', async(req, res) => {
            const brandName = req.params.brand_name
            const filter = {brand_name: brandName}
            const result = await productCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/products/:brand_name/:_id', async(req, res) => {
            const id = req.params._id
            const filter = {_id : new ObjectId(id)}
            const brandName = req.params.brand_name
            const filter1 = {brand_name: brandName}
            const result = await productCollection.findOne(filter, filter1)
            res.send(result)
        })

        app.put('/products/:brand_name/:_id', async(req, res) => {
            const id = req.params._id
            const filter = {_id : new ObjectId(id)}
            const brandName = req.params.brand_name
            const filter1 = {brand_name: brandName}
            const option = {upsert: true}
            const updatedProduct = req.body
            const product = {
                $set: {
                    image: updatedProduct.image,
                    name: updatedProduct.name,
                    brand_name: updatedProduct.brand_name, 
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    rating: updatedProduct.rating
                }
            }
            const result = await productCollection.updateOne(filter, product, option)
            res.send(result)
        })

        app.post('/products', async(req, res) => {
            const newProduct = req.body
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })

        
        // my cart related API
        app.get('/carts', async(req, res) => {
            const cursor = myCartCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/carts/:_id', async(req, res) => {
            const id = req.params._id
            console.log(id);
            const filter = {_id : id}
            const cursor = await myCartCollection.findOne(filter)
        
            res.send(cursor)
        })



        app.post('/carts', async(req, res) => {
            const newCart = req.body
            const result = await myCartCollection.insertOne(newCart)
            res.send(result)
        })

        
        app.delete('/carts/:_id', async(req, res) => {
            const id = req.params._id
            console.log(id);
            const filter = {_id : id}
            const result = await myCartCollection.deleteOne(filter)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Technology and Electronics Server site in running')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})