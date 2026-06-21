import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, UserProfile } from '../types';
import { showToast } from '../context/ToastContext';
import { captureError } from './monitoring';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODEL_NAME = "gemini-2.5-flash";

interface FinancialAdviceResponse {
  tips: string[];
}

export async function getFinancialAdvice(transactions: Transaction[], profile: UserProfile): Promise<FinancialAdviceResponse> {
  const prompt = `Analisis keuangan untuk pengguna berikut. Bedakan antara "Uang Harian/Belanja" dan "Tabungan" (kategori 'tabungan').
  Berikan 3 tips singkat, praktis, dan memotivasi dalam Bahasa Indonesia untuk membantu pengguna menabung lebih banyak atau mengelola uang harian lebih efisien.
  
  Transaksi: ${JSON.stringify(transactions.slice(-20))}
  Profil: ${JSON.stringify(profile)}
  
  Respond in Bahasa Indonesia (Indonesian language). Kembalikan respons dalam format JSON: {"tips": [string, string, string]}.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"tips": []}');
  } catch (error) {
    captureError(error, { transactions: transactions.length, profileGoal: profile.goal });
    showToast('Gagal mendapatkan saran finansial AI', 'error');
    return { tips: ["Tetap konsisten dalam pencatatan", "Tinjau pengeluaran Anda setiap minggu", "Tetapkan tujuan finansial yang jelas"] };
  }
}
