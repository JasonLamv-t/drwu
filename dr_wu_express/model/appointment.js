const mongoose = require('mongoose')

let AppointmentSchema = mongoose.Schema({
  client: {
    name: String,
    account_id: String,
    avatar: String
  },
  doctor: {
    name: String,
    account_id: String,
    avatar: String
  },
  status: {
    type: String,
    enum: ['confirming', 'refused', 'confirmed', 'end'],
    default: 'confirming'
  },
  phone: String,
  comment: {
    stars: { type: Number, enum: [-1, 0, 1, 2, 3, 4, 5], default: -1 },
    text: { type: String, default: '' }
  },
  startTime: Date,
  endTime: Date
}, { timestamps: true })

let Appointment = mongoose.model('Appointment', AppointmentSchema)

module.exports = Appointment