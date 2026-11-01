/**
 * Google Picker API Integration
 * Implements client-side Google Picker widget to select study notes, PDFs, and docs from Google Drive.
 */

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

export interface PickedFileResult {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes?: number;
  description?: string;
  iconUrl?: string;
}

/**
 * Ensures Google API script and Picker library are loaded in the browser.
 */
export function loadPickerLibrary(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.picker) {
      resolve();
      return;
    }

    if (window.gapi) {
      window.gapi.load("picker", {
        callback: () => resolve(),
        onerror: () => reject(new Error("Failed to load Google Picker via gapi")),
      });
      return;
    }

    // Dynamic fallback load if script wasn't ready
    const existingScript = document.querySelector('script[src*="apis.google.com/js/api.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.gapi) {
          window.gapi.load("picker", {
            callback: () => resolve(),
            onerror: () => reject(new Error("Failed to load Google Picker via gapi")),
          });
        } else {
          reject(new Error("gapi not available after script load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load Google API script"));
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.gapi) {
          clearInterval(interval);
          window.gapi.load("picker", {
            callback: () => resolve(),
            onerror: () => reject(new Error("Failed to load Google Picker")),
          });
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        if (!window.google?.picker) {
          reject(new Error("Timeout loading Google Picker library"));
        }
      }, 5000);
    }
  });
}

/**
 * Opens Google Picker modal dialog to allow user to pick documents or files from Google Drive.
 */
export async function openGooglePicker(options: {
  accessToken: string;
  onPick: (pickedFile: PickedFileResult) => void;
  onCancel?: () => void;
  title?: string;
}): Promise<void> {
  const { accessToken, onPick, onCancel, title = "Select Study Notes or Document" } = options;

  await loadPickerLibrary();

  const pickerOrigin =
    window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  const callback = (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const doc = data.docs?.[0];
      if (doc) {
        onPick({
          id: doc.id,
          name: doc.name,
          mimeType: doc.mimeType,
          url: doc.url,
          sizeBytes: doc.sizeBytes,
          description: doc.description,
          iconUrl: doc.iconUrl,
        });
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      if (onCancel) onCancel();
    }
  };

  const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false);

  const builder = new window.google.picker.PickerBuilder()
    .setTitle(title)
    .addView(docsView)
    .setOAuthToken(accessToken)
    .setCallback(callback)
    .setOrigin(pickerOrigin);

  const picker = builder.build();
  picker.setVisible(true);
}
