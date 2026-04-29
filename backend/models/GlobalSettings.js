import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema({
    showBanners: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

export default GlobalSettings;
