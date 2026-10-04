export function rupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function bulanName(m) {
  return BULAN[(m || 1) - 1] || "-";
}
