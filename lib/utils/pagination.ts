export function parsePagination(params: URLSearchParams, maxLimit = 100) {
  const toInt = (v: string | null, d: number) => {
    const n = Number.parseInt(v ?? "", 10);
    return Number.isFinite(n) ? n : d;
  };
  const page = Math.max(1, toInt(params.get("page"), 1));
  const limit = Math.min(maxLimit, Math.max(1, toInt(params.get("limit"), 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
