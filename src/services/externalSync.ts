import { gapi } from 'gapi-script';
import { ScheduleItem } from '../types';
import { showToast } from '../context/ToastContext';
import { captureError } from './monitoring';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/fitness.activity.read';

/**
 * GOOGLE CALENDAR & FIT INTEGRATION
 */
export const initGoogleApi = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      gapi.load('client:auth2', async () => {
        await gapi.client.init({
          clientId: CLIENT_ID,
          scope: SCOPES,
        });
        resolve(true);
      });
    } catch (error) {
      captureError(error);
      resolve(false);
    }
  });
};

export const syncWithGoogleCalendar = async (items: ScheduleItem[]): Promise<void> => {
  try {
    // Implementation for syncing schedule to Google Calendar
    console.log("Syncing with Google Calendar...", items);
    showToast('Sinkronisasi Google Calendar dimulai', 'info');
  } catch (error) {
    captureError(error);
    showToast('Gagal sinkronisasi Google Calendar', 'error');
  }
};

export const fetchGoogleFitData = async (): Promise<void> => {
  try {
    // Implementation for fetching Fitness data
    console.log("Fetching Google Fit data...");
  } catch (error) {
    captureError(error);
    showToast('Gagal mengambil data Google Fit', 'error');
  }
};

/**
 * iCal EXPORT
 */
export const exportToICal = (items: ScheduleItem[]): void => {
  try {
    let ical = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LifeTrack//NONSGML v1.0//EN\n";
    
    items.forEach(item => {
      const dtStart = item.date.replace(/-/g, '') + 'T' + item.startTime.replace(/:/g, '') + '00';
      ical += "BEGIN:VEVENT\n";
      ical += `SUMMARY:${item.title}\n`;
      ical += `DTSTART:${dtStart}\n`;
      ical += `DESCRIPTION:LifeTrack Activity - ${item.activityType}\n`;
      ical += "END:VEVENT\n";
    });

    ical += "END:VCALENDAR";

    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'lifetrack_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Agenda berhasil diekspor ke iCal', 'success');
  } catch (error) {
    captureError(error);
    showToast('Gagal mengekspor agenda', 'error');
  }
};
