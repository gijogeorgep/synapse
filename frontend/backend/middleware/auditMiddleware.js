import AuditLog from "../models/AuditLog.js";

export const logAdminAction = (action, detailsField = "") => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function (body) {
            res.send = originalSend;
            
            // Only log if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const details = typeof detailsField === 'function' 
                    ? detailsField(req) 
                    : detailsField || `${req.method} ${req.originalUrl}`;

                AuditLog.create({
                    user: req.user._id,
                    action,
                    details,
                    targetId: req.params.id || req.body.id || null,
                    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
                }).catch(err => console.error("Audit Log Error:", err));
            }
            
            return res.send(body);
        };
        
        next();
    };
};
