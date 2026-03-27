import React, { useState, useEffect } from "react";
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Eye, 
    EyeOff, 
    Save, 
    X, 
    Upload, 
    Layout, 
    CheckCircle2,
    Zap,
    BarChart3,
    Users,
    BookOpen,
    Sparkles,
    Palette
} from "lucide-react";
import { 
    getAdminPrograms, 
    createProgram, 
    updateProgram, 
    deleteProgram,
    uploadImage 
} from "../../../api/services";
import { AlertCircle, X as CloseIcon } from "lucide-react";

const iconsList = [
    { name: "Zap", icon: Zap },
    { name: "BarChart3", icon: BarChart3 },
    { name: "Users", icon: Users },
    { name: "BookOpen", icon: BookOpen },
    { name: "Sparkles", icon: Sparkles }
];

const ProgramManagement = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        tagline: "",
        subtitle: "",
        description: "",
        features: [""],
        imageUrl: "",
        detailImageUrl: "",
        badge: "",
        iconName: "Zap",
        gradient: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
        accentColor: "#06b6d4",
        isPublished: true,
        order: 0,
        offerings: []
    });
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const data = await getAdminPrograms();
            console.log("Admin Programs Data fetched:", data);
            setPrograms(data);
        } catch (error) {
            console.error("Error fetching admin programs:", error);
            setStatus({ type: 'error', message: "Failed to fetch programs: " + (error.message || error) });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (program = null) => {
        if (program) {
            setEditingProgram(program);
            setFormData({
                ...program,
                features: program.features.length > 0 ? program.features : [""],
                offerings: program.offerings || []
            });
        } else {
            setEditingProgram(null);
            setFormData({
                title: "",
                tagline: "",
                subtitle: "",
                description: "",
                features: [""],
                imageUrl: "",
                detailImageUrl: "",
                badge: "",
                iconName: "Zap",
                gradient: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
                accentColor: "#06b6d4",
                isPublished: true,
                order: programs.length + 1,
                offerings: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProgram(null);
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ""] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [""] });
    };

    // Offerings handlers
    const addOffering = () => {
        setFormData({
            ...formData,
            offerings: [...(formData.offerings || []), { title: "", description: "", icon: "BookOpen" }]
        });
    };

    const updateOffering = (index, field, value) => {
        const updated = (formData.offerings || []).map((o, i) => i === index ? { ...o, [field]: value } : o);
        setFormData({ ...formData, offerings: updated });
    };

    const removeOffering = (index) => {
        setFormData({ ...formData, offerings: (formData.offerings || []).filter((_, i) => i !== index) });
    };

    const handleImageUpload = async (e, field = "imageUrl") => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append("image", file);
            const response = await uploadImage(uploadFormData);
            setFormData({ ...formData, [field]: response.url });
            setStatus({ type: 'success', message: "Image uploaded successfully" });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: "Failed to upload image" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Filter out empty features
            const cleanedFeatures = formData.features.filter(f => f.trim() !== "");
            const payload = { ...formData, features: cleanedFeatures };

            if (editingProgram) {
                await updateProgram(editingProgram._id, payload);
                setStatus({ type: 'success', message: "Program updated successfully" });
            } else {
                await createProgram(payload);
                setStatus({ type: 'success', message: "Program created successfully" });
            }
            fetchPrograms();
            handleCloseModal();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error.message || "Something went wrong" });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this program?")) {
            try {
                await deleteProgram(id);
                setStatus({ type: 'success', message: "Program deleted successfully" });
                fetchPrograms();
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            } catch (error) {
                setStatus({ type: 'error', message: "Failed to delete program" });
            }
        }
    };

    const togglePublish = async (program) => {
        try {
            await updateProgram(program._id, { isPublished: !program.isPublished });
            setStatus({ type: 'success', message: `Program ${!program.isPublished ? 'published' : 'unpublished'}` });
            fetchPrograms();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: "Failed to update status" });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Program Management</h1>
                    <p className="text-slate-500 mt-2">Create and manage marketing cards for the home page programs section.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:bg-cyan-700 transition-all hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5" />
                    Add New Program
                </button>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center justify-between space-x-3 text-sm font-medium animate-in zoom-in-95 duration-200 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    <div className="flex items-center space-x-3">
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{status.message}</span>
                    </div>
                    <button onClick={() => setStatus({ type: '', message: '' })}><CloseIcon className="w-4 h-4" /></button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                </div>
            ) : programs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <Layout className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No Programs Found</h3>
                    <p className="text-slate-400 mt-1">Start by creating your first program card.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <div key={program._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                            <div className="relative h-48">
                                <img 
                                    src={program.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"} 
                                    alt={program.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                        onClick={() => togglePublish(program)}
                                        className={`p-2 rounded-full backdrop-blur-md border ${program.isPublished ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-slate-500/20 border-slate-500/50 text-slate-100'}`}
                                        title={program.isPublished ? "Published" : "Draft"}
                                    >
                                        {program.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-6 text-white">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg mb-2 inline-block">
                                        {program.badge || "Program"}
                                    </span>
                                    <h3 className="text-xl font-bold">{program.title}</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                    {program.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {program.features.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                                            <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                                            {f}
                                        </div>
                                    ))}
                                    {program.features.length > 3 && (
                                        <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500">
                                            +{program.features.length - 3} more
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-slate-50">
                                    <button 
                                        onClick={() => handleOpenModal(program)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(program._id)}
                                        className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-8 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{editingProgram ? "Edit Program" : "Add New Program"}</h2>
                                <p className="text-sm text-slate-500 mt-1">Configure your program card and branding.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Layout className="w-3.5 h-3.5" />
                                        Program Title
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium"
                                        placeholder="e.g., PRIME ONE"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Badge Text
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium"
                                        placeholder="e.g., Most Popular / New Batch"
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Tagline
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium"
                                        placeholder="Brief catchy tagline"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Subtitle
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium"
                                        placeholder="e.g., Individual Tuition Program"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Description
                                </label>
                                <textarea 
                                    rows="3"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium resize-none"
                                    placeholder="Detailed description of the program..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Features Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Program Highlights (Points)
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={addFeature}
                                        className="text-cyan-600 text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Point
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-medium text-sm"
                                                placeholder={`Feature point ${index + 1}`}
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* visual attributes */}
                            <div className="p-8 bg-slate-50 rounded-[2rem] space-y-8 border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-cyan-600" />
                                    Visual Branding
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {/* Icon Picker */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Choose Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconsList.map((item) => (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, iconName: item.name })}
                                                    className={`p-3 rounded-xl border transition-all ${formData.iconName === item.name ? 'bg-cyan-600 border-cyan-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-cyan-200'}`}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Accent Color</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="color"
                                                className="w-12 h-12 rounded-xl overflow-hidden cursor-pointer border-0 p-0"
                                                value={formData.accentColor}
                                                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            />
                                            <input 
                                                type="text"
                                                className="flex-1 px-4 py-2 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-mono text-sm"
                                                value={formData.accentColor}
                                                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Image Upload Area */}
                                    <div className="col-span-full space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5" />
                                            Cover Image
                                        </label>
                                        
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            {/* Preview Area */}
                                            <div className="w-full md:w-64 h-40 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden relative group">
                                                {formData.imageUrl ? (
                                                    <>
                                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                                                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                        <Upload className="w-8 h-8 mb-2 opacity-20" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image Selected</span>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload controls */}
                                            <div className="flex-1 space-y-4 w-full">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Image URL</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none text-xs font-medium"
                                                            placeholder="Paste image URL here..."
                                                            value={formData.imageUrl}
                                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-px bg-slate-100 flex-1"></div>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
                                                        <div className="h-px bg-slate-100 flex-1"></div>
                                                    </div>

                                                    <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 transition-all group">
                                                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                                        <span className="text-sm font-bold text-slate-500 group-hover:text-cyan-700 transition-colors">Upload from Computer</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                    * Best size: 800x400px. Supports JPG, PNG, and WebP.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gradient (CSS)</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all font-mono text-xs"
                                        placeholder="linear-gradient(...)"
                                        value={formData.gradient}
                                        onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Detail Page Image */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Detail Page Image</span>
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Shows on the program detail page</span>
                                </div>
                                <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <div className="w-full md:w-56 h-36 rounded-2xl bg-white border-2 border-dashed border-slate-200 overflow-hidden relative group">
                                        {formData.detailImageUrl ? (
                                            <>
                                                <img src={formData.detailImageUrl} alt="Detail Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <button type="button" onClick={() => setFormData({ ...formData, detailImageUrl: "" })} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <Upload className="w-6 h-6 mb-1 opacity-20" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">No Detail Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3 w-full">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500/20 outline-none text-xs font-medium"
                                            placeholder="Paste detail page image URL..."
                                            value={formData.detailImageUrl || ""}
                                            onChange={(e) => setFormData({ ...formData, detailImageUrl: e.target.value })}
                                        />
                                        <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-slate-500 hover:text-indigo-700 font-bold text-sm">
                                            <Upload className="w-4 h-4" />
                                            Upload Detail Image
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "detailImageUrl")} disabled={isUploading} />
                                        </label>
                                        <p className="text-[10px] text-slate-400 italic">Leave empty to use the cover image on the detail page.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Offerings / What We Provide */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">What We Provide (Detail Page)</span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Add cards like Study Materials, Exams, Question Papers etc.</p>
                                    </div>
                                    <button type="button" onClick={addOffering} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                                        <Plus className="w-3.5 h-3.5" /> Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {(formData.offerings || []).length === 0 && (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 font-medium">No offerings added yet. Click "Add Item" to start.</p>
                                        </div>
                                    )}
                                    {(formData.offerings || []).map((offering, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Title *</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    placeholder="e.g., Study Materials"
                                                    value={offering.title}
                                                    onChange={(e) => updateOffering(index, "title", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Description</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    placeholder="Brief description..."
                                                    value={offering.description}
                                                    onChange={(e) => updateOffering(index, "description", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Icon</label>
                                                    <select
                                                        className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                        value={offering.icon}
                                                        onChange={(e) => updateOffering(index, "icon", e.target.value)}
                                                    >
                                                        <option value="BookOpen">📚 Study Materials</option>
                                                        <option value="FileText">📄 Question Papers</option>
                                                        <option value="ClipboardList">📋 Exams</option>
                                                        <option value="Video">🎥 Video Lectures</option>
                                                        <option value="Users">👥 Live Classes</option>
                                                        <option value="BarChart3">📊 Progress Tracking</option>
                                                        <option value="Zap">⚡ Quick Revision</option>
                                                        <option value="CheckCircle2">✅ Assessments</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeOffering(index)} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all shrink-0">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div 
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isPublished ? 'bg-cyan-600' : 'bg-slate-200'}`}
                                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.isPublished ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Publish Immediately</span>
                                </label>
                                
                                <div className="flex-1 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal}
                                        className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex items-center gap-2 px-10 py-3.5 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all hover:-translate-y-1 active:scale-95"
                                    >
                                        <Save className="w-5 h-5" />
                                        {editingProgram ? "Update Program" : "Save Program"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramManagement;
