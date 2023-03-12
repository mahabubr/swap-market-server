require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// middle were
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

app.get('/', (req, res) => {
    res.send("Swap Market Server is Running")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vlhy1ml.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCollection = client.db('SWAP-MARKET').collection('products')
        const deleteCollection = client.db('SWAP-MARKET').collection('deleted-items')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' })
            res.send({ token })
        })

        app.post('/product', async (req, res) => {
            const product = req.body
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.get('/product', verifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized access' })
            }

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

        app.get('/product/:id', verifyJWT, async (req, res) => {
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

        app.post('/deleted-items', async (req, res) => {
            const query = req.body
            const result = await deleteCollection.insertOne(query)
            res.send(result)
        })
        app.get('/deleted-items', async (req, res) => {
            const query = {}
            const result = await deleteCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/deleted-items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const service = await deleteCollection.findOne(query)
            res.send(service)
        })

        app.delete('/deleted-items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await deleteCollection.deleteOne(query)
            res.send(result)
        })

    } catch (error) {
        console.log(error);
    }
}

run()

app.listen(port, () => console.log(`SERVER RUNNING ON PORT ${port}`))