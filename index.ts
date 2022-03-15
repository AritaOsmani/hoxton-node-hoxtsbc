import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 4000;

const prisma = new PrismaClient({ log: ['error', 'query', 'info', 'warn'] })

function generateAmountOfMoney() {
    return Math.floor(Math.random() * 200) + 1
}

function createToken(id: number) {
    //@ts-ignore
    return jwt.sign({ id }, process.env.MY_SECRET, { expiresIn: '60s' })
}

async function getUserFromToken(token: string) {
    //@ts-ignore
    const decodedData = jwt.verify(token, process.env.MY_SECRET)
    //@ts-ignore
    const user = await prisma.user.findUnique({ where: { id: decodedData.id } })
    return user;
}

app.post('/sign-up', async (req, res) => {
    const { email, fullName, password } = req.body
    try {
        const hash = bcryptjs.hashSync(password, 8)
        const user = await prisma.user.create(
            {
                data: {
                    email: email,
                    fullName: fullName,
                    amountInAccount: generateAmountOfMoney(),
                    password: hash
                },
                select: { email: true, fullName: true, amountInAccount: true }
            }
        )
        //@ts-ignore
        res.status(200).send({ user, token: createToken(user.id) })
    }
    catch (err) {
        //@ts-ignore
        res.send(`<pre>${err.message}</pre>`)
    }
})

app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await prisma.user.findUnique({ where: { email }, include: { transactions: true } })
        //@ts-ignore
        const passwordMatches = bcryptjs.compareSync(password, user.password)

        if (passwordMatches) {
            //@ts-ignore
            res.send({ user, token: createToken(user.id) })
        } else {
            throw Error('Password not found')
        }

    }
    catch (err) {
        res.status(400).send({ error: 'User/password invalid' })
    }

})

app.post('/validate', async (req, res) => {
    const { token } = req.body

    try {
        const user = await getUserFromToken(token)
        res.send(user)
    }
    catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.post('/banking-info', async (req, res) => {
    const { token } = req.body
    try {
        //@ts-ignore
        const decoded = jwt.verify(token, process.env.MY_SECRET)
        //@ts-ignore
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { transactions: true } })
        res.send(user)
    }
    catch (err) {
        //@ts-ignore
        res.send({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})