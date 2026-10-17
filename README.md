# 🛡️ SENTINEL X — Cybersecurity Operations & Threat Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.27-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma_ORM-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

### 🌐 Live Production Demo
> **Akses Langsung Platform (Production):**  
> 🔗 **[https://sentinel-x-version-2.vercel.app](https://sentinel-x-version-2.vercel.app/)**
> 
> *Catatan: Anda dapat langsung mengeksplorasi platform menggunakan akun demo bawaan atau mengganti peran melalui switcher RBAC di navigasi kiri bawah.*

---

## 📖 Tentang SENTINEL X

**SENTINEL X** adalah platform **Security Operations Center (SOC)**, **Security Information & Event Management (SIEM)**, dan **Threat Intelligence** modern kelas enterprise yang dirancang khusus untuk tim pertahanan siber (Blue Team), IT Administrator, dan Application Security Engineer.

Platform ini memadukan alur kerja investigasi keamanan profesional: mulai dari ingestion log telemetri skala besar, mesin korelasi berbasis aturan (SIEM detection engine) yang dipetakan ke **MITRE ATT&CK Framework**, manajemen insiden dengan audit forensik kronologis, hingga remediasi kerentanan dengan alur formal *Risk Acceptance*.

Selain itu, platform ini memiliki keunggulan pembeda utama berupa **Attack Simulation Lab** — lingkungan sandbox aman untuk menguji deteksi serangan siber secara interaktif menggunakan data sintetis tanpa risiko bahaya terhadap sistem produksi.

---

## 🌟 Fitur Utama & Modul Lengkap

### 1. 📊 Security Operations Center (SOC) Dashboard (`/`)
- **Transparent Security Posture Score**: Metrik skor postur pertahanan yang dihitung secara transparan berbasis temuan riil:
  $$\text{Score} = 100 - (15 \times \text{Critical Alerts} + 10 \times \text{Critical Vulns} + 8 \times \text{Open Incidents})$$
- **SLA Respon Kritis**: Pelacakan otomatis **MTTA** (*Mean Time to Acknowledge*) dan **MTTR** (*Mean Time to Resolve*).
- **Dual Telemetry Streams**: Pemantauan langsung stream alert prioritas tinggi dan stream event log telemetri normalisasi secara berdampingan.

### 2. 🧪 Attack Simulation Lab (Safe Training Sandbox) (`/lab`)
Lingkungan pelatihan pertahanan siber yang mengemulasi serangan realistis menggunakan alamat IP sintetis dokumentasi privat RFC 5737 (`198.51.100.0/24`, `203.0.113.0/24`):
- **Skenario A — Brute-Force Password Guessing (T1110.001)**: Mengemulasi serangan Hydra multi-request ke endpoint autentikasi hingga memicu status *Account Lockout* dan alert severity `HIGH`.
- **Skenario B — Distributed Password Spraying (T1110.003)**: Menguji kemampuan engine SIEM mengelompokkan satu IP penyerang yang mencoba login ke banyak akun internal berbeda.
- **Skenario C — Privileged Role Modification Anomaly (T1078)**: Mengemulasi eskalasi hak akses ilegal dari akun biasa langsung ke `SUPER_ADMIN`.
- **Skenario D — Incident Investigation Analyst Challenge**: Tantangan bagi analis untuk menyaring noise lalu lintas normal dan menemukan indikasi kompromi (IoC).

### 3. 🔍 SIEM-Inspired Detection Engine (`/detection-rules`)
- Mesin deteksi deterministik dengan evaluasi berbasis *sliding window* (jendela waktu geser) dan batas ambang (*threshold*).
- Pemetaan standar **MITRE ATT&CK** (Credential Access, Privilege Escalation, Defense Evasion, Persistence).
- Kontrol penuh bagi administrator untuk mengaktifkan/menonaktifkan rule serta mengonfigurasi batas threshold secara dinamis.

### 4. 🚨 Alert Management Center (`/alerts`)
- Manajemen siklus hidup alert: `NEW` ➔ `ACKNOWLEDGED` ➔ `INVESTIGATING` ➔ `RESOLVED` / `FALSE_POSITIVE`.
- Filter multi-level berdasarkan tingkat keparahan (*CRITICAL*, *HIGH*, *MEDIUM*, *LOW*).
- Panel bukti forensik digital (*evidence summary*) yang menautkan event log terkait dan rekomendasi langkah mitigasi pertahanan (*recommended defense*).

### 5. 📁 Incident Response Workspace (`/incidents`)
- Sistem tiket insiden berstandar industri dengan kode unik (contoh: `INC-2026-0042`).
- **Forensic Timeline Chronology**: Catatan waktu peristiwa, eskalasi status, dan tindakan pembendungan (*containment actions*).
- **Interactive Response Checklist**: Daftar tindakan mitigasi sistematis (isolasi host, pemblokiran firewall CIDR, preservasi log forensik).
- **Analyst Investigation Notes**: Fasilitas pencatatan langsung temuan investigasi oleh analis.

### 6. 🐛 Vulnerability Management & Risk Acceptance (`/vulnerabilities`)
- Manajemen repositori kerentanan dari berbagai sumber pemindai (SAST Semgrep, SCA npm audit, Container Trivy, manual assessment).
- Penilaian standar **CVE** dan kalkulasi skor **CVSS v3**.
- **Formal Risk Acceptance Modal**: Alur persetujuan risiko bisnis yang mewajibkan justifikasi teknis dan kontrol kompensasi tertulis sebelum kerentanan dapat ditandai sebagai *Accepted Risk*.

### 7. 🖥️ Enterprise Asset Inventory (`/assets`)
- Manajemen inventaris aset: Web Application, API Service, Database Cluster, CI/CD Runner, dan Sandbox Lab Environment.
- Klasifikasi keamanan data (`RESTRICTED`, `CONFIDENTIAL`, `INTERNAL`) dan status lingkungan (`PRODUCTION`, `DEVELOPMENT`, `STAGING`, `LAB`).
- Tautan langsung ke temuan kerentanan (*linked vulnerabilities*) per aset.

### 8. 📡 Threat Intelligence Repository (`/threat-intel`)
- Repositori indikator kompromi / *Indicators of Compromise* (IoC): IP Address, Malicious Domain, File SHA-256 Hash, dan URL.
- Klasifikasi transparan antara indikator sintetis pelatihan (*Synthetic Training*) dengan indikator terverifikasi eksternal (*Verified External*).
- Rating tingkat kepercayaan (*Confidence Level* 0–100%) dan catatan analis.

### 9. 📜 Tamper-Resistant Security Audit Trail (`/audit-logs`)
- Buku besar (*ledger*) kepatuhan dan audit yang bersifat **append-only**.
- Mencatat seluruh peristiwa autentikasi, perubahan role, triase alert, eksekusi lab, dan ekspor laporan.
- **Automated Credential Redaction**: Sistem otomatis menyaring dan menyembunyikan parameter sensitif (password, JWT token, authorization header, secret key) sebelum disimpan ke log.

### 10. 📄 Evidence-Based Security Report Generator (`/reports`)
- Pembuatan laporan keamanan otomatis berbasis data telemetri riil.
- Mendukung laporan **Executive Security Summary** dan **Technical Vulnerability Remediation Ledger**.
- Ringkasan temuan kunci, distribusi keparahan, serta langkah rekomendasi strategis bagi pimpinan C-Level.

### 11. 👥 Granular 7-Tier RBAC & Interactive Role Switcher
Otorisasi ketat di sisi server (*server-side authorization guard*) untuk 7 peran pengguna:
1. `SUPER_ADMIN`: Kendali penuh platform, isolasi multi-tenant, dan konfigurasi global.
2. `SECURITY_ADMIN`: Manajemen pengguna organisasi, kebijakan keamanan, dan integrasi.
3. `SOC_ANALYST`: Pemantauan stream, investigasi alert, dan eskalasi penanganan insiden.
4. `SECURITY_ENGINEER`: Audit kerentanan aplikasi, integrasi scanner, dan inventaris aset.
5. `DEVELOPER`: Review temuan keamanan kode dan pelacakan status perbaikan bug.
6. `AUDITOR`: Akses *read-only* ke audit trail dan laporan kepatuhan sistem.
7. `LAB_USER`: Akses terbatas untuk menjalankan simulasi serangan di lab pelatihan.

> **💡 Fitur Khusus Penilai Portofolio:** Terdapat dropdown **"Demo RBAC Role"** di pojok kiri bawah navigasi yang memungkinkan penguji berganti peran secara instan tanpa perlu repot logout/login kembali!

---

## 🔑 Akun Demo Siap Pakai

Semua akun terdaftar menggunakan kata sandi default: **`SentinelX#2026Secure!`**

| Peran (Role) | Alamat Email | Nama Petugas | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@sentinel.internal` | Marcus Vance | Seluruh fitur sistem & isolasi tenant |
| **Security Admin** | `sec-admin@sentinel.internal` | Diana Prince | Manajemen pengguna, role, & kebijakan |
| **SOC Analyst** | `analyst@sentinel.internal` | Sarah Chen | Analisis telemetri, alert, & insiden *(Default)* |
| **Security Engineer** | `engineer@sentinel.internal` | Alex Rivera | Manajemen kerentanan, CVE, & aset |
| **Developer** | `dev@sentinel.internal` | David Kim | Akses perbaikan kode & daftar vuln |
| **Auditor** | `auditor@sentinel.internal` | Elena Rostova | Inspeksi audit log & laporan (*Read-only*) |
| **Lab User** | `lab@sentinel.internal` | Trainee Jordan | Akses lab simulasi serangan siber |

---

## 🕹️ Panduan Skenario Pengujian (Hands-On Tour)

Buka link live demo di **[https://sentinel-x-version-2.vercel.app](https://sentinel-x-version-2.vercel.app/)** dan ikuti alur uji berikut:

```
[1. Eksekusi Lab Simulasi] ──> [2. Deteksi SIEM & Alert] ──> [3. Eskalasi ke Insiden] ──> [4. Mitigasi & Audit Trail]
```

### Skenario 1: Eksekusi Simulasi & Deteksi Real-Time
1. Buka menu **Attack Simulation Lab** (`/lab`) di sidebar kiri.
2. Pada skenario **"Lab A: Brute-Force Password Guessing Simulation"**, klik tombol **"Execute Simulation"**.
3. Sistem akan menghasilkan paket telemetri kegagalan login berturut-turut.
4. Mesin deteksi SIEM langsung mencocokkan rule dan menghasilkan alert keparahan **HIGH**.
5. Buka menu **Alert Center** (`/alerts`) untuk melihat alert baru yang terdaftar lengkap dengan bukti IP penyerang.

### Skenario 2: Investigasi & Respons Insiden
1. Buka menu **Incident Response** (`/incidents`).
2. Pilih insiden aktif (misal `INC-2026-0042`).
3. Tandai tugas penanganan pada **Containment & Eradication Checklist**.
4. Ketik catatan investigasi baru pada input bawah dan klik **"Log Note"** — perhatikan pembaruan kronologis pada **Investigation Timeline**.

### Skenario 3: Alur Formal Risk Acceptance
1. Buka menu **Vulnerabilities** (`/vulnerabilities`).
2. Pilih salah satu temuan kerentanan, lalu klik **"Accept Business Risk..."**.
3. Isi alasan teknis dan kontrol kompensasi (misal: *Host berada di private subnet terisolasi tanpa akses internet publik*).
4. Klik **Submit**, lalu buka menu **Audit Trail** (`/audit-logs`) untuk membuktikan bahwa aksi persetujuan risiko tercatat permanen di buku besar audit.

---

## 💻 Panduan Instalasi Lokal (Self-Hosting / Localhost)

Jika Anda ingin menjalankan atau mengembangkan SENTINEL X di komputer lokal:

### 1. Clone Repository
```bash
git clone https://github.com/v0rade/Sentinel-X-Version-2.git
cd Sentinel-X-Version-2
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Buat atau periksa file `.env` di root project:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sentinel-x-ultra-secure-key-2026-production"
```

### 4. Sinkronisasi Database & Seed Data Awal
```bash
# Sinkronkan tabel keamanan Prisma
npx prisma db push

# Masukkan seluruh akun demo, rules deteksi, aset, dan skenario lab
npx tsx prisma/seed.ts
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Akses platform di **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Arsitektur & Spesifikasi Teknis

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) dengan server-side rendering dan API routes teroptimasi.
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) dengan mode pengetikan ketat (*strict type-checking*).
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) dengan PostCSS, Autoprefixer, dan custom cyber theme.
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) v6 dengan dukungan dual-driver: **SQLite** (lokal) dan **PostgreSQL Neon Serverless** (produksi).
- **Autentikasi & Keamanan**: JWT Session dengan HTTP-Only Cookies, proteksi CSRF, sanitasi metadata audit, dan mitigasi timing-attack pada bcrypt.
- **Ikonografi**: [Lucide React](https://lucide.dev/).

---

## 🔒 Prinsip Keamanan & Etika (Zero-Harm Policy)

> [!IMPORTANT]
> Seluruh fitur simulasi serangan, injeksi telemetri, dan latihan investigasi di platform SENTINEL X beroperasi **secara eksklusif pada data sintetis dan alamat IP dokumentasi privat yang telah dialokasikan (RFC 5737 / RFC 1918)**.
> 
> Platform ini **tidak pernah dan dilarang keras** melakukan pemindaian internet terbuka tanpa izin, pencurian kredensial riil, peluncuran payload berbahaya, atau eksploitasi infrastruktur publik.

---

## 📜 Lisensi

Project ini dilisensikan di bawah **[MIT License](LICENSE)**. Bebas digunakan untuk referensi pembelajaran, evaluasi portofolio rekayasa perangkat lunak, maupun demonstrasi arsitektur keamanan siber.
