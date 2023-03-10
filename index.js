require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

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
        const swapMarketCollection = client.db('SWAP-MARKET').collection('products')

        

    } catch (error) {
        console.log(error);
    }
}

run()

app.listen(port, () => console.log(`SERVER RUNNING ON PORT ${port}`))