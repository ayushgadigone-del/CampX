import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  Lock,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Tag,
  Download,
  Share2,
  Check,
  Info,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Save,
  RotateCcw,
  BookMarked,
  Layers,
  ChevronRight,
  Upload,
  FileUp,
  FileCheck,
  ExternalLink,
  Paperclip,
  Eye,
  FileDown,
} from "lucide-react";
import { TopperNote } from "../types";
import { isAppOwner } from "../utils/topperNotesStorage";
import { useTheme } from "../context/ThemeContext";
import { exportTopperNoteToGoogleDoc } from "../lib/googleDocs";
import { openGooglePicker } from "../lib/googlePicker";
import { getAccessToken, googleSignIn } from "../lib/firebase";

interface TopperNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  notes: TopperNote[];
  onSaveNotes: (updatedNotes: TopperNote[]) => void;
  onShowToast: (msg: string) => void;
}

export const TopperNotesModal: React.FC<TopperNotesModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  currentUserName,
  notes,
  onSaveNotes,
  onShowToast,
}) => {
  const { isDark } = useTheme();
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    notes[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"read" | "chapters" | "manage">(
    "read"
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // App owner edit form state
  const ownerMode = isAppOwner(currentUserEmail);
  const [isEditingCurrentNote, setIsEditingCurrentNote] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<TopperNote> | null>(
    null
  );

  // Document file upload state
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docSubject, setDocSubject] = useState("");
  const [docBranch, setDocBranch] = useState<TopperNote["branch"]>("Computer Science");
  const [docSemester, setDocSemester] = useState<TopperNote["semester"]>("Sem 4");
  const [docAuthor, setDocAuthor] = useState(currentUserName || "Verified Student Topper");
  const [docAuthorRank, setDocAuthorRank] = useState("Branch Rank Holder");
  const [docPages, setDocPages] = useState<number>(20);
  const [docDescription, setDocDescription] = useState("");
  const [docTags, setDocTags] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);

  const handleFileSelection = (file: File) => {
    const validExtensions = [
      ".pdf",
      ".docx",
      ".doc",
      ".txt",
      ".pptx",
      ".ppt",
      ".png",
      ".jpg",
      ".jpeg",
    ];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError("Please upload a document file (PDF, DOCX, TXT, PPTX, or scanned notes image).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File size exceeds 25MB limit. Please upload a smaller document.");
      return;
    }

    setUploadError(null);
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    // Automatically fill title from filename if title is empty
    if (!docTitle) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setDocTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: formattedSize,
        type: file.type || "application/pdf",
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUploadedDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile && !docTitle.trim()) {
      setUploadError("Please select a document file to upload.");
      return;
    }

    const newDocId = `note-doc-${Date.now()}`;
    const newDocNote: TopperNote = {
      id: newDocId,
      title: docTitle.trim() || uploadedFile?.name || "Uploaded Subject Notes",
      subject: docSubject.trim() || "Engineering Subject",
      branch: docBranch,
      semester: docSemester,
      author: docAuthor.trim() || currentUserName || "Campus Student Topper",
      authorRank: docAuthorRank.trim() || "Class Topper",
      authorCollege: "Government College of Engineering",
      description:
        docDescription.trim() ||
        "High-yield study document uploaded by student topper for upcoming university exams.",
      isFree: true,
      pagesCount: Number(docPages) || 16,
      readTimeMinutes: Math.round((Number(docPages) || 16) * 1.5),
      tags: docTags
        ? docTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : ["PDF Document", "Topper Notes", docSubject || "Exam Prep"],
      lastUpdated: new Date().toISOString().split("T")[0],
      content: `## 📄 ${docTitle.trim() || uploadedFile?.name}\n\n**Subject:** ${docSubject || "Core Subject"} • **${docBranch} (${docSemester})**\n**Uploaded By:** ${docAuthor} (${docAuthorRank})\n\n### 📝 Document Description & Highlights:\n${
        docDescription.trim() || "Comprehensive revision material including diagrams, solved derivations, and formula guides."
      }\n\n*Click the 'Download Document' button above to read or print the full document file offline.*`,
      chapters: [
        {
          title: "Uploaded Document Summary",
          summary: `Attached Document: ${uploadedFile?.name || "Document File"} (${uploadedFile?.size || "PDF"})`,
          keyFormulasOrTips: [
            "Verified syllabus alignment for semester exams",
            "High-resolution scan suitable for mobile reading and printing",
          ],
        },
      ],
      fileUrl: uploadedFile?.dataUrl,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      fileType: uploadedFile?.type,
      uploadedByEmail: currentUserEmail || "student@college.edu.in",
    };

    const updated = [newDocNote, ...notes];
    onSaveNotes(updated);
    setSelectedNoteId(newDocId);
    setIsUploadDocModalOpen(false);

    // Reset form
    setUploadedFile(null);
    setDocTitle("");
    setDocSubject("");
    setDocDescription("");
    setDocTags("");
    setUploadError(null);
    onShowToast("🎉 Document file uploaded to Topper Vault successfully!");
  };

  const handleDownloadFile = (note: TopperNote) => {
    if (!note.fileUrl) {
      onShowToast("No file attachment found on this note.");
      return;
    }
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.download = note.fileName || `${note.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`📥 Downloading "${note.fileName || note.title}"...`);
  };

  const [isExportingDoc, setIsExportingDoc] = useState(false);

  const handleExportGoogleDoc = async (note: TopperNote) => {
    setIsExportingDoc(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        onShowToast("Please connect Google Account to export to Google Docs.");
        return;
      }
      onShowToast("Creating Google Doc formatted study guide...");
      const doc = await exportTopperNoteToGoogleDoc(token, note);
      onShowToast("📄 Google Doc created! Opening in Google Docs...");
      window.open(doc.url, "_blank");
    } catch (err: any) {
      onShowToast(err.message || "Failed to create Google Doc.");
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handlePickFromGoogleDrive = async () => {
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        onShowToast("Please connect Google Account to use Google Picker.");
        return;
      }

      await openGooglePicker({
        accessToken: token,
        title: "Select Document for Topper Vault",
        onPick: (doc) => {
          setUploadedFile({
            name: doc.name,
            size: doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} KB` : "Drive Doc",
            type: doc.mimeType,
            dataUrl: doc.url,
          });
          if (!docTitle) {
            setDocTitle(doc.name.replace(/\.[^/.]+$/, ""));
          }
          onShowToast(`Selected "${doc.name}" from Google Drive!`);
        },
      });
    } catch (err: any) {
      onShowToast(err.message || "Could not open Google Picker.");
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)) ||
      n.author.toLowerCase().includes(q);

    const matchesBranch =
      selectedBranch === "All" || n.branch === selectedBranch;
    const matchesSemester =
      selectedSemester === "All" || n.semester === selectedSemester;

    return matchesSearch && matchesBranch && matchesSemester;
  });

  const activeNote =
    notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || notes[0];

  const handleStartEdit = (note: TopperNote) => {
    if (!ownerMode) {
      onShowToast("🔒 Read-only access: Only the verified app owner can edit topper notes.");
      return;
    }
    setEditFormData({ ...note });
    setIsEditingCurrentNote(true);
  };

  const handleSaveEdit = () => {
    if (!ownerMode || !editFormData || !activeNote) return;

    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? ({
            ...n,
            ...editFormData,
            lastUpdated: new Date().toISOString().split("T")[0],
          } as TopperNote)
        : n
    );

    onSaveNotes(updated);
    setIsEditingCurrentNote(false);
    setEditFormData(null);
    onShowToast("✅ Topper note updated and saved successfully!");
  };

  const handleAddNewNote = () => {
    if (!ownerMode) {
      onShowToast("🔒 Only the verified app owner can create new topper notes.");
      return;
    }

    const newNoteId = `note-${Date.now()}`;
    const newNote: TopperNote = {
      id: newNoteId,
      title: "New Subject Master Revision Notes",
      subject: "Core Engineering Subject",
      branch: "Computer Science",
      semester: "Sem 4",
      author: currentUserName ? `${currentUserName} (App Owner)` : "Ayush G. (App Owner)",
      authorRank: "University Rank Holder",
      authorCollege: "Government College of Engineering",
      description: "Concise exam-oriented summary notes compiled with key formula sheets and high-yield question breakdowns.",
      isFree: true,
      pagesCount: 24,
      readTimeMinutes: 15,
      tags: ["Exam Prep", "Formula Sheet"],
      lastUpdated: new Date().toISOString().split("T")[0],
      content: `## 📚 Overview\nHigh-yield exam notes prepared for semester examinations.\n\n### Key Concepts:\n- Concept 1: Definitions and proofs\n- Concept 2: Typical numerical methods\n- Concept 3: Standard exam diagrams`,
      chapters: [
        {
          title: "Unit 1: Fundamentals & Essential Definitions",
          summary: "Core formulas and derivations required for Part A theory questions.",
          keyFormulasOrTips: ["Formula 1: Definition with SI units", "Standard tip for full marks"],
        },
      ],
    };

    const updated = [newNote, ...notes];
    onSaveNotes(updated);
    setSelectedNoteId(newNoteId);
    setEditFormData({ ...newNote });
    setIsEditingCurrentNote(true);
    onShowToast("📝 Created new pre-uploaded note draft for App Owner editing.");
  };

  const handleDeleteNote = (noteId: string) => {
    if (!ownerMode) return;
    if (notes.length <= 1) {
      onShowToast("Cannot delete the last remaining note.");
      return;
    }
    const updated = notes.filter((n) => n.id !== noteId);
    onSaveNotes(updated);
    setSelectedNoteId(updated[0]?.id || "");
    setIsEditingCurrentNote(false);
    onShowToast("🗑️ Topper note removed.");
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?notes=${activeNote?.id || "free"}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      onShowToast("📋 Shareable Topper Notes link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const branches = [
    "All",
    "Computer Science",
    "Information Technology",
    "AI-DS",
    "E&TC",
    "Electrical",
    "Mechanical",
    "Common 1st Year",
  ];

  const semesters = [
    "All",
    "Sem 1",
    "Sem 2",
    "Sem 3",
    "Sem 4",
    "Sem 5",
    "Sem 6",
    "Sem 7",
    "Sem 8",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="topper-notes-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <motion.div
            id="topper-notes-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`w-full max-w-6xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl flex flex-col border overflow-hidden ${
              isDark
                ? "bg-[#0B0F19] border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? "border-slate-800 bg-slate-900/80"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-base sm:text-lg font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Campus Topper Notes Vault
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isDark
                      ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/60"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  100% Free For Students
                </span>
              </div>
              <p
                className={`text-xs flex items-center gap-2 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                <span>Verified study materials & handwritten formula books</span>
                <span className="hidden sm:inline">•</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  Read-only for students
                  {ownerMode ? (
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold text-[10px] ml-1 ${
                        isDark
                          ? "bg-amber-900/40 text-amber-300"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      App Owner Verified
                    </span>
                  ) : null}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="header-upload-doc-btn"
              onClick={() => setIsUploadDocModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-transform hover:scale-102"
              title="Upload document file to Topper Vault"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
            {ownerMode && (
              <button
                id="owner-add-note-btn"
                onClick={handleAddNewNote}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Pre-Uploaded Note
              </button>
            )}
            <button
              id="close-topper-notes-modal-btn"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              }`}
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2-column layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Notes Catalog & Filter */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0 ${
              isDark
                ? "border-slate-800 bg-slate-950/70"
                : "border-slate-200 bg-slate-50/50"
            }`}
          >
            {/* Search and Filters */}
            <div
              className={`p-3.5 border-b space-y-2.5 ${
                isDark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  id="topper-notes-search-input"
                  type="text"
                  placeholder="Search subject, topic, formula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? "border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500 focus:bg-slate-800"
                      : "border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label
                    className={`font-semibold block mb-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className={`w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-indigo-500 ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={`font-semibold block mb-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className={`w-full px-2 py-1 rounded-lg border focus:ring-1 focus:ring-indigo-500 ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {semesters.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <button
                id="sidebar-upload-doc-btn"
                onClick={() => setIsUploadDocModalOpen(true)}
                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDark
                    ? "border-indigo-500/50 bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/60 hover:border-indigo-400"
                    : "border-indigo-300 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400"
                }`}
              >
                <FileUp className="w-4 h-4 text-indigo-500" />
                <span>+ Upload Document File</span>
              </button>

              <div
                className={`text-[11px] font-bold uppercase tracking-wider px-1 pt-1 ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Study Vault Catalog ({filteredNotes.length})
              </div>

              {filteredNotes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notes match your filters.
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      id={`topper-note-item-${note.id}`}
                      onClick={() => {
                        setSelectedNoteId(note.id);
                        setIsEditingCurrentNote(false);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? isDark
                            ? "bg-indigo-950/50 border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/50"
                            : "bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-400"
                          : isDark
                          ? "bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300"
                          : "bg-white hover:bg-slate-100/80 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isDark
                              ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {note.subject}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isDark
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-900/40"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          Free
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold line-clamp-2 leading-snug ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {note.title}
                      </h4>

                      {note.fileName && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                          <Paperclip className="w-3 h-3 shrink-0" />
                          <span className="truncate">{note.fileName}</span>
                          {note.fileSize && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/10 dark:bg-indigo-500/20 shrink-0">
                              {note.fileSize}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <GraduationCap className="w-3 h-3 text-amber-500" />
                          {note.branch} • {note.semester}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.readTimeMinutes} min read
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Read-only notification badge at bottom of sidebar */}
            <div
              className={`p-3 border-t text-[11px] flex items-center gap-2 ${
                isDark
                  ? "border-slate-800 bg-slate-900/80 text-slate-400"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Curated by University Toppers. Guaranteed syllabus accurate.
              </span>
            </div>
          </div>

          {/* Right Column: Note Reader & Owner Editor */}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              isDark ? "bg-[#0B0F19]" : "bg-white"
            }`}
          >
            {activeNote ? (
              <>
                {/* Note Detail Top Toolbar */}
                <div
                  className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/60"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("read")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "read"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : isDark
                          ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Full Study Guide
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("chapters")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "chapters"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : isDark
                          ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Modules & Formula Cards ({activeNote.chapters?.length || 0})
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="copy-topper-note-share-btn"
                      onClick={handleCopyLink}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors ${
                        isDark
                          ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                      title="Copy link to this free study guide"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{copiedLink ? "Link Copied" : "Share"}</span>
                    </button>

                    <button
                      id="export-google-docs-btn"
                      onClick={() => handleExportGoogleDoc(activeNote)}
                      disabled={isExportingDoc}
                      className="px-2.5 py-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      title="Open and edit this study guide in Google Docs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{isExportingDoc ? "Opening..." : "Google Docs"}</span>
                    </button>

                    {activeNote.fileUrl && (
                      <button
                        id="download-note-doc-btn"
                        onClick={() => handleDownloadFile(activeNote)}
                        className="px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        title="Download attached study document"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Download File</span>
                      </button>
                    )}

                    {ownerMode ? (
                      <button
                        id="owner-edit-note-btn"
                        onClick={() => {
                          if (isEditingCurrentNote) {
                            handleSaveEdit();
                          } else {
                            handleStartEdit(activeNote);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                          isEditingCurrentNote
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-amber-600 hover:bg-amber-700 text-white"
                        }`}
                      >
                        {isEditingCurrentNote ? (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Note
                          </>
                        )}
                      </button>
                    ) : (
                      <div
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold inline-flex items-center gap-1 select-none ${
                          isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-400"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                        title="Open access student study materials."
                      >
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                        <span>Verified Free</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Note Header Meta */}
                  <div
                    className={`space-y-2.5 pb-4 border-b ${
                      isDark ? "border-slate-800" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          isDark
                            ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {activeNote.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium ${
                          isDark
                            ? "bg-slate-800 text-slate-300 border border-slate-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {activeNote.branch} • {activeNote.semester}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold border ${
                          isDark
                            ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/50"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        100% Free Open Access
                      </span>
                      <span className="text-slate-400 ml-auto text-[11px]">
                        Updated {activeNote.lastUpdated}
                      </span>
                    </div>

                    <h1
                      className={`text-xl sm:text-2xl font-black leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {activeNote.title}
                    </h1>

                    {/* Author Byline */}
                    <div
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDark
                          ? "bg-amber-950/20 border-amber-900/40"
                          : "bg-amber-50/70 border-amber-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          {activeNote.author.charAt(0)}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold flex items-center gap-1.5 ${
                              isDark ? "text-slate-100" : "text-slate-900"
                            }`}
                          >
                            <span>{activeNote.author}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isDark
                                  ? "bg-amber-900/50 text-amber-300"
                                  : "bg-amber-200/80 text-amber-900"
                              }`}
                            >
                              {activeNote.authorRank || "Branch Rank 1"}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] block ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {activeNote.authorCollege || "Government College of Engineering"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`text-right text-[11px] hidden sm:block ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        <div
                          className={`font-bold ${
                            isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                        >
                          {activeNote.pagesCount} Master Pages
                        </div>
                        <span className="text-slate-500">
                          ~{activeNote.readTimeMinutes} mins revision
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {activeNote.description}
                    </p>

                    {/* Tags */}
                    {activeNote.tags && activeNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeNote.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              isDark
                                ? "bg-slate-800 text-slate-300 border-slate-700"
                                : "bg-slate-100 text-slate-600 border-transparent"
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attached Document Card & Preview */}
                  {activeNote.fileUrl && (
                    <div
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                        isDark
                          ? "bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-800/60"
                          : "bg-gradient-to-r from-indigo-50/80 to-blue-50/60 border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black truncate max-w-[280px]">
                              {activeNote.fileName || "Attached Study Document"}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                              {activeNote.fileSize || "Document File"}
                            </span>
                          </div>
                          <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Original document file ready for offline reading, printing, or studying
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <button
                          onClick={() => setShowDocPreview(!showDocPreview)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{showDocPreview ? "Hide Preview" : "Preview"}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadFile(activeNote)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform hover:scale-102"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Document Live Preview Frame */}
                  {activeNote.fileUrl && showDocPreview && (
                    <div className="rounded-2xl border border-indigo-500/40 overflow-hidden bg-slate-950 p-2 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between px-2 text-xs text-slate-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          Live Document Preview ({activeNote.fileName})
                        </span>
                        <a
                          href={activeNote.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in Full Window
                        </a>
                      </div>
                      <iframe
                        src={activeNote.fileUrl}
                        className="w-full h-[450px] rounded-xl border border-slate-800 bg-white"
                        title={activeNote.title}
                      />
                    </div>
                  )}

                  {/* App Owner Edit Form (When Active) */}
                  {ownerMode && isEditingCurrentNote && editFormData ? (
                    <div
                      className={`p-5 rounded-2xl border-2 space-y-4 animate-in fade-in duration-150 ${
                        isDark
                          ? "bg-amber-950/20 border-amber-600"
                          : "bg-amber-50/80 border-amber-400"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between border-b pb-2 ${
                          isDark ? "border-amber-800/50" : "border-amber-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-amber-500" />
                          <h3
                            className={`text-sm font-bold ${
                              isDark ? "text-amber-300" : "text-amber-950"
                            }`}
                          >
                            App Owner Editor (Restricted Access)
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditingCurrentNote(false)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            Note Title
                          </label>
                          <input
                            type="text"
                            value={editFormData.title || ""}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, title: e.target.value })
                            }
                            className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              isDark
                                ? "border-amber-700 bg-slate-900 text-white"
                                : "border-amber-300 bg-white"
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            Subject
                          </label>
                          <input
                            type="text"
                            value={editFormData.subject || ""}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, subject: e.target.value })
                            }
                            className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                              isDark
                                ? "border-amber-700 bg-slate-900 text-white"
                                : "border-amber-300 bg-white"
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            Branch
                          </label>
                          <select
                            value={editFormData.branch || "Computer Science"}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                branch: e.target.value as TopperNote["branch"],
                              })
                            }
                            className={`w-full p-2 rounded-xl border ${
                              isDark
                                ? "border-amber-700 bg-slate-900 text-slate-200"
                                : "border-amber-300 bg-white text-slate-800"
                            }`}
                          >
                            {branches.filter((b) => b !== "All").map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block font-bold mb-1 ${
                              isDark ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            Semester
                          </label>
                          <select
                            value={editFormData.semester || "Sem 3"}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                semester: e.target.value as TopperNote["semester"],
                              })
                            }
                            className={`w-full p-2 rounded-xl border ${
                              isDark
                                ? "border-amber-700 bg-slate-900 text-slate-200"
                                : "border-amber-300 bg-white text-slate-800"
                            }`}
                          >
                            {semesters.filter((s) => s !== "All").map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block font-bold mb-1 text-xs ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.description || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, description: e.target.value })
                          }
                          className={`w-full p-2 text-xs rounded-xl border ${
                            isDark
                              ? "border-amber-700 bg-slate-900 text-white"
                              : "border-amber-300 bg-white"
                          }`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block font-bold mb-1 text-xs ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          Study Guide Content (Markdown/Notes)
                        </label>
                        <textarea
                          rows={6}
                          value={editFormData.content || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, content: e.target.value })
                          }
                          className={`w-full p-2.5 font-mono text-xs rounded-xl border ${
                            isDark
                              ? "border-amber-700 bg-slate-900 text-white"
                              : "border-amber-300 bg-white"
                          }`}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(activeNote.id)}
                          className="text-xs text-rose-500 hover:text-rose-400 font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete This Pre-Uploaded Note
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md cursor-pointer"
                        >
                          Save Changes to Vault
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Tab 1: Full Study Guide Reading View */}
                  {activeTab === "read" && (
                    <div
                      className={`space-y-6 leading-relaxed text-sm ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl border flex items-start gap-3 ${
                          isDark
                            ? "bg-indigo-950/30 border-indigo-900/50"
                            : "bg-indigo-50/50 border-indigo-100"
                        }`}
                      >
                        <BookMarked className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div
                          className={`text-xs space-y-1 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          <strong
                            className={`block font-bold ${
                              isDark ? "text-indigo-300" : "text-indigo-900"
                            }`}
                          >
                            Free Student Read Mode
                          </strong>
                          <p>
                            You have unlimited free access to read, study, and revise this material. All formulas, derivations, and solved proofs have been compiled directly from high-scoring exam papers.
                          </p>
                        </div>
                      </div>

                      {/* Render note markdown/content */}
                      <div
                        className={`prose max-w-none text-xs sm:text-sm p-5 rounded-2xl border whitespace-pre-line font-sans ${
                          isDark
                            ? "bg-slate-900/60 border-slate-800 text-slate-200"
                            : "bg-slate-50/60 border-slate-200 text-slate-800"
                        }`}
                      >
                        {activeNote.content}
                      </div>

                      {/* Quick Chapter formula cards preview */}
                      <div className="space-y-3">
                        <h3
                          className={`text-sm font-black flex items-center gap-2 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>Key Exam Formulas & Highlights</span>
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                          {activeNote.chapters?.map((ch, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${
                                isDark
                                  ? "border-slate-800 bg-slate-900/70"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h4
                                  className={`text-xs font-bold ${
                                    isDark ? "text-slate-100" : "text-slate-900"
                                  }`}
                                >
                                  {ch.title}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isDark
                                      ? "bg-indigo-950/80 text-indigo-300 border border-indigo-900/40"
                                      : "bg-indigo-50 text-indigo-600"
                                  }`}
                                >
                                  Module {idx + 1}
                                </span>
                              </div>
                              <p
                                className={`text-xs ${
                                  isDark ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                {ch.summary}
                              </p>
                              {ch.keyFormulasOrTips && ch.keyFormulasOrTips.length > 0 && (
                                <ul
                                  className={`mt-2 space-y-1 p-2.5 rounded-xl border ${
                                    isDark
                                      ? "bg-slate-950/60 border-slate-800"
                                      : "bg-slate-50 border-slate-100"
                                  }`}
                                >
                                  {ch.keyFormulasOrTips.map((tip, tIdx) => (
                                    <li
                                      key={tIdx}
                                      className={`text-[11px] flex items-start gap-1.5 font-mono ${
                                        isDark ? "text-slate-300" : "text-slate-700"
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Modules & Formula Cards Detail */}
                  {activeTab === "chapters" && (
                    <div className="space-y-4">
                      {activeNote.chapters?.map((ch, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${
                            isDark
                              ? "border-slate-800 bg-slate-900/70"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between border-b pb-2.5 ${
                              isDark ? "border-slate-800" : "border-slate-100"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                High-Yield Module 0{idx + 1}
                              </span>
                              <h3
                                className={`text-sm font-bold ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {ch.title}
                              </h3>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isDark
                                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-900/50"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {ch.keyFormulasOrTips.length} Formulas
                            </span>
                          </div>

                          <p
                            className={`text-xs leading-relaxed ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {ch.summary}
                          </p>

                          <div className="space-y-1.5">
                            <h5
                              className={`text-[11px] font-bold uppercase ${
                                isDark ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              Exam Ready Formula Cards:
                            </h5>
                            <div className="space-y-2">
                              {ch.keyFormulasOrTips.map((formula, fIdx) => (
                                <div
                                  key={fIdx}
                                  className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
                                    isDark
                                      ? "bg-slate-950/70 border-slate-800 text-slate-200"
                                      : "bg-slate-50 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <span>{formula}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(formula);
                                      onShowToast("Copied formula to clipboard!");
                                    }}
                                    className={`p-1 rounded transition-colors ${
                                      isDark
                                        ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                        : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60"
                                    }`}
                                    title="Copy formula"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                Select a topper note from the catalog on the left to start reading for free.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs ${
            isDark
              ? "border-slate-800 bg-slate-900/90 text-slate-400"
              : "border-slate-200 bg-slate-50/80 text-slate-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Free Student Read Access Active</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Only app owner ({currentUserEmail === "ayushgadigone@gmail.com" ? "you" : "ayushgadigone@gmail.com"}) can modify or upload notes
            </span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            Close Vault
          </button>
        </div>

        {/* Upload Document Modal Dialog */}
        <AnimatePresence>
          {isUploadDocModalOpen && (
            <motion.div
              id="upload-doc-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
            >
              <motion.div
                id="upload-doc-modal-card"
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className={`w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
                  isDark ? "bg-[#0F172A] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                {/* Header */}
                <div
                  className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
                    isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">Upload Topper Document</h3>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Upload PDF, Word document, or pick directly from Google Drive
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsUploadDocModalOpen(false);
                      setUploadError(null);
                    }}
                    className={`p-1.5 rounded-lg ${
                      isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveUploadedDocument} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  {uploadError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* File Selection Box / Drag-and-Drop */}
                  <div>
                    <label className="block font-bold mb-1.5">Document File *</label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelection(file);
                      }}
                      className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all ${
                        isDragging
                          ? "border-indigo-500 bg-indigo-500/10 scale-99"
                          : uploadedFile
                          ? isDark
                            ? "border-emerald-500/50 bg-emerald-950/20"
                            : "border-emerald-300 bg-emerald-50/50"
                          : isDark
                          ? "border-slate-700 bg-slate-900/60 hover:border-indigo-500/60"
                          : "border-slate-300 bg-slate-50 hover:border-indigo-400"
                      }`}
                    >
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs truncate max-w-sm mx-auto">{uploadedFile.name}</div>
                            <span className="text-[11px] text-emerald-500 font-bold">
                              {uploadedFile.size} • Ready for upload
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <label className="text-[11px] text-indigo-400 font-bold hover:underline cursor-pointer">
                              Replace File
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileSelection(f);
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-slate-500">•</span>
                            <button
                              type="button"
                              onClick={handlePickFromGoogleDrive}
                              className="text-[11px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              Pick from Drive
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold">Drag and drop your study document here</p>
                            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Supports PDF, Word (DOCX), TXT, or scanned notes (up to 25MB)
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                              <FileUp className="w-3.5 h-3.5" />
                              <span>Browse Computer</span>
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileSelection(f);
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={handlePickFromGoogleDrive}
                              className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Pick from Google Drive</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Document Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Trees & Graphs Master Notes"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Subject *</label>
                      <input
                        type="text"
                        placeholder="e.g. Data Structures & Algorithms"
                        value={docSubject}
                        onChange={(e) => setDocSubject(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border focus:ring-2 focus:ring-indigo-500 ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Branch</label>
                      <select
                        value={docBranch}
                        onChange={(e) => setDocBranch(e.target.value as TopperNote["branch"])}
                        className={`w-full p-2.5 rounded-xl border ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                      >
                        {branches.filter((b) => b !== "All").map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Semester</label>
                      <select
                        value={docSemester}
                        onChange={(e) => setDocSemester(e.target.value as TopperNote["semester"])}
                        className={`w-full p-2.5 rounded-xl border ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                      >
                        {semesters.filter((s) => s !== "All").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Topper / Author Name</label>
                      <input
                        type="text"
                        value={docAuthor}
                        onChange={(e) => setDocAuthor(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Topper Rank / Credential</label>
                      <input
                        type="text"
                        placeholder="e.g. Branch Rank 1 (9.84 CGPA)"
                        value={docAuthorRank}
                        onChange={(e) => setDocAuthorRank(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Description & Exam Advice</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what this document covers (e.g. Insem derivations, high-weightage proofs, standard numerical formulas)..."
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border ${
                        isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadDocModalOpen(false);
                        setUploadError(null);
                      }}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold shadow-md cursor-pointer transition-transform hover:scale-102 flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload & Add to Vault</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
