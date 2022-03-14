import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['error', 'query', 'info', 'warn'] })
import bcryptjs from 'bcryptjs'

const users: Prisma.UserCreateInput[] = [
    {
        email: "arita@email.com",
        fullName: 'Arita',
        amountInAccount: 200,
        password: bcryptjs.hashSync('arita', 8),
        transactions: {
            create: [
                {
                    amount: 20,
                    currency: 'euro',
                    receiverOrSender: 'receiver',
                    completedAt: '03/03/2022',
                    isPositive: true
                },
                {
                    amount: 10,
                    currency: 'euro',
                    receiverOrSender: 'sender',
                    completedAt: '05/03/2022',
                    isPositive: true
                }
            ]
        }

    },
    {
        email: 'ed@email.com',
        fullName: 'Ed',
        amountInAccount: 300,
        password: bcryptjs.hashSync('ed', 8),
        transactions: {
            create: [
                {
                    amount: 30,
                    currency: 'pound',
                    receiverOrSender: 'receiver',
                    completedAt: '10/02/2022',
                    isPositive: true
                },
                {
                    amount: 50,
                    currency: 'pound',
                    receiverOrSender: 'receiver',
                    completedAt: '11/02/2022',
                    isPositive: true
                }
            ]
        }
    }
]

async function createStuff() {
    for (const user of users) {
        await prisma.user.create({ data: user })
    }
}

createStuff();