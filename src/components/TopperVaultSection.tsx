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
  Download,
  Share2,
} from "lucide-react";
import { TopperNote } from "../types";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";
import {
  downloadTopperNoteLocally,
  saveTopperNoteToGoogleDrive,
  shareTopperNote,
} from "../utils/topperNotesStorage";

interface TopperVaultSectionProps {
  notes: TopperNote[];
  onOpenNotesModal: (initialNoteId?: string, openUpload?: boolean) => void;
  onOpenGoogleDrive?: () => void;
  onShowToast: (msg: string) => void;
  isOnline?: boolean;
}

export const TopperVaultSection: React.FC<TopperVaultSectionProps> = ({
  notes,
  onOpenNotesModal,
  onOpenGoogleDrive,
  onShowToast,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("All");
  const [savingDriveNoteId, setSavingDriveNoteId] = useState<string | null>(null);

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
    onOpenNotesModal(note.id, false);
  };

  const handleUploadClick = () => {
    triggerHaptic("heavy");
    onOpenNotesModal(undefined, true);
  };

  const handleShareNote = async (e: React.MouseEvent, note: TopperNote) => {
    e.stopPropagation();
    triggerHaptic("light");
    try {
      const outcome = await shareTopperNote(note);
      onShowToast(
        outcome === "shared"
          ? `Shared "${note.title}"`
          : `Shareable link copied for "${note.title}"`
      );
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        onShowToast("Could not share this document right now.");
      }
    }
  };

  const handleDownloadLocal = async (e: React.MouseEvent, note: TopperNote) => {
    e.stopPropagation();
    triggerHaptic("medium");
    try {
      const fileName = await downloadTopperNoteLocally(note);
      onShowToast(`Downloading "${fileName}" to your device...`);
    } catch (err: any) {
      onShowToast(err?.message || "Could not download this document.");
    }
  };

  const handleSaveToDrive = async (e: React.MouseEvent, note: TopperNote) => {
    e.stopPropagation();
    triggerHaptic("medium");
    setSavingDriveNoteId(note.id);
    try {
      onShowToast(`Saving "${note.title}" to Google Drive...`);
      const uploaded = await saveTopperNoteToGoogleDrive(note);
      onShowToast(`Saved "${uploaded.name}" to Google Drive!`);
    } catch (err: any) {
      onShowToast(err?.message || "Could not save document to Google Drive.");
    } finally {
      setSavingDriveNoteId(null);
    }
  };

  return (
    <div id="topper-vault-section-container" className="w-full space-y-6">
      {/* Nordic Pine Editorial Banner */}
      <div
        className={`p-5 sm:p-8 rounded-2xl border ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
            : "bg-[#F3F5F2] border-[#DFE6E2] text-[#18201C]"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl text-left">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
              }`}
            >
              100% FREE CAMPUS ARCHIVE
            </p>
            <h2
              className={`text-xl sm:text-[30px] font-normal tracking-tight leading-tight ${
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
              SPPU syllabus-aligned handwritten notes, numerical problem walkthroughs, and previous year exam questions across Sem 1 to Sem 8.
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
              <Upload className="w-4 h-4 text-white" />
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by subject, topic or contributor..."
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#73847D]"
                : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#7C8B83]"
            }`}
          />
        </div>

        {/* Semester Filter Tabs (All, Sem 1 - Sem 8) */}
        <div className="flex flex-wrap items-center gap-1.5 py-0.5">
          {semesters.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setSelectedSemester(sem);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
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
          const isSavingDrive = savingDriveNoteId === note.id;

          return (
            <div
              key={note.id}
              onClick={() => handleOpenNote(note)}
              className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between gap-4 ${
                isDark
                  ? "bg-[#141A18] hover:bg-[#19211E] border-[#242E2A] hover:border-[#34433D]"
                  : "bg-white hover:bg-[#F9FBFA] border-[#DFE6E2] hover:border-[#C4D1CA]"
              }`}
            >
              <div className="space-y-2.5 text-left">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border truncate ${
                      isDark
                        ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                        : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                    }`}
                  >
                    {note.subject}
                  </span>
                  <span
                    className={`text-[11px] font-mono shrink-0 ${
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
                      className={`w-3.5 h-3.5 shrink-0 ${
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
                        className={`font-semibold flex items-center gap-0.5 max-w-full truncate ${
                          isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                        }`}
                      >
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="truncate">{note.fileName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Document Actions (Share, Local Download, Save to Drive) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleShareNote(e, note)}
                    title="Share document link"
                    className={`h-8 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "border-[#242E2A] bg-[#1B2320] text-[#ECF2EF] hover:bg-[#242E2A]"
                        : "border-[#DFE6E2] bg-[#F7F9F8] text-[#18201C] hover:bg-[#EFF4F1]"
                    }`}
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadLocal(e, note)}
                    title="Download locally to device"
                    className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold text-white inline-flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-[#387262] hover:bg-[#448573]"
                        : "bg-[#2F5D50] hover:bg-[#244A3F]"
                    }`}
                  >
                    <Download className="w-3 h-3 text-white" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingDrive}
                    onClick={(e) => handleSaveToDrive(e, note)}
                    title="Save to Google Drive"
                    className={`h-8 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 ${
                      isDark
                        ? "border-[#2A4A40] bg-[#182823] text-[#ECF2EF] hover:bg-[#1F352E]"
                        : "border-[#C4D9D1] bg-[#EFF4F1] text-[#18201C] hover:bg-[#E2ECE7]"
                    }`}
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>{isSavingDrive ? "Saving..." : "Save to Drive"}</span>
                  </button>
                </div>

                {/* Bottom Card Footer Action */}
                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
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
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div
          className={`text-center py-12 px-4 rounded-2xl border space-y-3 ${
            isDark
              ? "bg-[#141A18] border-[#242E2A]"
              : "bg-white border-[#DFE6E2]"
          }`}
        >
          <GraduationCap
            className={`w-8 h-8 mx-auto ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          />
          <div>
            <h4
              className={`text-sm font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              {searchQuery
                ? `No notes found matching "${searchQuery}"`
                : `No notes uploaded yet for ${selectedSemester}`}
            </h4>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Be the first student to upload notes for {selectedSemester === "All" ? "this subject" : selectedSemester}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUploadClick}
            className={`h-9 px-4 rounded-xl text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? "bg-[#387262] hover:bg-[#448573]"
                : "bg-[#2F5D50] hover:bg-[#244A3F]"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>Upload Notes</span>
          </button>
        </div>
      )}
    </div>
  );
};
