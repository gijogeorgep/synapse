import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, CheckCircle2, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getPublicClassrooms, enrollInClassroom, createRazorpayOrder, verifyRazorpayPayment } from "../../api/services";

const ClassroomSelection = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPublicClassrooms = async () => {
            try {
                const data = await getPublicClassrooms();
                setClassrooms(data);
            } catch (err) {
                console.error("Error fetching classrooms:", err);
                setError("Failed to load available classrooms.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicClassrooms();
    }, []);

    const handleEnroll = async (classroom) => {
        const classroomId = classroom._id;
        const price = classroom.price || 0;

        // Phone Number Validation - Must be 10 digits to enroll
        const phoneRegex = /^\d{10}$/;
        if (!user?.phoneNumber || !phoneRegex.test(user.phoneNumber.replace(/\s+/g, ""))) {
            setError("A valid 10-digit phone number is required to enroll. Please update your profile in settings.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setEnrolling(classroomId);
        setError("");

        try {
            // If price is 0, enroll directly
            if (price <= 0) {
                await enrollInClassroom(classroomId);
                toast.success("Enrolled successfully!");
                navigate("/student/dashboard");
                return;
            }

            // Payment Flow for Paid Classrooms
            const order = await createRazorpayOrder(classroomId);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Synapse Edu Hub",
                description: `Enrollment for ${classroom.name}`,
                image: window.location.origin + "/synapse_logo.png",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        setEnrolling(classroomId);
                        const verifyRes = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            classroomId: classroomId
                        });

                        if (verifyRes.success) {
                            toast.success("Payment successful! Enrolled in classroom.");
                            navigate("/student/dashboard");
                        } else {
                            setError("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        setError(err.message || "Verification failed");
                    } finally {
                        setEnrolling(null);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phoneNumber
                },
                theme: {
                    color: "#06b6d4"
                },
                modal: {
                    ondismiss: function () {
                        setEnrolling(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Enrollment failed. Please try again.");
            setEnrolling(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-4">
                    <GraduationCap className="w-4 h-4" />
                    <span>Step 2: Choose Your Batch</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                    Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Classroom</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Choose the program that fits your goals. Get access to comprehensive study materials and MCQ tests instantly after enrollment.
                </p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {classrooms.map((cls) => (
                    <div 
                        key={cls._id}
                        className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 hover:border-cyan-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-50 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${
                                cls.programType === 'E-Zone' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                cls.programType === 'PrimeOne' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                                cls.programType === 'Cluster' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                'bg-emerald-50 border-emerald-100 text-emerald-600'
                            }`}>
                                <GraduationCap className="w-7 h-7" />
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-600 rounded uppercase tracking-tighter border border-slate-200">
                                    {cls.programType}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{cls.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                <span className="font-semibold text-cyan-600">
                                    {cls.programType === 'E-Zone' ? (cls.subjects?.[0] || 'Entrance') : `Class ${cls.className}`}
                                </span>
                                <span>•</span>
                                <span>{cls.board}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm">Complete MCQ Test Series</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm">Premium Study Materials</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm">Performance Tracking</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Course Price</p>
                                    <p className="text-3xl font-black text-slate-900">₹{cls.price}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleEnroll(cls)}
                                disabled={enrolling !== null}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    enrolling === cls._id 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                                }`}
                            >
                                {enrolling === cls._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        <span>Enroll Now</span>
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button 
                    onClick={logout}
                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default ClassroomSelection;
