# NRE Monorepo

Monorepo ini berisi:
- `backend/` (Absensi API + Jest tests)
- `frontend/` (Absensi UI + Vitest tests)
- `erp/` (Rizquna ERP Laravel + Filament)

## Full Otomatis (Recommended)

Jalankan semua verifikasi lintas proyek (test + audit flow + backup/restore check):

```bash
./scripts/full_auto_verify.sh
```

Output laporan otomatis akan dibuat di:

```bash
reports/automation/<timestamp>/report.md
```

## Auto Cleaning

Bersihkan artefak lama (report/backup automation) secara otomatis:

```bash
./scripts/auto_clean.sh
```
