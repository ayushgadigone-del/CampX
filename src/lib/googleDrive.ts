/**
 * Google Drive API Client for Campus Resale & Exchange
 * Supports browsing, searching, and uploading study materials and documents.
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
  modifiedTime?: string;
}

/**
 * List files from the user's Google Drive with optional query.
 */
export async function listDriveFiles(
  accessToken: string,
  options: {
    query?: string;
    mimeTypeFilter?: string;
    pageSize?: number;
  } = {}
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const { query, mimeTypeFilter, pageSize = 20 } = options;

  let q = "trashed = false";
  if (mimeTypeFilter) {
    q += ` and mimeType = '${mimeTypeFilter}'`;
  }
  if (query && query.trim()) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const params = new URLSearchParams({
    q,
    pageSize: String(pageSize),
    fields: "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, iconLink, thumbnailLink, size, modifiedTime)",
    orderBy: "modifiedTime desc",
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Drive request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Upload a study document or note file to Google Drive.
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File | Blob,
  fileName: string,
  options: {
    description?: string;
    folderId?: string;
  } = {}
): Promise<DriveFileItem> {
  const metadata: any = {
    name: fileName,
    mimeType: file.type || "application/octet-stream",
  };

  if (options.description) {
    metadata.description = options.description;
  }
  if (options.folderId) {
    metadata.parents = [options.folderId];
  }

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const fileData = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileData);

  const multipartRequestBody = [
    delimiter,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${file.type || "application/octet-stream"}\r\n`,
    "Content-Transfer-Encoding: base64\r\n\r\n",
    btoa(
      fileBytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
    ),
    closeDelim,
  ].join("");

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to upload file to Google Drive: status ${response.status}`
    );
  }

  return response.json();
}
