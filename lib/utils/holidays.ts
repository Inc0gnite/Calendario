import type { Holiday } from "@/types";

const API_URL = "https://api.boostr.cl/holidays.json";
const CACHE_KEY = "agenda_holidays";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 días

// ─────────────────────────────────────────────
// FETCH FERIADOS
// ─────────────────────────────────────────────

export async function fetchHolidays(year: number): Promise<Holiday[]> {
  const cacheKey = `${CACHE_KEY}_${year}`;

  // Intentar desde cache
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}?year=${year}`, {
      next: { revalidate: 60 * 60 * 24 }, // Next.js cache 24h
    });

    if (!res.ok) throw new Error("Error al obtener feriados");

    const data = await res.json();

    // La API de boostr.cl retorna: { data: [{ date, title, type }] }
    const holidays: Holiday[] = (data?.data ?? []).map(
      (h: { date: string; title: string; type: string }) => ({
        date: h.date,
        name: h.title,
        type: mapHolidayType(h.type),
      })
    );

    saveToCache(cacheKey, holidays);
    return holidays;
  } catch {
    // Fallback: feriados fijos de Chile
    return getChileFallbackHolidays(year);
  }
}

// ─────────────────────────────────────────────
// CACHE en localStorage
// ─────────────────────────────────────────────

function getFromCache(key: string): Holiday[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveToCache(key: string, data: Holiday[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage lleno — ignorar
  }
}

function mapHolidayType(type: string): Holiday["type"] {
  if (type === "religious") return "religious";
  if (type === "regional") return "regional";
  return "national";
}

// ─────────────────────────────────────────────
// FALLBACK — feriados fijos Chile
// ─────────────────────────────────────────────

function getChileFallbackHolidays(year: number): Holiday[] {
  return [
    { date: `${year}-01-01`, name: "Año Nuevo", type: "national" },
    { date: `${year}-05-01`, name: "Día del Trabajo", type: "national" },
    { date: `${year}-05-21`, name: "Glorias Navales", type: "national" },
    { date: `${year}-06-20`, name: "Día Nacional de los Pueblos Indígenas", type: "national" },
    { date: `${year}-06-29`, name: "San Pedro y San Pablo", type: "religious" },
    { date: `${year}-07-16`, name: "Virgen del Carmen", type: "religious" },
    { date: `${year}-08-15`, name: "Asunción de la Virgen", type: "religious" },
    { date: `${year}-09-18`, name: "Independencia Nacional", type: "national" },
    { date: `${year}-09-19`, name: "Día de las Glorias del Ejército", type: "national" },
    { date: `${year}-10-12`, name: "Encuentro de Dos Mundos", type: "national" },
    { date: `${year}-10-27`, name: "Día de las Iglesias Evangélicas", type: "religious" },
    { date: `${year}-11-01`, name: "Día de Todos los Santos", type: "religious" },
    { date: `${year}-12-08`, name: "Inmaculada Concepción", type: "religious" },
    { date: `${year}-12-25`, name: "Navidad", type: "religious" },
  ];
}
