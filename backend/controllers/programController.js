import Program from "../models/Program.js";

// @desc    Get a single program by id or slug
// @route   GET /api/programs/:id
// @access  Public
export const getProgramById = async (req, res) => {
    try {
        const { id } = req.params;
        let program;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            program = await Program.findById(id);
        } else {
            program = await Program.findOne({ slug: id });
        }

        if (program) {
            res.json(program);
        } else {
            res.status(404).json({ message: "Program not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all published programs
// @route   GET /api/programs
// @access  Public
export const getPrograms = async (req, res) => {
    try {
        const programs = await Program.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all programs for admin
// @route   GET /api/programs/admin
// @access  Private/Admin
export const getAdminPrograms = async (req, res) => {
    try {
        const programs = await Program.find({}).sort({ order: 1, createdAt: -1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new program
// @route   POST /api/programs
// @access  Private/Admin
export const createProgram = async (req, res) => {
    try {
        const {
            title,
            tagline,
            subtitle,
            description,
            features,
            imageUrl,
            detailImageUrl,
            badge,
            iconName,
            gradient,
            glowColor,
            accentColor,
            pill,
            order,
            isPublished,
            offerings
        } = req.body;

        // Generate slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Check if slug already exists
        const existingProgram = await Program.findOne({ slug });
        if (existingProgram) {
            return res.status(400).json({ message: "A program with a similar title already exists." });
        }

        const program = await Program.create({
            title,
            slug,
            tagline,
            subtitle,
            description,
            features,
            imageUrl,
            detailImageUrl,
            badge,
            iconName,
            gradient,
            glowColor,
            accentColor,
            pill,
            order,
            isPublished,
            offerings,
            createdBy: req.user._id,
        });

        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a program
// @route   PATCH /api/programs/:id
// @access  Private/Admin
export const updateProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (program) {
            program.title = req.body.title || program.title;
            
            if (req.body.title) {
                program.slug = req.body.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            }

            program.tagline = req.body.tagline || program.tagline;
            program.subtitle = req.body.subtitle || program.subtitle;
            program.description = req.body.description || program.description;
            program.features = req.body.features || program.features;
            program.imageUrl = req.body.imageUrl || program.imageUrl;
            program.detailImageUrl = req.body.detailImageUrl !== undefined ? req.body.detailImageUrl : program.detailImageUrl;
            program.badge = req.body.badge || program.badge;
            program.iconName = req.body.iconName || program.iconName;
            program.gradient = req.body.gradient || program.gradient;
            program.glowColor = req.body.glowColor || program.glowColor;
            program.accentColor = req.body.accentColor || program.accentColor;
            program.pill = req.body.pill || program.pill;
            program.order = req.body.order !== undefined ? req.body.order : program.order;
            program.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : program.isPublished;
            program.offerings = req.body.offerings !== undefined ? req.body.offerings : program.offerings;

            const updatedProgram = await program.save();
            res.json(updatedProgram);
        } else {
            res.status(404).json({ message: "Program not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
export const deleteProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (program) {
            await Program.findByIdAndDelete(req.params.id);
            res.json({ message: "Program removed" });
        } else {
            res.status(404).json({ message: "Program not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
