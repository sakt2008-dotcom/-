// Web Notifications & Audio Chime Helper
// يدعم إشعارات المتصفح الأصلية (Desktop & Mobile Push API) ونغمة صوتية فورية خفيفة

export const isWebNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isWebNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isWebNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
};

/**
 * نغمة تنبيه صوتية موسيقية ناعمة ومميزة عبر Web Audio API
 * (لا تتطلب أي ملفات خارجية ولا تواجه مشاكل 404 أو انقطاع شبكة)
 */
export const playNotificationChime = (enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic two-tone chime (F#5 -> A#5 -> C#6)
    const playTone = (freq: number, start: number, duration: number, peakGain: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.linearRampToValueAtTime(peakGain, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    // Note 1: 740 Hz (F#5)
    playTone(739.99, 0, 0.25, 0.18);
    // Note 2: 932 Hz (A#5)
    playTone(932.33, 0.1, 0.35, 0.22);
    // Note 3: 1108 Hz (C#6)
    playTone(1108.73, 0.2, 0.5, 0.25);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
};

export interface SendNotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  playSound?: boolean;
  onClick?: () => void;
}

export const sendWebNotification = (
  title: string,
  options?: SendNotificationOptions
): boolean => {
  // 1. Play sound chime if sound enabled
  if (options?.playSound !== false) {
    playNotificationChime(true);
  }

  // 2. Check browser support & permission
  if (!isWebNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const defaultIcon =
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=192&q=80';

      const notif = new Notification(title, {
        body: options?.body,
        icon: options?.icon || defaultIcon,
        badge: defaultIcon,
        tag: options?.tag || `gathern-notif-${Date.now()}`,
        dir: 'rtl',
        lang: 'ar',
      });

      notif.onclick = () => {
        try {
          window.focus();
          if (options?.onClick) options.onClick();
        } catch {
          // ignore
        }
        notif.close();
      };

      // Auto close after 7 seconds
      setTimeout(() => {
        try {
          notif.close();
        } catch {
          // ignore
        }
      }, 7000);

      return true;
    } catch (err) {
      console.warn('Failed to display browser notification:', err);
      return false;
    }
  }

  return false;
};
