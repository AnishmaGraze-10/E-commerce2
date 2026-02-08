import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'

dotenv.config()

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cosme_kitchen'
  await mongoose.connect(uri)
  const result = await Product.deleteMany({})
  console.log(`Cleared products: ${result.deletedCount}`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})




