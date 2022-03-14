import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 4000;

const prisma = new PrismaClient({ log: ['error', 'query', 'info', 'warn'] })

function generateAmountOfMoney() {
    return Math.floor(Math.random() * 200) + 1
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
        res.status(200).send(user)
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
            res.send(user)
        } else {
            throw Error('Password not found')
        }

    }
    catch (err) {
        res.status(400).send({ error: 'User/password invalid' })
    }

})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})