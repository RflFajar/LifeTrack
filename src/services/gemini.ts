import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleItem, Transaction, UserProfile } from '../types';
import { showToast } from '../context/ToastContext';
import { captureError } from './monitoring';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODEL_NAME = "gemini-3-flash-preview";

interface FinancialAdviceResponse {
  tips: string[];
}

export async function getFinancialAdvice(transactions: Transaction[], profile: UserProfile): Promise<FinancialAdviceResponse> {
  const prompt = `Berdasarkan transaksi keuangan dan profil pengguna berikut, berikan 3 tips singkat dan praktis dalam Bahasa Indonesia untuk pengelolaan uang yang lebih baik. Respond in Bahasa Indonesia (Indonesian language).
  
  Transaksi: ${JSON.stringify(transactions.slice(-10))}
  Profil: ${JSON.stringify(profile)}
  
  Kembalikan respons dalam format JSON.`;

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

interface WorkoutDay {
  day: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    notes: string;
  }[];
}

export async function getWorkoutRecommendation(profile: UserProfile): Promise<WorkoutDay[]> {
  const prompt = `Buat rencana latihan (workout plan) selama 7 hari dalam Bahasa Indonesia untuk pengguna dengan detail berikut:
  Tinggi: ${profile.height}cm, Berat: ${profile.weight}kg, Target Berat: ${profile.targetWeight}kg, Usia: ${profile.age}, Tujuan: ${profile.goal}, Pekerjaan: ${profile.job}.
  Preferensi Alat: ${profile.equipment || 'Tidak ada preferensi'}.
  
  Kembalikan dalam bentuk array JSON berisi rencana harian. Gunakan Bahasa Indonesia untuk nama latihan (jika umum) dan catatan.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.STRING },
                    reps: { type: Type.STRING },
                    notes: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    captureError(error, { profileGoal: profile.goal });
    showToast('Gagal membuat rencana olahraga AI', 'error');
    return [];
  }
}

interface NutritionResponse {
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    reason: string;
  }[];
  totalCalories: number;
  dailyTarget: {
    protein: number;
    carbohydrates: number;
  };
}

export async function getNutritionRecommendation(profile: UserProfile): Promise<NutritionResponse> {
  const prompt = `Buat rencana makan harian (meal plan) dalam Bahasa Indonesia untuk pengguna dengan detail berikut:
  Berat Sekarang: ${profile.weight}kg, Target Berat: ${profile.targetWeight}kg, Tujuan: ${profile.goal}, Budget: ${profile.budget}, Pekerjaan: ${profile.job}.
  Direkomendasikan untuk seseorang berusia ${profile.age} tahun.
  Respond in Bahasa Indonesia (Indonesian language).
  
  Berikan tepat:
  1. Daftar 3-5 menu makanan spesifik untuk hari tersebut.
  2. Setiap makanan harus menyertakan: nama (Bahasa Indonesia), estimasi kalori, estimasi protein (g), dan estimasi karbohidrat (g).
  3. Total target harian untuk Kalori, Protein, dan Karbohidrat.
  
  Kembalikan sebagai objek JSON dengan struktur ini:
  {
    "meals": [{"name": string, "calories": number, "protein": number, "carbohydrates": number, "reason": string}],
    "totalCalories": number,
    "dailyTarget": {"protein": number, "carbohydrates": number}
  }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbohydrates: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                }
              }
            },
            totalCalories: { type: Type.NUMBER },
            dailyTarget: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbohydrates: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"meals": [], "totalCalories": 0, "dailyTarget": {"protein": 0, "carbohydrates": 0}}');
  } catch (error) {
    captureError(error, { profileGoal: profile.goal });
    showToast('Gagal membuat rekomendasi nutrisi AI', 'error');
    return { meals: [], totalCalories: 0, dailyTarget: { protein: 0, carbohydrates: 0 } };
  }
}

interface SmartInsightResponse {
  insights: {
    type: 'financial' | 'productivity' | 'health' | 'holistic';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

export async function getSmartInsights(scheduleData: ScheduleItem[], transactionData: Transaction[], healthData: UserProfile): Promise<SmartInsightResponse> {
  const prompt = `Lakukan analisis mendalam dan holistik (cross-domain) terhadap data pengguna berikut:
  1. Jadwal: ${JSON.stringify(scheduleData.slice(0, 10))}
  2. Transaksi: ${JSON.stringify(transactionData.slice(0, 10))}
  3. Profil/Kesehatan: ${JSON.stringify(healthData)}

  Berikan 4 insight strategis dalam Bahasa Indonesia yang menghubungkan setidaknya dua domain (misal: hubungan antara kepadatan jadwal dengan pengeluaran makan, atau hubungan berat badan dengan konsistensi jadwal).

  Format respons harus JSON dengan struktur:
  {
    "insights": [
      {
        "type": "financial" | "productivity" | "health" | "holistic",
        "title": string,
        "description": string,
        "impact": "high" | "medium" | "low"
      }
    ]
  }
  Respond in Bahasa Indonesia.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"insights": []}');
  } catch (error) {
    captureError(error, { schedule: scheduleData.length, transactions: transactionData.length });
    showToast('Gagal menghubungkan data cerdas AI', 'error');
    return { insights: [] };
  }
}
