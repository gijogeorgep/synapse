import Event from "../models/Event.js";
import Classroom from "../models/Classroom.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, type, targetClasses } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      type,
      targetClasses: targetClasses || ["All"],
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    let query = {};

    // If student, filter by their enrolled classrooms
    if (req.user.role === "student") {
      const classrooms = await Classroom.find({ students: req.user._id });
      const classroomNames = classrooms.map(c => c.name);
      
      query = {
        $or: [
          { targetClasses: "All" },
          { targetClasses: { $in: classroomNames } },
        ],
      };
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { title, description, date, type, targetClasses } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.type = type || event.type;
    event.targetClasses = targetClasses || event.targetClasses;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
