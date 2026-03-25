import { LogOut, X } from "lucide-react";

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-4">
                    <LogOut className="w-7 h-7 text-red-500" />
                </div>

                {/* Text */}
                <h2 className="text-lg font-bold text-slate-800 text-center">Sign out?</h2>
                <p className="text-sm text-slate-500 text-center mt-1.5 mb-6">
                    You'll be logged out of your account. Any unsaved changes will be lost.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-md shadow-red-500/25 transition-colors"
                    >
                        Yes, Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;
