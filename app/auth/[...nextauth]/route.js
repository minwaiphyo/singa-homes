import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "../../../generated/prisma"

//Note that [..nextauth] handles login/logout/session management by default


//Instantiating generated prisma client
const prisma = new PrismaClient()


const authOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",

            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                //Add logic to look up the user from the credentials supplied
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.username
                    }
                })

                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    console.log('user found:', user)
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error or with a URL:
                }
            }
        })
    ]
    
}

const handler = NextAuth(authOptions)


export { handler as GET, handler as POST }