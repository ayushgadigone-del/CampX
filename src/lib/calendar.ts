import { getAccessToken } from "./firebase";

export interface CreateEventParams {
  itemTitle: string;
  itemPrice: number;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  otherPartyName: string;
  otherPartyEmail?: string;
  notes?: string;
}

export interface GoogleCalendarEventResponse {
  id: string;
  htmlLink: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
}

export async function createHandoverCalendarEvent(
  params: CreateEventParams
): Promise<GoogleCalendarEventResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error(
      "Google Calendar access token is not available. Please sign in with Google to grant Calendar permissions."
    );
  }

  // Calculate start & end ISO strings (30 min duration)
  const startDateTime = new Date(`${params.startDate}T${params.startTime}:00`);
  if (isNaN(startDateTime.getTime())) {
    throw new Error("Invalid handover date or time format.");
  }
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

  const eventPayload: any = {
    summary: `Campus Handover: ${params.itemTitle}`,
    description: `🤝 Campus Resale & Exchange Handover & Inspection\n\n` +
      `📦 Item: ${params.itemTitle}\n` +
      `💰 Amount: ₹${params.itemPrice}\n` +
      `📍 Campus Location: ${params.location}\n` +
      `👤 Meeting with: ${params.otherPartyName} (${params.otherPartyEmail || "Campus Peer"})\n` +
      `📝 Notes: ${params.notes || "Inspect item condition thoroughly before completing payment."}\n\n` +
      `Organized via Campus Resale & Exchange Platform`,
    location: `${params.location}, College Campus`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "email", minutes: 60 },
      ],
    },
  };

  if (params.otherPartyEmail && params.otherPartyEmail.includes("@")) {
    eventPayload.attendees = [{ email: params.otherPartyEmail }];
  }

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Calendar API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function fetchUpcomingHandoverEvents(): Promise<GoogleCalendarEventResponse[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=Campus%20Handover&timeMin=${encodeURIComponent(
    now
  )}&singleEvents=true&orderBy=startTime&maxResults=10`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn("Could not fetch calendar events:", err);
    return [];
  }
}
