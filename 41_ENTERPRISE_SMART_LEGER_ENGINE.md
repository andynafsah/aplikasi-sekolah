# 41_ENTERPRISE_SMART_LEGER_ENGINE.md

# ENTERPRISE SMART LEGER ENGINE (AI-POWERED)

Version: 1.0 Enterprise
Architecture: Single Tenant
Database: MySQL + Prisma ORM
AI Integration: Google Gemini (Server-Side)
Status: Implementation Stage

---

## 🎯 OBJECTIVE
Transform the traditional static gradebook into an intelligent, dynamic, and automated "Smart Leger" that handles thousands of records with zero hardcoding and provides actionable AI insights.

---

## 🧠 SMART FEATURES

### 1. Dynamic Subject Architecture
- **Automatic Column Generation**: The Leger grid must dynamically generate subject columns based on `prisma.subject` and `prisma.subject_category`.
- **Category Grouping**: Group subjects by "Umum", "Diniyah", "Tahfidz", etc., in the UI.
- **Real-time KKM Sync**: Fetch KKM values directly from the `Subject` table for validation highlighting.

### 2. Intelligent Scoring Logic
- **Weighted Aggregation**: Calculate final scores using dynamic weights from `AssessmentComponent` (UH, PTS, PAS).
- **Auto-Ranking**: Generate real-time rankings within class groups.
- **Ketuntasan Analysis**: Automatic flagging of students below KKM.

### 3. AI Copilot Integration
- **Class Performance Summary**: One-click AI analysis of the entire leger to identify "Low Performing Subjects".
- **Individual Student Insights**: AI-generated notes for Rapor based on the student's score trajectory.
- **Teacher Recommendations**: AI suggestions for remedial strategies.

### 4. Enterprise Workflow
- **Multi-Level Approval**: Guru Mapel -> Wali Kelas -> Kepala Sekolah.
- **Audit Logging**: Track every cell edit with user identity and timestamp.
- **Digital Signatures**: Integration with QR-verified digital signatures for the final Leger report.

---

## 🛠️ TECHNICAL SPECIFICATION

### Backend (Express)
- `AssessmentController.ts`: Handle complex SQL joins for cross-subject data.
- `api/v1/akademik/assessment/smart-leger`: Main endpoint for fetching the full grid.
- `api/v1/akademik/assessment/ai-analyze`: Endpoint for Gemini-powered insights.

### Database (Prisma)
- Use `Student`, `Subject`, `AssessmentScore`, and `AssessmentComponent` relations.
- Optimize with raw queries for large-scale data retrieval (100+ students x 20+ subjects).

### Frontend (React)
- **Spreadsheet UI**: Using custom Tailwind-based grid with sticky headers.
- **Lazy Loading**: Virtualization for high-performance rendering.
- **Real-time Feedback**: Instant calculation using local state before auto-saving to DB.

---

## ✅ SUCCESS CRITERIA
1. Zero hardcoded subject names in the UI.
2. Dynamic weighted score calculation working perfectly.
3. AI analysis returning meaningful insights based on real data.
4. Production-ready audit log for all changes.
