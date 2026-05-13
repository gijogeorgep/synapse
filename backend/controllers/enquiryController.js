import EnquiryForm from "../models/EnquiryForm.js";
import EnquiryResponse from "../models/EnquiryResponse.js";
import slugify from "slugify";

// @desc    Create a new Enquiry Form
// @route   POST /api/enquiry/forms
// @access  Private/Admin
export const createEnquiryForm = async (req, res) => {
    try {
        const { title, description, fields } = req.body;

        if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ message: "Please provide title and at least one field." });
        }

        // Generate a unique slug
        let slug = slugify(title, { lower: true, strict: true });
        const slugExists = await EnquiryForm.findOne({ slug });
        if (slugExists) {
            slug = `${slug}-${Date.now()}`;
        }

        const form = await EnquiryForm.create({
            title,
            description,
            fields,
            slug,
            createdBy: req.user._id,
        });

        res.status(201).json(form);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all Enquiry Forms
// @route   GET /api/enquiry/forms
// @access  Private/Admin
export const getEnquiryForms = async (req, res) => {
    try {
        const forms = await EnquiryForm.find().sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get single Enquiry Form by ID
// @route   GET /api/enquiry/forms/:id
// @access  Private/Admin
export const getEnquiryFormById = async (req, res) => {
    try {
        const form = await EnquiryForm.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update Enquiry Form
// @route   PATCH /api/enquiry/forms/:id
// @access  Private/Admin
export const updateEnquiryForm = async (req, res) => {
    try {
        const { title, description, fields, isActive } = req.body;
        const form = await EnquiryForm.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        if (title) form.title = title;
        if (description !== undefined) form.description = description;
        if (fields) form.fields = fields;
        if (isActive !== undefined) form.isActive = isActive;

        const updatedForm = await form.save();
        res.status(200).json(updatedForm);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete Enquiry Form
// @route   DELETE /api/enquiry/forms/:id
// @access  Private/Admin
export const deleteEnquiryForm = async (req, res) => {
    try {
        const form = await EnquiryForm.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Also delete all responses associated with this form
        await EnquiryResponse.deleteMany({ form: req.params.id });
        await form.deleteOne();

        res.status(200).json({ message: "Form and its responses deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get form for public submission
// @route   GET /api/enquiry/public/:slug
// @access  Public
export const getPublicForm = async (req, res) => {
    try {
        const form = await EnquiryForm.findOne({ slug: req.params.slug, isActive: true });
        if (!form) {
            return res.status(404).json({ message: "Form not found or is inactive" });
        }
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Submit form response
// @route   POST /api/enquiry/public/:slug/submit
// @access  Public
export const submitEnquiryResponse = async (req, res) => {
    try {
        const { responses } = req.body;
        const form = await EnquiryForm.findOne({ slug: req.params.slug, isActive: true });

        if (!form) {
            return res.status(404).json({ message: "Form not found or is inactive" });
        }

        // Basic validation: Check required fields
        for (const field of form.fields) {
            if (field.required && !responses[field.label]) {
                return res.status(400).json({ message: `${field.label} is required` });
            }
        }

        const response = await EnquiryResponse.create({
            form: form._id,
            responses,
        });

        res.status(201).json({ message: "Response submitted successfully", response });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all responses for a form
// @route   GET /api/enquiry/forms/:id/responses
// @access  Private/Admin
export const getEnquiryResponses = async (req, res) => {
    try {
        const responses = await EnquiryResponse.find({ form: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
