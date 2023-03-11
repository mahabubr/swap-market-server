require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middle were
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Swap Market Server is Running")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vlhy1ml.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCollection = client.db('SWAP-MARKET').collection('products')

        app.post('/product', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.get('/product', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let query = {}
            // if (req.query.email) {
            //     query = {
            //         email: req.query.email
            //     }
            // }
            const products = await productCollection.find(query).skip(page * size).limit(size).toArray();
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count, products });
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const service = await productCollection.findOne(query)
            res.send(service)
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const data = req.body
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    img: data.img,
                    name: data.name,
                    price: data.price
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

    } catch (error) {
        console.log(error);
    }
}

run()

app.listen(port, () => console.log(`SERVER RUNNING ON PORT ${port}`))