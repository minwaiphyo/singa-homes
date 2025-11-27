// scripts/resetProperties.ts
import { PrismaClient } from '../generated/prisma'

// Use direct connection that bypasses RLS
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})

async function resetProperties() {
  try {
    console.log('🗑️  Deleting all properties...');
    
    // This will now bypass RLS
    const result = await prisma.property.deleteMany({})
    
    console.log(`✅ Successfully deleted ${result.count} properties`)
  } catch (error: any) {
    console.error('❌ Error resetting properties:', error.message)
    
    if (error.code === 'P2021') {
      console.log('💡 Table does not exist. Run: npx prisma migrate dev')
    } else if (error.message?.includes('permission denied')) {
      console.log('💡 RLS is blocking access. Make sure DIRECT_DATABASE_URL is set correctly.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

resetProperties()