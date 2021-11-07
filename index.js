const express = require('express')
const app = express()
require('dotenv').config()
const { MongoClient } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



// -----------------------//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvlwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// -----------------------//


//-------------------------//
async function run() {
    try {
        await client.connect();
        console.log('database collection successfully')
        const database = client.db("doctors_portal");
        const appointmentsCollection = database.collection("appointment");

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment)
            console.log(appointment)
            res.send(result)
        })
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments)
        })






    }
    finally {
        //   await client.close();
    }
}
run().catch(console.dir);
//-------------------------//

/*
app.get('/users')
app.post('/users')
app.get('/users/:id')
app.put('/users/:id')
app.delete('/users/:id')
*/















app.get('/', (req, res) => {
    res.send('Hello Doctors portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})