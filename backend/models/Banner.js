import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
        trim: true
    },
    desktopImageUrl: {
        type: String,
        required: [true, 'Desktop image URL is required']
    },
    mobileImageUrl: {
        type: String,
        required: [true, 'Mobile image URL is required']
    },
    linkUrl: {
        type: String,
        default: '#'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
