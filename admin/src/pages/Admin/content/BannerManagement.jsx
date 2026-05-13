import React, { useState, useEffect } from "react";
import { 
    Plus, 
    Trash2, 
    Link as LinkIcon, 
    Monitor, 
    Smartphone, 
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    Save,
    AlertCircle,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { 
    getAdminBanners, 
    createBanner, 
    updateBanner, 
    deleteBanner, 
    uploadImage,
    getSettings,
    updateSettings 
} from "../../../api/services";
import { toast } from "react-hot-toast";

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showBanners, setShowBanners] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    
    // Form state
    const [formData, setFormData] = useState({
        title: "",
        desktopImageUrl: "",
        mobileImageUrl: "",
        linkUrl: "#",
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchBanners();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setShowBanners(data.showBanners);
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await getAdminBanners();
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners:", error);
            toast.error("Failed to load banners.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const uploadData = new FormData();
            uploadData.append("image", file);
            
            const response = await uploadImage(uploadData);
            setFormData(prev => ({ ...prev, [type]: response.url }));
            toast.success(`${type} image uploaded!`);
        } catch (error) {
            toast.error("Image upload failed.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.desktopImageUrl || !formData.mobileImageUrl) {
            toast.error("Please provide both desktop and mobile images.");
            return;
        }

        try {
            setIsSaving(true);
            await createBanner(formData);
            toast.success("Banner created successfully!");
            setShowAddModal(false);
            setFormData({
                title: "",
                desktopImageUrl: "",
                mobileImageUrl: "",
                linkUrl: "#",
                isActive: true,
                order: 0
            });
            fetchBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create banner.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleGlobalBanner = async () => {
        try {
            setIsToggling(true);
            const newStatus = !showBanners;
            await updateSettings({ showBanners: newStatus });
            setShowBanners(newStatus);
            toast.success(`Banners are now ${newStatus ? 'enabled' : 'disabled'} on the website.`);
        } catch (error) {
            toast.error("Failed to update global setting.");
        } finally {
            setIsToggling(false);
        }
    };

    const handleToggleStatus = async (banner) => {
        try {
            await updateBanner(banner._id, { isActive: !banner.isActive });
            fetchBanners();
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            await deleteBanner(id);
            fetchBanners();
            toast.success("Banner deleted.");
        } catch (error) {
            toast.error("Failed to delete banner.");
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Banner Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage promotional posters for the homepage.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Master Toggle */}
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Master Toggle</span>
                        <button 
                            onClick={handleToggleGlobalBanner}
                            disabled={isToggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${showBanners ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} disabled:opacity-50`}
                        >
                            {showBanners ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            {showBanners ? "Banners ON" : "Banners OFF"}
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-100 hover:bg-cyan-700 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Banner</span>
                    </button>
                </div>
            </div>


            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Banners...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
                    <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No banners found</h3>
                    <p className="text-slate-400 mb-6">Start by adding a new promotional poster.</p>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Create First Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-4">
                                {/* Desktop Preview */}
                                <div className="lg:col-span-2 relative aspect-[4/1] bg-slate-50 border-r border-slate-50 overflow-hidden">
                                    <img src={banner.desktopImageUrl} alt="Desktop" className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center gap-2">
                                        <Monitor className="w-3 h-3" /> Desktop
                                    </div>
                                </div>
                                
                                {/* Mobile Preview & Info */}
                                <div className="lg:col-span-2 p-6 flex flex-col md:flex-row gap-6">
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 bg-slate-50 rounded-2xl overflow-hidden shadow-inner">
                                        <img src={banner.mobileImageUrl} alt="Mobile" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-white text-[8px] font-bold rounded-full flex items-center gap-1">
                                            <Smartphone className="w-2 h-2" /> Mobile
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800">{banner.title}</h3>
                                                <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                                                    <LinkIcon className="w-3 h-3" />
                                                    <span className="truncate max-w-[200px]">{banner.linkUrl}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end mr-2">
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Visibility</span>
                                                    <button 
                                                        onClick={() => handleToggleStatus(banner)}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all font-bold text-xs ${banner.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {banner.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                        {banner.isActive ? "ACTIVE" : "HIDDEN"}
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(banner._id)}
                                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
                                                    title="Delete Permanent"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${banner.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {banner.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Order: {banner.order}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-800">Add New Poster</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full transition-all">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Banner Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-cyan-500 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                                        placeholder="E.g., Summer Admission 2026"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Desktop Image (4:1)</label>
                                    <div className="space-y-3">
                                        {formData.desktopImageUrl && (
                                            <div className="aspect-[4/1] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={formData.desktopImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                onChange={(e) => handleImageUpload(e, "desktopImageUrl")}
                                                className="hidden" 
                                                id="desktop-upload"
                                                accept="image/*"
                                            />
                                            <label htmlFor="desktop-upload" className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all font-bold text-slate-500 text-sm">
                                                <ImageIcon className="w-4 h-4" />
                                                {formData.desktopImageUrl ? "Change Image" : "Upload Image"}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Image (1:1)</label>
                                    <div className="space-y-3">
                                        {formData.mobileImageUrl && (
                                            <div className="aspect-square w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mx-auto">
                                                <img src={formData.mobileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                onChange={(e) => handleImageUpload(e, "mobileImageUrl")}
                                                className="hidden" 
                                                id="mobile-upload"
                                                accept="image/*"
                                            />
                                            <label htmlFor="mobile-upload" className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all font-bold text-slate-500 text-sm">
                                                <ImageIcon className="w-4 h-4" />
                                                {formData.mobileImageUrl ? "Change Image" : "Upload Image"}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link URL</label>
                                    <input 
                                        type="text" 
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-cyan-500 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Order</label>
                                    <input 
                                        type="number" 
                                        value={formData.order}
                                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-cyan-500 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-100 hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>Save Poster</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;
