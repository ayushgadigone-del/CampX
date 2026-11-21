import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  Upload,
  CheckCircle2,
  HardDrive,
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
    <div id="topper-vault-section-container" className="w-full space-y-6">
      {/* Nordic Pine Editorial Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
            : "bg-[#F3F5F2] border-[#DFE6E2] text-[#18201C]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
              }`}
            >
              100% FREE CAMPUS ARCHIVE
            </p>
            <h2
              className={`text-2xl sm:text-[30px] font-normal tracking-tight leading-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              PVG&apos;s COET Topper Notes Vault.
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              SPPU syllabus-aligned handwritten notes, numerical problem walkthroughs, and previous year exam questions curated by departmental seniors.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleUploadClick}
              className={`h-10 px-4 rounded-xl text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-[#387262] hover:bg-[#448573]"
                  : "bg-[#2F5D50] hover:bg-[#244A3F]"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document File</span>
            </button>

            {onOpenGoogleDrive && (
              <button
                type="button"
                onClick={onOpenGoogleDrive}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#242E2A]"
                    : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
                }`}
              >
                <HardDrive
                  className={`w-4 h-4 ${
                    isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                  }`}
                />
                <span>Drive &amp; Docs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by subject, topic or author..."
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#73847D]"
                : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#7C8B83]"
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                selectedSemester === sem
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262]"
                    : "bg-[#2F5D50] text-white border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320] border-[#242E2A]"
                  : "bg-white text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1] border-[#DFE6E2]"
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
              className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between ${
                isDark
                  ? "bg-[#141A18] hover:bg-[#19211E] border-[#242E2A] hover:border-[#34433D]"
                  : "bg-white hover:bg-[#F9FBFA] border-[#DFE6E2] hover:border-[#C4D1CA]"
              }`}
            >
              <div className="space-y-2.5 text-left">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                      isDark
                        ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                        : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                    }`}
                  >
                    {note.subject}
                  </span>
                  <span
                    className={`text-[11px] font-mono ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    {note.semester}
                  </span>
                </div>

                <h3
                  className={`text-sm sm:text-[15px] font-semibold line-clamp-2 ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {note.title}
                </h3>

                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  {note.description}
                </p>

                {/* Metadata */}
                <div
                  className={`flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                      }`}
                    />
                    <span>
                      {note.author} {note.authorRank ? `(${note.authorRank})` : ""}
                    </span>
                  </span>
                  <span>·</span>
                  <span>{totalChapters} Chapters</span>
                  {hasDoc && (
                    <>
                      <span>·</span>
                      <span
                        className={`font-semibold flex items-center gap-0.5 ${
                          isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                        }`}
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{note.fileName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer Action */}
              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                  isDark
                    ? "border-[#242E2A] text-[#7BBFA8]"
                    : "border-[#DFE6E2] text-[#2F5D50]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Reader</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div
          className={`text-center py-12 px-4 rounded-2xl border ${
            isDark
              ? "bg-[#141A18] border-[#242E2A]"
              : "bg-white border-[#DFE6E2]"
          }`}
        >
          <GraduationCap
            className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          />
          <h4
            className={`text-sm font-semibold ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            No notes found matching &ldquo;{searchQuery}&rdquo;
          </h4>
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            Try adjusting your search terms or semester filter.
          </p>
        </div>
      )}
    </div>
  );
};
