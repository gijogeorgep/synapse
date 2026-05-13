import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Download,
  Calendar,
  Clock,
  BookOpen,
  User as UserIcon,
  Search,
  Filter,
  X,
  GraduationCap,
  Edit,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '../../api/apiClient';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const CustomDatePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const selectDate = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const days = [];
  const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startOffset = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:border-cyan-200 transition-all group"
      >
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          <span className="text-xs font-bold text-slate-700">
            {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date'}
          </span>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-[70] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div className="text-sm font-bold text-slate-800">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </div>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-300 text-center">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const isSelected = day && value && 
                  new Date(value).getDate() === day && 
                  new Date(value).getMonth() === viewDate.getMonth() && 
                  new Date(value).getFullYear() === viewDate.getFullYear();
                
                return (
                  <div 
                    key={i}
                    onClick={() => day && selectDate(day)}
                    className={cn(
                      "h-8 flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer",
                      !day ? "bg-transparent" : "hover:bg-cyan-50 hover:text-cyan-600",
                      isSelected ? "bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-100 hover:bg-cyan-700 hover:text-white" : "text-slate-600"
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LessonTracker = () => {
  const [reports, setReports] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [activeClassroom, setActiveClassroom] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const isAdmin = ['admin', 'superadmin'].includes(userInfo.role);
  const isStudent = userInfo.role === 'student';
  const canManage = !isStudent; // Teachers and Admins can manage

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    faculty: '',
    startTime: '',
    endTime: '',
    time: '',
    duration: '',
    chapter: '',
    topic: '',
    remark: '',
    class: ''
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [activeClassroom]);

  const fetchClassrooms = async () => {
    try {
      const data = await apiClient('/classrooms/my-classrooms');
      setClassrooms(data);
    } catch (error) {
      console.error('Failed to fetch classrooms');
    }
  };

  // Automatically calculate duration and format time string
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);

      let diff = (end.getTime() - start.getTime()) / 1000 / 60; // diff in minutes

      if (diff < 0) diff += 1440; // handle overnight if needed (though unlikely for lessons)

      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;

      let durationStr = '';
      if (hrs > 0) durationStr += `${hrs} Hr${hrs > 1 ? 's' : ''} `;
      if (mins > 0) durationStr += `${mins} Min${mins > 1 ? 's' : ''}`;
      if (diff === 0) durationStr = '0 Mins';

      // Format time range string (e.g. "10:00 AM - 11:30 AM")
      const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        const hh = parseInt(h);
        const suffix = hh >= 12 ? 'PM' : 'AM';
        const displayH = hh % 12 || 12;
        return `${displayH}:${m} ${suffix}`;
      };

      setFormData(prev => ({
        ...prev,
        duration: durationStr.trim(),
        time: `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
      }));
    }
  }, [formData.startTime, formData.endTime]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = activeClassroom === 'All' 
        ? '/lesson-reports' 
        : `/lesson-reports?class=${encodeURIComponent(activeClassroom)}`;
      const data = await apiClient(url);
      setReports(data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiClient(`/lesson-reports/${currentReportId}`, {
          method: 'PUT',
          body: formData
        });
        toast.success('Report updated successfully');
      } else {
        await apiClient('/lesson-reports', {
          method: 'POST',
          body: formData
        });
        toast.success('Report added successfully');
      }
      setShowForm(false);
      setIsEditing(false);
      setCurrentReportId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        faculty: '',
        startTime: '',
        endTime: '',
        time: '',
        duration: '',
        chapter: '',
        topic: '',
        remark: '',
        class: ''
      });
      fetchReports();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update report' : 'Failed to add report');
    }
  };

  const handleEdit = (report) => {
    // Extract times from formatted string "HH:MM AM - HH:MM PM"
    const times = report.time.split(' - ');
    const parseTime = (t) => {
      const [time, modifier] = t.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    setFormData({
      date: report.date.split('T')[0],
      subject: report.subject,
      faculty: report.faculty,
      startTime: parseTime(times[0]),
      endTime: parseTime(times[1]),
      time: report.time,
      duration: report.duration,
      chapter: report.chapter,
      topic: report.topic,
      remark: report.remark,
      class: report.class
    });
    setIsEditing(true);
    setCurrentReportId(report._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await apiClient(`/lesson-reports/${id}`, { method: 'DELETE' });
      toast.success('Report deleted');
      fetchReports();
    } catch (error) {
      toast.error(error || 'Failed to delete report');
    }
  };

  const exportToExcel = () => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(reports.map(r => ({
      DATE: new Date(r.date).toLocaleDateString('en-GB'),
      SUBJECT: r.subject,
      FACULTY: r.faculty,
      TIME: r.time,
      DURATION: r.duration,
      CHAPTER: r.chapter,
      TOPIC: r.topic,
      REMARK: r.remark || '',
      CLASS: r.class
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lesson Reports");
    const fileName = `Lesson_Tracker_${activeClassroom.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.setTextColor(68, 114, 196); // Blue color matching table header
    doc.text('LESSON TRACKER REPORT', 14, 15);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate color
    doc.text(`Classroom: ${activeClassroom}`, 14, 22);
    doc.text(`Exported on: ${new Date().toLocaleDateString('en-GB')}`, 240, 22);

    const tableData = reports.map(r => [
      new Date(r.date).toLocaleDateString('en-GB'),
      r.subject,
      r.faculty,
      r.time,
      r.duration,
      r.chapter,
      r.topic,
      r.remark || '',
      r.class
    ]);

    autoTable(doc, {
      head: [['DATE', 'SUBJECT', 'FACULTY', 'TIME', 'DURATION', 'CHAPTER', 'TOPIC', 'REMARK', 'CLASS']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] }
    });

    const fileName = `Lesson_Tracker_${activeClassroom.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.faculty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.chapter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.topic?.toLowerCase().includes(searchTerm.toLowerCase());

    const reportDate = new Date(r.date);
    reportDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      if (reportDate < fromDate) matchesDate = false;
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(0, 0, 0, 0);
      if (reportDate > toDate) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lesson Tracker</h1>
          <p className="text-slate-500 text-sm">Digital version of the teacher's lesson tracking spreadsheet</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-semibold text-sm border border-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4" />
              EXPORT EXCEL
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-semibold text-sm border border-rose-100"
            >
              <FileText className="w-4 h-4" />
              EXPORT PDF
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all font-bold text-sm shadow-lg shadow-cyan-100"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'CANCEL' : 'ADD NEW ENTRY'}
            </button>
          </div>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-slate-50/50 p-1 border-y border-slate-200 -mx-4 md:-mx-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="bg-cyan-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    {isEditing ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-white font-bold">{isEditing ? 'Edit Lesson Log' : 'New Lesson Log'}</h2>
                    <p className="text-cyan-100 text-[11px] uppercase tracking-widest font-medium">Session Details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setCurrentReportId(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Group 1: General Info */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">General Information</h3>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-500" /> Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-cyan-500" /> Faculty Name
                      </label>
                      <input
                        type="text"
                        name="faculty"
                        placeholder="e.g. Prajeesh"
                        required
                        value={formData.faculty}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> Class / Batch
                      </label>
                      <select
                        name="class"
                        required
                        value={formData.class}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Select Classroom</option>
                        {classrooms.map(cls => (
                          <option key={cls._id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Group 2: Lesson Content */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Lesson Content</h3>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-500" /> Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="e.g. Mathematics"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Chapter</label>
                      <input
                        type="text"
                        name="chapter"
                        placeholder="e.g. Straight Lines"
                        required
                        value={formData.chapter}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Topic</label>
                      <input
                        type="text"
                        name="topic"
                        placeholder="What was taught today?"
                        required
                        value={formData.topic}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Group 3: Timing & Remarks */}
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Time & Remarks</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-cyan-500" /> Start
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          required
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-cyan-500" /> End
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          required
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    {formData.duration && (
                      <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-600 uppercase">Duration</span>
                        <span className="text-xs font-bold text-cyan-700">{formData.duration}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Remarks</label>
                      <textarea
                        name="remark"
                        placeholder="Optional notes..."
                        value={formData.remark}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setCurrentReportId(null);
                    }}
                    className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-200 uppercase text-xs tracking-widest flex items-center gap-2"
                  >
                    {isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isEditing ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Classroom Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setActiveClassroom('All')}
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
            activeClassroom === 'All'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-cyan-200 hover:text-cyan-600'
          }`}
        >
          All Classes
        </button>
        {classrooms.map((cls) => (
          <button
            key={cls._id}
            onClick={() => setActiveClassroom(cls.name)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeClassroom === cls.name
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-cyan-200 hover:text-cyan-600'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-white space-y-4 md:space-y-6">
          {/* Top Bar: Search & Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-cyan-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">Lesson History</h2>
                <p className="text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-widest">
                  Showing {activeClassroom} Records
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 flex-1 lg:justify-end">
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Subject, Faculty, Topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 text-sm rounded-xl md:rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50/50 outline-none transition-all"
                />
              </div>
              <div className="bg-slate-100 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" />
                  <span className="text-xs md:text-sm font-bold text-slate-600">Total</span>
                </div>
                <span className="text-sm font-bold text-cyan-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{filteredReports.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Date Range & Quick Filters */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-6 pt-4 border-t border-slate-50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Period</span>
              </div>
              
              <CustomDatePicker 
                label="From Date"
                value={dateRange.from}
                onChange={(val) => setDateRange(prev => ({ ...prev, from: val }))}
              />

              <div className="w-4 h-0.5 bg-slate-200 rounded-full" />

              <CustomDatePicker 
                label="To Date"
                value={dateRange.to}
                onChange={(val) => setDateRange(prev => ({ ...prev, to: val }))}
              />
            </div>

            <div className="flex items-center gap-2 xl:ml-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDateRange({ from: today, to: today });
                }}
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                  setDateRange({ from: firstDay, to: lastDay });
                }}
                className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                This Month
              </button>
              {(dateRange.from || dateRange.to) && (
                <button
                  onClick={() => setDateRange({ from: '', to: '' })}
                  className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:bg-white hover:shadow-sm rounded-xl transition-all flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead className="bg-[#4472c4] text-white text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-4 border border-slate-300 w-28">DATE</th>
                <th className="px-3 py-4 border border-slate-300 w-32">SUBJECT</th>
                <th className="px-3 py-4 border border-slate-300 w-40">FACULTY</th>
                <th className="px-3 py-4 border border-slate-300 w-36">TIME</th>
                <th className="px-3 py-4 border border-slate-300 w-32">DURATION</th>
                <th className="px-3 py-4 border border-slate-300 w-44">CHAPTER</th>
                <th className="px-3 py-4 border border-slate-300 w-60">TOPIC</th>
                <th className="px-3 py-4 border border-slate-300 w-32">REMARK</th>
                <th className="px-3 py-4 border border-slate-300 w-32">CLASS</th>
                {isAdmin && <th className="px-3 py-4 border border-slate-300 w-32">TEACHER</th>}
                {canManage && <th className="px-3 py-4 border border-slate-300 w-24 text-center"></th>}
              </tr>
            </thead>
            <tbody className="text-[12px] text-slate-700 divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
                      <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Syncing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="px-6 py-20 text-center text-slate-400 italic">
                    No entries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-cyan-50/30 transition-all group">
                    <td className="px-3 py-3 border border-slate-100 whitespace-nowrap">
                      {new Date(report.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 font-medium text-cyan-700">
                      {report.subject}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 font-semibold text-slate-600">
                      {report.faculty}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 text-slate-500 font-mono text-[11px]">
                      {report.time}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 text-slate-600">
                      {report.duration}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 font-medium text-blue-800">
                      {report.chapter}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 text-slate-600 leading-relaxed">
                      {report.topic}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 italic text-slate-400">
                      {report.remark || '-'}
                    </td>
                    <td className="px-3 py-3 border border-slate-100 font-bold text-cyan-800">
                      {report.class}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="font-semibold text-slate-600">{report.teacher?.name || 'Unknown'}</span>
                        </div>
                      </td>
                    )}
                    {canManage && (
                      <td className="px-3 py-3 border border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-1.5 text-slate-300 hover:text-cyan-600 transition-colors rounded-md hover:bg-cyan-50"
                            title="Edit Entry"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading...</span>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic text-sm">
              No entries found.
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report._id} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px] font-bold uppercase">
                      {report.class}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{report.subject}</span>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(report)}
                        className="p-2 text-slate-300 hover:text-cyan-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-xs font-semibold text-slate-700">{new Date(report.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty</p>
                    <p className="text-xs font-semibold text-slate-700">{report.faculty}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                    <p className="text-xs font-semibold text-slate-600">{report.time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                    <p className="text-xs font-bold text-cyan-600">{report.duration}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lesson</p>
                    <p className="text-xs font-bold text-blue-800">{report.chapter}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{report.topic}</p>
                  </div>
                  {report.remark && (
                    <p className="text-[11px] text-slate-400 italic">
                      Remark: {report.remark}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonTracker;
