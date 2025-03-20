// Defines the crop schema and related data methods
const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    plantDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['direct sow', 'transplant'],
        required: true
    },
    unitsPlanted: {
        type: Number,
        required: true
    },
    // images: [{
    //     url: {
    //         type: String,
    //    },
    //     growthStage: {
    //         type: String,
    //     }
    // }],
    growthStage: {
        type: String,
        default: 'Planting'
    },
    produceYield: {
        type: Number,
        required: true,
        default: 0
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: []
    }]
});

module.exports = mongoose.model('Crop', cropSchema);