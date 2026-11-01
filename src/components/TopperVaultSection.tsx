import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  Download,
  Share2,
  HardDrive,
  FileCheck,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Paperclip,
} from "lucide-react";
import { TopperNote } from "../types";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";

interface TopperVaultSectionProps {
  notes: TopperNote[];
  onOpenNotesModal: (initialSubject?: string) => void;
  onOpenGoogleDrive?: () => void;
  onShowToast: (msg: string) => void;
  isOnline?: boolean;
}

export const TopperVaultSection: React.FC<TopperVaultSectionProps> = ({
  notes,
  onOpenNotesModal,
  onOpenGoogleDrive,
  onShowToast,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("All");

  const semesters = ["All", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (selectedSemester !== "All" && note.semester !== selectedSemester) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = note.title.toLowerCase().includes(q);
        const matchSubject = note.subject.toLowerCase().includes(q);
        const matchAuthor = note.author.toLowerCase().includes(q);
        const matchDept = note.branch.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchAuthor && !matchDept) return false;
      }
      return true;
    });
  }, [notes, selectedSemester, searchQuery]);

  const handleOpenNote = (note: TopperNote) => {
    triggerHaptic("medium");
    onOpenNotesModal(note.subject);
  };

  const handleUploadClick = () => {
    triggerHaptic("heavy");
    onOpenNotesModal();
  };

  return (
    <div
      id="topper-vault-section-container"
      className="w-full space-y-6 animate-in fade-in duration-200"
    >
      {/* Banner Card */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border shadow-sm relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border-emerald-500/30 text-white"
            : "bg-gradient-to-br from-emerald-50 via-white to-indigo-50 border-emerald-200 text-slate-900"
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                100% Free Campus Archive
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              PVG&apos;s COET Verified Topper Notes Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              SPPU syllabus-aligned handwritten notes, numerical problem walkthroughs, and previous year exam questions curated by departmental toppers.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleUploadClick}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document File</span>
            </button>

            {onOpenGoogleDrive && (
              <button
                type="button"
                onClick={onOpenGoogleDrive}
                className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                }`}
              >
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span>Drive & Docs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by subject, topic or author..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-2xs"
            }`}
          />
        </div>

        {/* Semester Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {semesters.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setSelectedSemester(sem);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSemester === sem
                  ? "bg-emerald-600 text-white shadow-xs"
                  : isDark
                  ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredNotes.map((note) => {
          const totalChapters = note.chapters?.length || 0;
          const hasDoc = !!note.fileName;

          return (
            <div
              key={note.id}
              onClick={() => handleOpenNote(note)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg ${
                isDark
                  ? "bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/40"
                  : "bg-white hover:bg-emerald-50/20 border-slate-200 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    {note.subject}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {note.semester}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {note.description}
                </p>

                {/* Metadata pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{note.author} {note.authorRank ? `(${note.authorRank})` : ""}</span>
                  </span>
                  <span>•</span>
                  <span>{totalChapters} Chapters</span>
                  {hasDoc && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                        <Paperclip className="w-3 h-3" />
                        <span>{note.fileName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer Action */}
              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  isDark ? "border-slate-800 text-emerald-400" : "border-slate-100 text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Reader</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div
          className={`text-center py-12 px-4 rounded-2xl border ${
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}
        >
          <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No notes found matching &ldquo;{searchQuery}&rdquo;
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or semester filter.
          </p>
        </div>
      )}
    </div>
  );
};
