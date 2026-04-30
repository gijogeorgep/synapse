import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: "Synapse Edu Hub"
    },
    contactEmail: {
        type: String,
        default: "synapseeduhub@gmail.com"
    },
    contactPhone: {
        type: String,
        default: "+91 81579 30567"
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    showBanners: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

export default GlobalSettings;
