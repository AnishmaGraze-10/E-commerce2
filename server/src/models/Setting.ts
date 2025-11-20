import mongoose, { Schema, Document } from 'mongoose'

export interface ISetting extends Document {
  theme: { mode: 'light'|'dark'|'system'; accentColor?: string; layout: 'compact'|'spacious'; baseFontPx?: number }
  notifications: { emailNewOrder: boolean; emailLowStock: boolean; userActivity: boolean; pushEnabled: boolean; digestFrequency: 'daily'|'weekly'|'monthly' }
  security: { twoFAEnabled: boolean; maintenanceMode: boolean; allowedIPs: string[] }
  payment: { currency: string; stripeKey?: string; paypalKey?: string; razorpayKey?: string; mode: 'test'|'live'; taxRate?: number; gstNumber?: string }
  locale: { timezone: string; language: string; dateFormat: string }
  shipping?: { defaultCarrier?: string }
}

const SettingSchema = new Schema<ISetting>({
  theme: {
    mode: { type: String, enum: ['light','dark','system'], default: 'system' },
    accentColor: { type: String, default: '#0ea5e9' },
    layout: { type: String, enum: ['compact','spacious'], default: 'compact' },
    baseFontPx: { type: Number, default: 16 }
  },
  notifications: {
    emailNewOrder: { type: Boolean, default: true },
    emailLowStock: { type: Boolean, default: true },
    userActivity: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: false },
    digestFrequency: { type: String, enum: ['daily','weekly','monthly'], default: 'weekly' }
  },
  security: {
    twoFAEnabled: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    allowedIPs: { type: [String], default: [] }
  },
  payment: {
    currency: { type: String, default: 'INR' },
    stripeKey: String,
    paypalKey: String,
    razorpayKey: String,
    mode: { type: String, enum: ['test','live'], default: 'test' },
    taxRate: { type: Number, default: 0 },
    gstNumber: String
  },
  locale: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' }
  },
  shipping: {
    defaultCarrier: { type: String, default: '' }
  }
}, { timestamps: true })

export default mongoose.model<ISetting>('Setting', SettingSchema)

