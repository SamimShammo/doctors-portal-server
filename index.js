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
        console.log('database collection successfully');
        const database = client.db("doctors_portal");
        const appointmentsCollection = database.collection("appointment");
        const usersCollection = database.collection("users");


        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();

            const query = { email: email, date: date }
            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments)
        })
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment)
            console.log(appointment)
            res.json(result)
        })

        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
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