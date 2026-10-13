# 🛡️ SENTINEL X — Cybersecurity Operations & Threat Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.27-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma_ORM-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

**SENTINEL X** adalah platform operasional keamanan siber (*Cybersecurity Operations Center / SOC*) dan *Threat Intelligence* kelas enterprise yang siap produksi (*production-oriented*). Platform ini dirancang untuk mensimulasikan lingkungan SIEM (*Security Information and Event Management*), manajemen insiden terstruktur, remediasi kerentanan (*Vulnerability Management*), serta menyediakan **Attack Simulation Lab** interaktif dengan data sintetis yang aman tanpa membahayakan infrastruktur nyata.

---

## 🌟 Fitur Utama & Arsitektur Sistem

### 1. 📊 Security Operations Center (SOC) Dashboard
- **Skor Postur Keamanan Transparan**: Perhitungan otomatis metrik postur pertahanan: `100 - (15×Critical Alerts + 10×Critical Vulns + 8×Open Incidents)`.
- **SLA Metrik Respons**: Perhitungan MTTA (*Mean Time to Acknowledge*) dan MTTR (*Mean Time to Resolve*).
- **Aliran Telemetri Real-Time**: Stream live log keamanan dari gateway autentikasi, API, dan server.

### 2. 🧪 Attack Simulation Lab (Safe Training Sandbox)
Platform dilengkapi lab latihan interaktif yang mengemulasi serangan siber menggunakan IP sintetis RFC 5737 (`198.51.100.0/24`) secara aman:
- **Skenario A (Brute Force - T1110.001)**: Menstimulasi percobaan login beruntun Hydra ke akun target hingga akun terkunci (*account lockout*).
- **Skenario B (Password Spraying - T1110.003)**: Mengemulasi serangan satu IP terhadap banyak akun sekaligus untuk menguji deteksi korelasi multi-akun.
- **Skenario C (Privilege Escalation - T1078)**: Mengemulasi modifikasi role tak terotorisasi dari `LAB_USER` ke `SUPER_ADMIN`.
- **Skenario D (Analyst Challenge)**: Tantangan analisis investigasi untuk memilah traffic normal vs serangan tersembunyi.

### 3. 🔍 SIEM-Inspired Detection Engine
- Evaluasi deterministik terhadap log telemetri yang masuk berdasarkan *sliding window* dan ambang batas (*threshold*).
- Pemetaan langsung ke **MITRE ATT&CK Framework** (Teknik Credential Access, Defense Evasion, Privilege Escalation).
- Sakelar aktif/nonaktif rule deteksi dan konfigurasi ambang batas secara visual.

### 4. 🚨 Alert Management Center
- Siklus hidup alert: `NEW` ➔ `ACKNOWLEDGED` ➔ `INVESTIGATING` ➔ `RESOLVED` / `FALSE_POSITIVE`.
- Filter keparahan (*CRITICAL*, *HIGH*, *MEDIUM*, *LOW*).
- Analisis bukti digital (*evidence summary*) dan rekomendasi langkah pertahanan.

### 5. 📁 Incident Response Workspace
- Manajemen insiden formal lengkap dengan nomor referensi (contoh: `INC-2026-0042`).
- **Forensic Timeline**: Rekam jejak kronologis setiap investigasi dan tindakan pembendungan (*containment*).
- **Checklist Kesiapan Respons**: Daftar tugas penanganan insiden yang dapat diceklis oleh analis.
- Catatan investigasi analis (*live note logging*).

### 6. 🐛 Vulnerability Management & Formal Risk Acceptance
- Pencatatan kerentanan aplikasi dan infrastruktur berbasis skor CVSS v3 dan CVE (contoh: SAST Semgrep, SCA npm audit).
- **Alur Formal Risk Acceptance**: Persetujuan risiko bisnis yang mewajibkan justifikasi teknis tertulis dan kontrol kompensasi sebelum status disetujui.

### 7. 🛡️ Granular 7-Tier RBAC (Role-Based Access Control)
Otorisasi sisi server (*server-side permission guard*) untuk 7 peran pengguna:
1. `SUPER_ADMIN`: Manajemen platform penuh dan isolasi organisasi.
2. `SECURITY_ADMIN`: Manajemen kebijakan dan integrasi keamanan.
3. `SOC_ANALYST`: Pemantauan log, triase alert, dan manajemen insiden.
4. `SECURITY_ENGINEER`: Manajemen kerentanan dan aset infrastruktur.
5. `DEVELOPER`: Review temuan keamanan aplikasi dan status perbaikan bug.
6. `AUDITOR`: Akses *read-only* ke audit trail kepatuhan.
7. `LAB_USER`: Akses ke skenario latihan di lab serangan sintetis.

*(Dilengkapi **Demo Role Switcher** di navigasi kiri bawah untuk berganti peran secara instan saat presentasi/evaluasi portofolio).*

### 8. 📜 Immutable Security Audit Trail
- Pencatatan buku besar (*ledger*) transaksi keamanan yang *append-only*.
- Redaksi otomatis terhadap data sensitif seperti password, secret, token, dan hash agar tidak pernah bocor ke log audit.

### 9. 📄 Security Report Generator
- Ekspor laporan ringkasan eksekutif (*Executive Security Summary*) dan rekam jejak teknis remediasi kerentanan (*Vulnerability Remediation Ledger*).

---

## 💻 Tech Stack

- **Frontend**: Next.js 15.5.27 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3, PostCSS, Lucide Icons, Dark-Navy SOC High-Contrast Theme
- **State & Data**: TanStack Query, React Hook Form, Zod
- **Backend & API**: Next.js API Routes (Serverless Functions), JWT HTTP-Only Cookies, Argon2/Bcrypt
- **Database**: PostgreSQL (Neon Serverless) / SQLite (Local Dev), Prisma ORM v6.19.3

---

## 🚀 Panduan Menjalankan di Komputer Lokal (Localhost)

### 1. Clone Repository & Masuk ke Direktori
```bash
git clone https://github.com/v0rade/Sentinel-X-Version-2.git
cd Sentinel-X-Version-2
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Setup Database Lokal (SQLite Otomatis)
Pastikan isi file `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sentinel-x-ultra-secure-key-2026-production"
```

Sinkronkan database dan isi data awal:
```bash
# Sinkronkan tabel keamanan
npx prisma db push

# Masukkan 7 akun pengguna, SIEM rules, aset, dan skenario lab
npx tsx prisma/seed.ts
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka browser Anda di **[http://localhost:3000](http://localhost:3000)**.

---

## ☁️ Panduan Deploy ke Vercel (Produksi Online)

### Langkah 1: Siapkan Database PostgreSQL Gratis di Neon
1. Buat akun di **[neon.tech](https://neon.tech)** (login via GitHub).
2. Buat project baru, lalu klik tombol hijau **Connect**.
3. Centang **Connection Pooling**, lalu salin string koneksi:
   `postgresql://neondb_owner:PASSWORD@ep-hostname.region.aws.neon.tech/neondb?sslmode=require`

### Langkah 2: Deploy di Vercel
1. Buka **[vercel.com](https://vercel.com)** ➔ klik **Add New...** ➔ **Project**.
2. Pilih repository **`Sentinel-X-Version-2`** dan klik **Import**.
3. Di bagian **Environment Variables**, tambahkan:
   - **`DATABASE_URL`**: *(Paste connection string Neon dari Langkah 1)*
   - **`JWT_SECRET`**: `sentinel-x-ultra-secure-key-2026-production`
4. Ubah `provider` di `prisma/schema.prisma` menjadi `postgresql` jika menghubungkan langsung ke Neon.
5. Klik **Deploy**!

### Langkah 3: Seed Database Neon dari Laptop Anda
Jalankan di PowerShell:
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-hostname.neon.tech/neondb?sslmode=require"
npx prisma db push
npx tsx prisma/seed.ts
```

---

## 🔑 Akun Demo Siap Pakai

Semua akun menggunakan password yang sama: **`SentinelX#2026Secure!`**

| Role | Email | Nama Pengguna | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@sentinel.internal` | Marcus Vance | Administrator Sistem & Konfigurasi Global |
| **Security Admin** | `sec-admin@sentinel.internal` | Diana Prince | Direktur Operasi Keamanan & Kebijakan |
| **SOC Analyst** | `analyst@sentinel.internal` | Sarah Chen | Analis Investigasi Alert & Insiden *(Default)* |
| **Security Engineer** | `engineer@sentinel.internal` | Alex Rivera | Manajemen Kerentanan & Penilaian Aset |
| **Developer** | `dev@sentinel.internal` | David Kim | Review Temuan SAST & Tugas Remediasi |
| **Auditor** | `auditor@sentinel.internal` | Elena Rostova | Inspeksi Audit Trail Kepatuhan *(Read-only)* |
| **Lab User** | `lab@sentinel.internal` | Trainee Jordan | Akses Latihan Simulasi Serangan Siber |

> **Tips Presentasi Portofolio:** Anda dapat mengganti role pengguna secara instan tanpa login ulang menggunakan menu dropdown **"Demo RBAC Role"** di pojok kiri bawah navigasi.

---

## 📖 Cara Menggunakan & Skenario Uji Coba

1. **Menguji SIEM Detection Engine & Attack Lab**:
   - Masuk ke menu **Attack Simulation Lab** (`/lab`).
   - Pilih skenario **"Lab A: Brute-Force Password Guessing Simulation"** lalu klik **"Execute Simulation"**.
   - Sistem akan menyuntikkan paket telemetri kegagalan login secara beruntun.
   - Perhatikan kotak hasil di bawah: Rule deteksi akan memicu alert otomatis dengan tingkat keparahan **HIGH**.
   - Buka menu **Alert Center** (`/alerts`), Anda akan melihat alert brute force baru lengkap dengan bukti IP penyerang dan tombol **Investigate**.

2. **Mengelola Triase Insiden**:
   - Masuk ke menu **Incident Response** (`/incidents`).
   - Pilih insiden aktif (misal `INC-2026-0042`).
   - Ceklis tugas pada **Containment & Eradication Checklist**.
   - Tambahkan temuan baru pada kolom **Log Note**, dan perhatikan pembaruan kronologis pada **Investigation Timeline**.

3. **Menguji Formal Risk Acceptance**:
   - Masuk ke menu **Vulnerabilities** (`/vulnerabilities`).
   - Pada salah satu temuan kerentanan, klik tombol **"Accept Business Risk..."**.
   - Masukkan alasan justifikasi bisnis dan kontrol kompensasi jaringan (minimal 10 karakter).
   - Simpan, lalu buka menu **Audit Trail** (`/audit-logs`) untuk memverifikasi bahwa tindakan persetujuan risiko Anda tercatat secara permanen di buku besar audit.

---

## 🔒 Kebijakan Keamanan & Prinsip Zero-Harm

Seluruh fitur simulasi serangan, injeksi telemetri, dan deteksi pada SENTINEL X beroperasi **eksklusif pada data sintetis dan alamat IP dokumentasi privat (RFC 5737 / RFC 1918)**. Platform ini **tidak pernah** melakukan pemindaian internet tanpa izin, pencurian kredensial nyata, eksploitasi berbahaya, atau penyebaran malware.

---

## 📜 Lisensi

Didistribusikan di bawah lisensi **MIT**. Bebas digunakan untuk keperluan edukasi, portofolio rekayasa perangkat lunak, dan evaluasi profesional.
