// lib/prismaAdmin.ts
import { PrismaClient } from '../generated/prisma'

// Use direct connection (not pooled) for admin operations
const DATABASE_URL = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

export const prismaAdmin = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})
