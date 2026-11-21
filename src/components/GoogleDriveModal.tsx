import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  FileText,
  Upload,
  Plus,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  RefreshCw,
  Sparkles,
  FileUp,
  FileSpreadsheet,
  File,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { listDriveFiles, uploadFileToDrive, DriveFileItem } from "../lib/googleDrive";
import { openGooglePicker, PickedFileResult } from "../lib/googlePicker";
import { createGoogleDoc } from "../lib/googleDocs";
import { getAccessToken, googleSignIn } from "../lib/firebase";

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
  onShowToast: (msg: string) => void;
  onSelectDocForTopperVault?: (doc: { title: string; fileUrl: string; fileName: string; fileSize?: string }) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onShowToast,
  onSelectDocForTopperVault,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"browse" | "picker" | "create_doc" | "upload">("browse");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [recentPickedFiles, setRecentPickedFiles] = useState<PickedFileResult[]>([]);

  // Create Doc state
  const [newDocTitle, setNewDocTitle] = useState("");
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  // Upload to Drive state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkTokenAndLoadFiles();
    }
  }, [isOpen]);

  const checkTokenAndLoadFiles = async () => {
    setErrorMessage(null);
    const token = await getAccessToken();
    setAccessToken(token);
    if (token) {
      fetchFiles(token);
    }
  };

  const handleConnectGoogle = async () => {
    setIsLoadingAuth(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        onShowToast("✅ Google Drive & Docs connected successfully!");
        fetchFiles(res.accessToken);
      } else {
        setErrorMessage("Please complete Google authentication to access Drive & Docs.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchFiles = async (token: string, queryText?: string) => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      let mimeFilter: string | undefined = undefined;
      if (selectedFilter === "docs") {
        mimeFilter = "application/vnd.google-apps.document";
      } else if (selectedFilter === "pdf") {
        mimeFilter = "application/pdf";
      }

      const res = await listDriveFiles(token, {
        query: queryText || searchQuery,
        mimeTypeFilter: mimeFilter,
        pageSize: 25,
      });
      setFiles(res.files);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not load files from Google Drive.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLaunchPicker = async () => {
    if (!accessToken) {
      onShowToast("Please connect your Google Account first.");
      return;
    }

    try {
      await openGooglePicker({
        accessToken,
        title: "Select Study Notes or Files from Google Drive",
        onPick: (picked) => {
          setRecentPickedFiles((prev) => [picked, ...prev.filter((p) => p.id !== picked.id)]);
          onShowToast(`Selected "${picked.name}" from Google Drive!`);
          if (onSelectDocForTopperVault) {
            onSelectDocForTopperVault({
              title: picked.name.replace(/\.[^/.]+$/, ""),
              fileName: picked.name,
              fileUrl: picked.url,
              fileSize: picked.sizeBytes ? `${Math.round(picked.sizeBytes / 1024)} KB` : "Drive Doc",
            });
          }
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to launch Google Picker.");
    }
  };

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      onShowToast("Please connect Google Account first.");
      return;
    }
    if (!newDocTitle.trim()) {
      setErrorMessage("Please enter a title for your new Google Doc.");
      return;
    }

    setIsCreatingDoc(true);
    setErrorMessage(null);
    try {
      const doc = await createGoogleDoc(accessToken, newDocTitle.trim());
      onShowToast("📄 Google Doc created successfully!");
      setNewDocTitle("");
      window.open(doc.url, "_blank");
      fetchFiles(accessToken);
      setActiveTab("browse");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create Google Doc.");
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleUploadFileToDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      onShowToast("Please connect Google Account first.");
      return;
    }
    if (!uploadFile) {
      setErrorMessage("Please choose a file to upload.");
      return;
    }

    setIsUploadingToDrive(true);
    setErrorMessage(null);
    try {
      const result = await uploadFileToDrive(accessToken, uploadFile, uploadFile.name, {
        description: uploadDescription || "Uploaded from Campus Resale & Exchange",
      });
      onShowToast(`🎉 "${result.name}" uploaded to Google Drive!`);
      setUploadFile(null);
      setUploadDescription("");
      fetchFiles(accessToken);
      setActiveTab("browse");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload file to Google Drive.");
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.includes("document")) return <FileText className="w-5 h-5 text-[#2F5D50]" />;
    if (mimeType.includes("pdf")) return <File className="w-5 h-5 text-rose-500" />;
    if (mimeType.includes("spreadsheet")) return <FileSpreadsheet className="w-5 h-5 text-[#2F5D50]" />;
    return <FolderOpen className="w-5 h-5 text-[#2F5D50]" />;
  };

  if (!isOpen) return null;

  return (
        <div
          id="google-drive-modal-overlay"
          className="fixed inset-0 z-50 bg-[#141A18] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            id="google-drive-modal-card"
            className={`w-full max-w-4xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col border overflow-hidden ${
              isDark ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]" : "bg-white border-[#DFE6E2] text-[#18201C]"
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
                isDark ? "border-[#242E2A] bg-[#141A18]" : "border-[#DFE6E2] bg-[#F7F9F8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2F5D50] dark:bg-[#387262] flex items-center justify-center text-white shadow-md">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black">Google Drive & Docs Hub</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2F5D50] text-[#2F5D50] dark:text-[#7BBFA8] border border-[#5BA18C]">
                      Official Workspace APIs
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Browse study materials, pick files with Google Picker, and create Google Docs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!accessToken && (
                  <button
                    onClick={handleConnectGoogle}
                    disabled={isLoadingAuth}
                    className="px-3 py-1.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isLoadingAuth ? "Connecting..." : "Connect Google"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isDark ? "text-[#8FA199] hover:text-white hover:bg-[#1B2320]" : "text-[#8FA199] hover:text-[#5C6B63] hover:bg-[#DFE6E2]"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header Navigation Tabs */}
            <div
              className={`px-6 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-bold ${
                isDark ? "border-[#242E2A] bg-[#0D1110]" : "border-[#DFE6E2] bg-[#EFF4F1]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "browse"
                      ? "bg-[#2F5D50] text-white shadow-xs"
                      : isDark
                      ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#DFE6E2]"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse My Drive</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("picker");
                    handleLaunchPicker();
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "picker"
                      ? "bg-[#2F5D50] text-white shadow-xs"
                      : isDark
                      ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#DFE6E2]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#DFC29B]" />
                  <span>Google Picker</span>
                </button>

                <button
                  onClick={() => setActiveTab("create_doc")}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "create_doc"
                      ? "bg-[#2F5D50] text-white shadow-xs"
                      : isDark
                      ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#DFE6E2]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Google Doc</span>
                </button>

                <button
                  onClick={() => setActiveTab("upload")}
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "upload"
                      ? "bg-[#2F5D50] text-white shadow-xs"
                      : isDark
                      ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#DFE6E2]"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload to Drive</span>
                </button>
              </div>

              {accessToken && (
                <button
                  onClick={() => fetchFiles(accessToken)}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark ? "text-[#8FA199] hover:text-white" : "text-[#5C6B63] hover:text-[#18201C]"
                  }`}
                  title="Refresh files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? "text-[#7BBFA8]" : ""}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!accessToken ? (
                <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-[#2F5D50] border border-[#5BA18C] text-[#2F5D50] flex items-center justify-center mx-auto shadow-inner">
                    <HardDrive className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Connect Your Google Drive & Docs</h3>
                    <p className={`text-xs mt-1 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                      Sign in with Google to browse and import study notes, launch Google Picker, and create shared Google Docs.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectGoogle}
                    disabled={isLoadingAuth}
                    className="px-5 py-2.5 rounded-2xl bg-[#2F5D50] dark:bg-[#387262] hover:bg-[#244A3F] dark:hover:bg-[#448573] text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isLoadingAuth ? "Connecting..." : "Sign in with Google"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Tab 1: Browse My Drive */}
                  {activeTab === "browse" && (
                    <div className="space-y-4">
                      {/* Search & Filters */}
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8FA199]" />
                          <input
                            type="text"
                            placeholder="Search files in Google Drive..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchFiles(accessToken)}
                            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                              isDark ? "bg-[#141A18] border-[#242E2A] text-white" : "bg-white border-[#DFE6E2] text-[#18201C]"
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={selectedFilter}
                            onChange={(e) => {
                              setSelectedFilter(e.target.value);
                            }}
                            className={`px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-[#2F5D50] ${
                              isDark ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]" : "bg-white border-[#DFE6E2] text-[#18201C]"
                            }`}
                          >
                            <option value="all">All File Types</option>
                            <option value="docs">Google Docs</option>
                            <option value="pdf">PDF Documents</option>
                          </select>

                          <button
                            onClick={() => fetchFiles(accessToken)}
                            className="px-3 py-2 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white text-xs font-bold cursor-pointer"
                          >
                            Search
                          </button>
                        </div>
                      </div>

                      {/* File Grid / List */}
                      {isLoadingFiles ? (
                        <div className="py-12 text-center text-xs text-[#8FA199] flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 text-[#7BBFA8]" />
                          <span>Loading files from Google Drive...</span>
                        </div>
                      ) : files.length === 0 ? (
                        <div className="py-12 text-center space-y-2">
                          <FolderOpen className="w-10 h-10 mx-auto text-[#8FA199] opacity-60" />
                          <p className="text-xs text-[#8FA199] font-semibold">No files found matching your search.</p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedFilter("all");
                              fetchFiles(accessToken, "");
                            }}
                            className="text-xs text-[#7BBFA8] font-bold hover:underline"
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all hover:shadow-md ${
                                isDark ? "bg-[#141A18] border-[#242E2A] hover:border-[#242E2A]" : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-[#EFF4F1] dark:bg-[#1B2320] shrink-0">
                                {getMimeIcon(file.mimeType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold truncate leading-tight" title={file.name}>
                                  {file.name}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-[#8FA199] mt-1">
                                  <span>{file.mimeType.split(".").pop()}</span>
                                  {file.size && <span>• {Math.round(Number(file.size) / 1024)} KB</span>}
                                  {file.modifiedTime && (
                                    <span>• {new Date(file.modifiedTime).toLocaleDateString()}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-[#DFE6E2] dark:border-[#242E2A]">
                                  {file.webViewLink && (
                                    <a
                                      href={file.webViewLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] font-bold text-[#2F5D50] hover:text-[#7BBFA8] inline-flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Open
                                    </a>
                                  )}
                                  {onSelectDocForTopperVault && (
                                    <button
                                      onClick={() => {
                                        onSelectDocForTopperVault({
                                          title: file.name.replace(/\.[^/.]+$/, ""),
                                          fileName: file.name,
                                          fileUrl: file.webViewLink || "",
                                          fileSize: file.size ? `${Math.round(Number(file.size) / 1024)} KB` : undefined,
                                        });
                                        onClose();
                                        onShowToast(`Imported "${file.name}" into Topper Vault!`);
                                      }}
                                      className="text-[11px] font-bold text-[#2F5D50] hover:text-[#7BBFA8] ml-auto cursor-pointer"
                                    >
                                      + Add to Vault
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Google Picker */}
                  {activeTab === "picker" && (
                    <div className="space-y-6 text-center py-6">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-base font-black">Google Picker Interactive Dialog</h3>
                        <p className={`text-xs mt-1 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                          Use the Google Picker widget to select study materials, handwritten scans, or Google Docs directly from your cloud Drive.
                        </p>
                      </div>

                      <button
                        onClick={handleLaunchPicker}
                        className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Launch Google Picker Window</span>
                      </button>

                      {recentPickedFiles.length > 0 && (
                        <div className="text-left pt-6 max-w-xl mx-auto space-y-2">
                          <h4 className="text-xs font-black uppercase text-[#8FA199] tracking-wider">
                            Recently Picked Documents
                          </h4>
                          <div className="space-y-2">
                            {recentPickedFiles.map((doc) => (
                              <div
                                key={doc.id}
                                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                                  isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-white border-[#DFE6E2]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <FileText className="w-4 h-4 text-[#2F5D50] shrink-0" />
                                  <span className="text-xs font-bold truncate">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#7BBFA8] hover:bg-[#244A3F] inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Open
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Create Google Doc */}
                  {activeTab === "create_doc" && (
                    <form onSubmit={handleCreateNewDoc} className="max-w-lg mx-auto space-y-4 py-4">
                      <div className="text-center space-y-1">
                        <FileText className="w-10 h-10 text-[#2F5D50] mx-auto" />
                        <h3 className="text-base font-black">Create a New Google Doc</h3>
                        <p className={`text-xs ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                          Generates a new study guide or shared notebook in your Google Drive.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">Document Title *</label>
                        <input
                          type="text"
                          placeholder="e.g., Engineering Mathematics III Unit 2 Formulas"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-[#2F5D50] ${
                            isDark ? "bg-[#141A18] border-[#242E2A] text-white" : "bg-white border-[#C4D1CA] text-[#18201C]"
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isCreatingDoc}
                        className="w-full py-2.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isCreatingDoc ? "Creating Google Doc..." : "Create & Open in Google Docs"}</span>
                      </button>
                    </form>
                  )}

                  {/* Tab 4: Upload to Drive */}
                  {activeTab === "upload" && (
                    <form onSubmit={handleUploadFileToDrive} className="max-w-lg mx-auto space-y-4 py-4">
                      <div className="text-center space-y-1">
                        <Upload className="w-10 h-10 text-[#2F5D50] mx-auto" />
                        <h3 className="text-base font-black">Upload File to Google Drive</h3>
                        <p className={`text-xs ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                          Save study PDFs, handwritten exam notes, or course files to your Google Drive.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">Select File *</label>
                        <input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className={`w-full p-2 text-xs rounded-xl border file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#2F5D50] file:text-white cursor-pointer ${
                            isDark ? "bg-[#141A18] border-[#242E2A] text-[#C5D3CC]" : "bg-white border-[#C4D1CA] text-[#5C6B63]"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., SPPU Semester 4 Model Exam Solutions"
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-[#2F5D50] ${
                            isDark ? "bg-[#141A18] border-[#242E2A] text-white" : "bg-white border-[#C4D1CA] text-[#18201C]"
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUploadingToDrive || !uploadFile}
                        className="w-full py-2.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingToDrive ? "Uploading to Drive..." : "Upload to Google Drive"}</span>
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
                isDark ? "border-[#242E2A] bg-[#141A18] text-[#8FA199]" : "border-[#DFE6E2] bg-[#F7F9F8] text-[#5C6B63]"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2F5D50]" />
                <span>Protected by Google Workspace OAuth • Direct client-side access</span>
              </div>
              <button
                onClick={onClose}
                className={`px-3 py-1 rounded-lg font-bold ${
                  isDark ? "hover:bg-[#1B2320] text-[#ECF2EF]" : "hover:bg-[#DFE6E2] text-[#5C6B63]"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
  );
};
