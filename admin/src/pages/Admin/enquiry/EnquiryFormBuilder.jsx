import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEnquiryForm } from "../../../api/services";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    Save, 
    ArrowLeft, 
    Settings2,
    Type,
    AlignLeft,
    CheckSquare,
    CircleDot,
    Mail,
    Hash,
    Calendar,
    ChevronDown,
    CheckCircle2,
    Copy,
    Share2,
    ExternalLink,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import { getFormLink } from "../../../utils/urlHelper";

const fieldTypes = [
    { type: "text", label: "Short Text", icon: Type },
    { type: "textarea", label: "Long Text", icon: AlignLeft },
    { type: "email", label: "Email", icon: Mail },
    { type: "number", label: "Number", icon: Hash },
    { type: "select", label: "Dropdown", icon: ChevronDown },
    { type: "radio", label: "Single Choice", icon: CircleDot },
    { type: "checkbox", label: "Multiple Choice", icon: CheckSquare },
    { type: "date", label: "Date", icon: Calendar },
];

const EnquiryFormBuilder = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([
        { label: "Full Name", type: "text", required: true, options: [], placeholder: "Enter student name" }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [createdForm, setCreatedForm] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const addField = (type) => {
        const newField = {
            label: `Question ${fields.length + 1}`,
            type,
            required: false,
            options: ["Option 1"],
            placeholder: ""
        };
        setFields([...fields, newField]);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index, updates) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        setFields(newFields);
    };

    const addOption = (fieldIndex) => {
        const newFields = [...fields];
        newFields[fieldIndex].options.push(`Option ${newFields[fieldIndex].options.length + 1}`);
        setFields(newFields);
    };

    const removeOption = (fieldIndex, optionIndex) => {
        const newFields = [...fields];
        newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
        setFields(newFields);
    };

    const updateOption = (fieldIndex, optionIndex, value) => {
        const newFields = [...fields];
        newFields[fieldIndex].options[optionIndex] = value;
        setFields(newFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return toast.error("Please provide a form title");
        if (fields.length === 0) return toast.error("Please add at least one question");

        setSubmitting(true);
        try {
            const data = await createEnquiryForm({ title, description, fields });
            setCreatedForm(data);
            setShowSuccessModal(true);
            toast.success("Form created successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to create form");
        } finally {
            setSubmitting(false);
        }
    };

    const copyLink = () => {
        if (!createdForm) return;
        const url = getFormLink(createdForm.slug);
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const shareWhatsApp = () => {
        if (!createdForm) return;
        const url = getFormLink(createdForm.slug);
        const text = `Please fill out this form: ${createdForm.title}\n\nLink: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/admin/enquiry")}
                    className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Form</h1>
                    <p className="text-slate-500">Design your custom enquiry or registration form.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Field Types Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-8">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-cyan-600" />
                            Add Field
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {fieldTypes.map((ft) => (
                                <button
                                    key={ft.type}
                                    onClick={() => addField(ft.type)}
                                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-600 font-medium group"
                                >
                                    <ft.icon className="w-4 h-4 group-hover:text-cyan-600 transition-colors" />
                                    {ft.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Builder Main Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Header Info */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Form Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Summer Batch Registration"
                                className="w-full text-2xl font-bold border-b-2 border-slate-100 py-2 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-200"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                            <textarea
                                placeholder="Describe the purpose of this form..."
                                className="w-full text-slate-600 border-b-2 border-slate-100 py-2 focus:border-cyan-500 outline-none transition-all resize-none placeholder:text-slate-200"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Fields List */}
                    <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-6">
                        {fields.map((field, index) => (
                            <Reorder.Item
                                key={index}
                                value={field}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-100 group-hover:bg-cyan-500 transition-colors" />
                                
                                <div className="flex items-start gap-4">
                                    <div className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-500 transition-colors">
                                        <GripVertical className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label / Question</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 rounded-xl border border-slate-100 focus:border-cyan-500 outline-none font-bold"
                                                    value={field.label}
                                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-full md:w-48 space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</label>
                                                <div className="p-3 rounded-xl bg-slate-50 text-slate-500 font-bold flex items-center gap-2">
                                                    {fieldTypes.find(f => f.type === field.type)?.icon && React.createElement(fieldTypes.find(f => f.type === field.type).icon, { className: "w-4 h-4" })}
                                                    {fieldTypes.find(f => f.type === field.type)?.label}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Options for Choice Types */}
                                        {["select", "radio", "checkbox"].includes(field.type) && (
                                            <div className="space-y-3 pl-4 border-l-2 border-slate-50">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</label>
                                                {field.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                        <input
                                                            type="text"
                                                            className="flex-1 p-2 rounded-lg border border-slate-50 focus:border-cyan-200 outline-none text-sm"
                                                            value={option}
                                                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => removeOption(index, optIndex)}
                                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addOption(index)}
                                                    className="flex items-center gap-2 text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors pl-5"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Option
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={field.required}
                                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                                        />
                                                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Required Field</span>
                                                </label>
                                            </div>
                                            <button
                                                onClick={() => removeField(index)}
                                                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove Question
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {/* Action Bar */}
                    <div className="flex justify-end pt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-extrabold shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <Plus className="w-6 h-6 animate-spin" />
                            ) : (
                                <Save className="w-6 h-6" />
                            )}
                            Save Form Template
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => navigate("/admin/enquiry")}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <button
                                        onClick={() => navigate("/admin/enquiry")}
                                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-black text-slate-900 mb-2">Form Created!</h2>
                                <p className="text-slate-500 mb-8 font-medium">Your form is live and ready to collect responses.</p>

                                <div className="space-y-6">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Shareable Link</p>
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                            <span className="flex-1 text-sm font-bold text-slate-600 truncate">
                                                {getFormLink(createdForm?.slug)}
                                            </span>
                                            <button
                                                onClick={copyLink}
                                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={shareWhatsApp}
                                            className="flex items-center justify-center gap-3 p-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-black transition-all shadow-lg shadow-green-100"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            WhatsApp
                                        </button>
                                        <a
                                            href={getFormLink(createdForm?.slug)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-3 p-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black transition-all shadow-lg shadow-slate-200"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            View Live
                                        </a>
                                    </div>

                                    <button
                                        onClick={() => navigate("/admin/enquiry")}
                                        className="w-full p-4 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnquiryFormBuilder;
