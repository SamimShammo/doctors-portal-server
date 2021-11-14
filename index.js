const express = require('express')
const app = express()
require('dotenv').config()

const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// 


const serviceAccount = require("./doctors-portal-firebase-sdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// -----------------------//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvlwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// -----------------------//

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith("Bearer ")) {
        const token = req.headers.authorization.split(' ')[1];
    }
    try {
        const decodedUser = await admin.auth().verifyIdToken(token);
        req.decodedEmail = decodedUser.email;

    }
    catch {

    }
    next();
}
//-------------------------//
async function run() {
    try {
        await client.connect();
        console.log('database collection successfully');
        const database = client.db("doctors_portal");
        const appointmentsCollection = database.collection("appointment");
        const usersCollection = database.collection("users");


        app.get('/appointments', verifyToken, async (req, res) => {
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

        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester })
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email }
                    const updateDoc = { $set: { role: 'admin' } }
                    const result = await usersCollection.updateOne(filter, updateDoc)
                    res.json(result)
                }
            }
            else {
                res.status(401).json({ message: 'You do have access to make Admin' })
            }

        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === "admin") {
                isAdmin = true
            };
            res.json({ admin: isAdmin });
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