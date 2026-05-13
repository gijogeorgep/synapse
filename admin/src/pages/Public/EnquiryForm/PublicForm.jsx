import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPublicForm, submitEnquiryResponse } from "../../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PublicForm = () => {
    const { slug } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await getPublicForm(slug);
                setForm(data);
                // Initialize responses
                const initialResponses = {};
                data.fields.forEach(field => {
                    initialResponses[field.label] = field.type === "checkbox" ? [] : "";
                });
                setResponses(initialResponses);
            } catch (error) {
                console.error("Error fetching form:", error);
                toast.error("Form not found or inactive");
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [slug]);

    const handleInputChange = (label, value) => {
        setResponses(prev => ({ ...prev, [label]: value }));
    };

    const handleCheckboxChange = (label, option, checked) => {
        setResponses(prev => {
            const current = prev[label] || [];
            if (checked) {
                return { ...prev, [label]: [...current, option] };
            } else {
                return { ...prev, [label]: current.filter(o => o !== option) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitEnquiryResponse(slug, responses);
            setSubmitted(true);
            toast.success("Submitted successfully!");
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(error.message || "Failed to submit response");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Form Not Found</h1>
                <p className="text-slate-600">The form you are looking for does not exist or has been deactivated.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0ebf8] py-8 px-4 font-sans">
            <div className="max-w-2xl mx-auto space-y-4">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 relative"
                >
                    <div className="h-2.5 bg-[#673ab7]" />
                    <div className="p-6 md:p-8">
                        <h1 className="text-3xl font-normal text-slate-900 mb-2">{form.title}</h1>
                        {form.description && (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{form.description}</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-red-500 text-sm">
                            <span>*</span>
                            <span>Indicates required question</span>
                        </div>
                    </div>
                </motion.div>
                
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4 pb-12">
                            {form.fields.map((field, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
                                >
                                    <div className="mb-4 flex items-start gap-1">
                                        <label className="text-base font-normal text-slate-900">
                                            {field.label}
                                        </label>
                                        {field.required && <span className="text-red-500">*</span>}
                                    </div>

                                    <div className="mt-2">
                                        {field.type === "textarea" ? (
                                            <textarea
                                                required={field.required}
                                                placeholder={field.placeholder || "Your answer"}
                                                className="w-full py-2 border-b border-slate-300 focus:border-[#673ab7] focus:border-b-2 outline-none transition-all min-h-[100px] bg-transparent text-slate-900"
                                                value={responses[field.label] || ""}
                                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            />
                                        ) : field.type === "select" ? (
                                            <select
                                                required={field.required}
                                                className="w-full md:w-1/2 p-3 rounded-lg border border-slate-300 focus:border-[#673ab7] outline-none transition-all bg-white text-slate-900"
                                                value={responses[field.label] || ""}
                                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            >
                                                <option value="">Choose</option>
                                                {field.options.map((opt, i) => (
                                                    <option key={i} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === "radio" ? (
                                            <div className="space-y-3">
                                                {field.options.map((opt, i) => (
                                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={field.label}
                                                                required={field.required}
                                                                className="w-5 h-5 text-[#673ab7] border-slate-400 focus:ring-0 cursor-pointer"
                                                                checked={responses[field.label] === opt}
                                                                onChange={() => handleInputChange(field.label, opt)}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-slate-800">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field.type === "checkbox" ? (
                                            <div className="space-y-3">
                                                {field.options.map((opt, i) => (
                                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-[#673ab7] border-slate-400 rounded-sm focus:ring-0 cursor-pointer"
                                                            checked={(responses[field.label] || []).includes(opt)}
                                                            onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                                                        />
                                                        <span className="text-sm text-slate-800">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                placeholder={field.placeholder || "Your answer"}
                                                className="w-full md:w-3/4 py-2 border-b border-slate-300 focus:border-[#673ab7] focus:border-b-2 outline-none transition-all bg-transparent text-slate-900"
                                                value={responses[field.label] || ""}
                                                onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#673ab7] hover:bg-[#5e35b1] text-white font-medium px-8 py-2.5 rounded shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResponses({})}
                                    className="text-[#673ab7] font-medium text-sm hover:bg-slate-100 px-4 py-2 rounded transition-colors"
                                >
                                    Clear form
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="h-2.5 bg-[#673ab7]" />
                            <div className="p-8">
                                <h2 className="text-3xl font-normal text-slate-900 mb-4">{form.title}</h2>
                                <p className="text-sm text-slate-700 mb-6">
                                    Your response has been recorded.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-[#673ab7] text-sm hover:underline font-normal"
                                >
                                    Submit another response
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center pb-12">
                    <p className="text-[11px] text-slate-500">
                        This content is neither created nor endorsed by Synapse Connect.
                    </p>
                    <p className="text-lg font-medium text-slate-600 mt-4">
                        Synapse <span className="font-bold">Forms</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicForm;
