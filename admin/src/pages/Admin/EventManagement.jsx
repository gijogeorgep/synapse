import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getEvents, createEvent, updateEvent, deleteEvent, getAdminClassrooms } from "../../api/services";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "event",
    targetClasses: ["All"]
  });

  useEffect(() => {
    fetchEvents();
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const data = await getAdminClassrooms();
      setClassrooms(data || []);
    } catch (error) {
      console.error("Failed to fetch classrooms");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      targetClasses: [value] // Simplified for now
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateEvent(currentEventId, formData);
        toast.success("Event updated successfully");
      } else {
        await createEvent(formData);
        toast.success("Event created successfully");
      }
      setShowForm(false);
      setIsEditing(false);
      setCurrentEventId(null);
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        type: "event",
        targetClasses: ["All"]
      });
      fetchEvents();
    } catch (error) {
      toast.error(isEditing ? "Failed to update event" : "Failed to create event");
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description || "",
      date: new Date(event.date).toISOString().split("T")[0],
      type: event.type,
      targetClasses: event.targetClasses
    });
    setIsEditing(true);
    setCurrentEventId(event._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Event Management</h1>
          <p className="text-slate-500 text-sm">Manage custom events and holidays for the student calendar.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setFormData({
              title: "",
              description: "",
              date: new Date().toISOString().split("T")[0],
              type: "event",
              targetClasses: ["All"]
            });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        {showForm && (
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Event" : "Create Event"}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Annual Day Celebration"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="event">General Event</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Target Class</label>
                    <select
                      name="targetClasses"
                      value={formData.targetClasses[0]}
                      onChange={handleClassChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="All">All Classes</option>
                      {classrooms.map(cls => (
                        <option key={cls._id} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Provide details about the event..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 mt-2"
                >
                  {isEditing ? "Update Event" : "Create Event"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* List Panel */}
        <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                No events found.
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event._id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${
                      event.type === 'holiday' ? 'bg-emerald-50 text-emerald-600' : 
                      event.type === 'event' ? 'bg-indigo-50 text-indigo-600' : 
                      'bg-slate-50 text-slate-600'
                    }`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(event)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className={event.type === 'holiday' ? 'text-emerald-500' : 'text-indigo-500'}>{event.type}</span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{event.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <Info className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: {event.targetClasses.join(", ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
