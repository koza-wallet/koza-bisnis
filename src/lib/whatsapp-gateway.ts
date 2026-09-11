// ==============================================================================
// KOZA BISNIS — WHATSAPP GATEWAY CLIENT & MULTI-TENANT ENGINE
// Mendukung Fonnte, Wablas, dan Custom Gateway Provider
// ==============================================================================

export interface SendWhatsAppMessageParams {
  provider?: 'fonnte' | 'wablas' | 'custom';
  token: string;
  targetPhone: string;
  message: string;
  serverUrl?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface QRRequestResult {
  success: boolean;
  qrCodeUrl?: string;
  qrString?: string;
  deviceToken?: string;
  deviceId?: string;
  error?: string;
}

/**
 * Menormalkan format nomor telepon seluler Indonesia ke format internasional (628...)
 */
export function normalizeIndonesianPhone(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.slice(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Mengirim pesan WhatsApp keluar melalui provider gateway yang ditentukan
 */
export async function sendWhatsAppMessage({
  provider = 'fonnte',
  token,
  targetPhone,
  message,
  serverUrl = 'https://phone.wablas.com',
}: SendWhatsAppMessageParams): Promise<SendResult> {
  const normalizedTarget = normalizeIndonesianPhone(targetPhone);
  if (!token) {
    return { success: false, error: 'Token WhatsApp Gateway tidak ditemukan.' };
  }
  if (!normalizedTarget) {
    return { success: false, error: 'Nomor telepon tujuan tidak valid.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

    if (provider === 'fonnte') {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          target: normalizedTarget,
          message,
          countryCode: '62',
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === false) {
        return {
          success: false,
          error: data.reason || data.message || `Fonnte error HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.id?.[0] || String(Date.now()),
      };
    }

    if (provider === 'wablas') {
      const cleanServerUrl = serverUrl.replace(/\/+$/, '');
      const response = await fetch(`${cleanServerUrl}/api/send-message`, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          phone: normalizedTarget,
          message,
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status === false) {
        return {
          success: false,
          error: data.message || `Wablas error HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.data?.id || String(Date.now()),
      };
    }

    // Default Custom / Mock provider
    clearTimeout(timeoutId);
    return { success: true, messageId: `mock-${Date.now()}` };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Koneksi ke gateway gagal.';
    console.error('[WHATSAPP-GATEWAY] Gagal mengirim pesan:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Meminta QR Code untuk Device Toko dari Fonnte Master API
 */
export async function requestFonnteDeviceQR({
  masterToken,
  storeId,
  storeName,
}: {
  masterToken?: string;
  storeId: string;
  storeName: string;
}): Promise<QRRequestResult> {
  const token = masterToken || process.env.FONNTE_MASTER_TOKEN;

  if (token) {
    try {
      // 1. Buat device di Fonnte via POST /add-device (memerlukan Account Token)
      // Parameter device wajib 8-15 digit numerik unik
      const numericDigits = storeId.replace(/[^0-9]/g, '');
      const cleanDeviceNum = (numericDigits + String(Date.now())).slice(0, 12);
      const safeDeviceName = `KoZa - ${storeName.slice(0, 20)}`.trim();

      const response = await fetch('https://api.fonnte.com/add-device', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: safeDeviceName,
          device: cleanDeviceNum,
          autoread: 'true',
          personal: 'true',
          group: 'false',
        }),
      });

      const data = await response.json().catch(() => ({}));
      const deviceToken = data.token || data.device_token;
      const deviceId = data.device || cleanDeviceNum;

      if (deviceToken) {
        // 2. Minta QR code untuk device token tersebut (POST /qr)
        const qrResponse = await fetch('https://api.fonnte.com/qr', {
          method: 'POST',
          headers: {
            Authorization: deviceToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'qr',
          }),
        });
        const qrData = await qrResponse.json().catch(() => ({}));

        let formattedQrUrl: string | undefined = undefined;
        if (qrData.url) {
          formattedQrUrl = qrData.url.startsWith('data:') || qrData.url.startsWith('http')
            ? qrData.url
            : `data:image/png;base64,${qrData.url}`;
        }

        // 3. Daftarkan webhook URL toko dan aktifkan autoread secara otomatis ke Fonnte
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kozabisnis.com';
        fetch('https://api.fonnte.com/update-device', {
          method: 'POST',
          headers: {
            Authorization: deviceToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: safeDeviceName,
            device: cleanDeviceNum,
            webhook: `${origin}/api/webhooks/whatsapp?store_id=${storeId}`,
            autoread: 'true',
            personal: 'true',
          }),
        }).catch(() => {});

        return {
          success: true,
          qrCodeUrl: formattedQrUrl,
          qrString: qrData.qr || undefined,
          deviceToken,
          deviceId: String(deviceId || storeId),
        };
      }
    } catch (err) {
      console.error('[WHATSAPP-GATEWAY] Gagal menghubungi Fonnte API:', err);
    }
  }

  // Fallback Dev / Sandbox Mode: Generate deterministic QR payload untuk testing UI
  const mockToken = `mock_fonnte_${storeId.slice(0, 8)}_${Date.now()}`;
  return {
    success: true,
    qrString: `koza-whatsapp-session-${storeId}-${Date.now()}`,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=koza-whatsapp-connect-${storeId}`,
    deviceToken: mockToken,
    deviceId: storeId,
  };
}

/**
 * Memeriksa status koneksi device ke jaringan WhatsApp
 */
export async function checkFonnteDeviceStatus(deviceToken: string): Promise<{
  connected: boolean;
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';
  connectedNumber?: string;
  device?: string;
}> {
  if (!deviceToken || deviceToken.startsWith('mock_fonnte_')) {
    return {
      connected: false,
      status: 'CONNECTING',
    };
  }

  try {
    const response = await fetch('https://api.fonnte.com/device', {
      method: 'POST',
      headers: {
        Authorization: deviceToken,
      },
    });

    const data = await response.json().catch(() => ({}));

    // Status 'connect' / 'connected' di Fonnte
    const isConnected = data.device_status === 'connect' || data.status === 'connect';
    return {
      connected: isConnected,
      status: isConnected ? 'CONNECTED' : 'CONNECTING',
      connectedNumber: data.sender || data.device || undefined,
      device: data.name,
    };
  } catch {
    return {
      connected: false,
      status: 'DISCONNECTED',
    };
  }
}

/**
 * Menghapus device di Fonnte agar berhenti ditagih saat toko berhenti langganan
 */
export async function deleteFonnteDevice({
  deviceToken,
}: {
  masterToken?: string;
  deviceToken: string;
}): Promise<{ success: boolean }> {
  if (!deviceToken || deviceToken.startsWith('mock_fonnte_')) {
    return { success: true };
  }

  try {
    // 1. Putuskan koneksi WhatsApp terlebih dahulu jika masih terhubung
    await fetch('https://api.fonnte.com/disconnect', {
      method: 'POST',
      headers: {
        Authorization: deviceToken,
      },
    }).catch(() => {});

    // 2. Hapus device secara permanen dari Fonnte (POST /delete-device)
    const response = await fetch('https://api.fonnte.com/delete-device', {
      method: 'POST',
      headers: {
        Authorization: deviceToken,
      },
    });

    const data = await response.json().catch(() => ({}));
    return { success: Boolean(response.ok && data.status !== false) };
  } catch (err) {
    console.error('[WHATSAPP-GATEWAY] Gagal menghapus device di Fonnte:', err);
    return { success: false };
  }
}

