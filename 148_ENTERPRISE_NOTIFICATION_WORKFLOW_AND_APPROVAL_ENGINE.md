# ENTERPRISE NOTIFICATION, WORKFLOW & MULTI-TIER APPROVAL ENGINE
## Master Specification & Architectural Blueprint (Sprint 28 / Engine 148)

---

### 1. Executive Summary & Architectural Scope
The **Enterprise Notification, Workflow & Multi-Tier Approval Engine** provides an immutable, backend-first, multi-channel orchestration backbone for the entire school ERP platform. It unifies:
1. **Multi-Channel Dispatching Matrix**: Push (FCM / WebPush), In-App notifications, WhatsApp Gateway (Cloud API & Baileys/Wabot), Email (SMTP / SendGrid), and SMS (Twilio).
2. **Multi-Level Approval State Machine**: Maker-Checker-Approver workflows with configurable thresholds, role-based approval ladders, sequential/parallel approval paths, auto-escalation timeouts, and comprehensive audit trail generation.
3. **Event-Driven Automation Engine**: Reactive triggers reacting to operational events across the system (leave requests, financial vouchers, inventory movements, attendance anomalies, academic administration deadlines, official document signing).
4. **Intelligent Dynamic Template Engine**: Smart token substitution (`{{student_name}}`, `{{amount}}`, `{{due_date}}`, `{{approver_name}}`, `{{approval_link}}`), conditional content blocks, and AI-assisted drafting.
5. **Robust Outbox Queue & Reliability**: Guaranteed at-least-once delivery, exponential backoff retries, dead-letter queues (DLQ), and immutable transmission receipts.
6. **Strict Non-Academic Separation**: Fully decoupled from internal scoring/academic grading engines while retaining full support for operational attendance and administration workflows.

---

### 2. Core Functional Requirements & Domain Models

#### 2.1 Multi-Level Approval State Machine
Approval workflows follow a deterministic directed acyclic graph (DAG) or sequential pipeline:
- **States**: `DRAFT` -> `SUBMITTED` -> `PENDING_LEVEL_1` -> `PENDING_LEVEL_2` -> ... -> `APPROVED` | `REJECTED` | `REVISED` | `CANCELLED` | `ESCALATED`.
- **Threshold-Based Routing**:
  - Financial disbursements < Rp 1.000.000 -> 1 Level Approval (Bendahara / Kepala TU).
  - Financial disbursements Rp 1.000.000 - Rp 10.000.000 -> 2 Level Approval (Kepala TU -> Kepala Sekolah).
  - Financial disbursements > Rp 10.000.000 -> 3 Level Approval (Kepala Sekolah -> Ketua Yayasan).
- **Domain Modules Integrated**:
  1. *Perizinan Santri / Pegawai (Leave Permission)*: Wali Asrama -> Pengasuh Pondok / Kepala Sekolah.
  2. *Keuangan & Kas (Financial Vouchers)*: Staff Keuangan -> Bendahara -> Kepala Sekolah.
  3. *Inventaris & Aset (Asset Disposal / Procurement)*: Pengelola Aset -> Kepala TU -> Kepala Sekolah.
  4. *Surat & Dokumen Resmi (Official Letter Signing)*: Konseptor TU -> Verifikator -> Penandatangan.
  5. *Koreksi Presensi (Attendance Correction)*: Pegawai -> Atasan Langsung -> HR / TU.

#### 2.2 Notification Channels & Dispatcher
- **In-App Notification**: Real-time notification feed with read/unread tracking, grouping by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and direct actionable deep links.
- **WhatsApp Cloud / Gateway**: Auto-dispatch with template verification, fallback retries, interactive quick-reply actions, and delivery status webhook tracking (`SENT`, `DELIVERED`, `READ`, `FAILED`).
- **Email Dispatcher**: Responsive HTML templates with dynamic branding (KOP Surat & Yayasan), attachment support, and cryptographic verification links.
- **Push Notification**: Web push notifications for desktop & mobile PWA with badge count synchronization.

#### 2.3 Automation & Event Trigger Rules
- Configurable event listeners:
  - `STUDENT_LEAVE_REQUESTED`: Trigger approval notification to Wali Asrama.
  - `LEAVE_APPROVED`: Trigger notification to Orang Tua/Wali Santri & Security Pos Satpam.
  - `BILLING_GENERATED`: Trigger WhatsApp reminder with payment link to Wali Santri.
  - `BILLING_OVERDUE`: Trigger tiered escalation reminders (H-3, H-0, H+7).
  - `DISBURSEMENT_SUBMITTED`: Trigger multi-tier approval to respective approvers based on threshold.
  - `ANOMALY_ATTENDANCE_DETECTED`: Trigger alert to Wali Kelas and HR Admin.

---

### 3. Database Schema & Data Models

#### 3.1 `WorkflowDefinition`
```typescript
interface WorkflowDefinition {
  id: string;
  tenant_id: string;
  category_id: string;
  name: string;
  code: string;
  description: string;
  trigger_event: string;
  threshold_rules: {
    min_amount?: number;
    max_amount?: number;
    urgency?: string;
    target_roles: string[];
  }[];
  steps: {
    step_order: number;
    step_name: string;
    approver_role: string;
    approver_user_id?: string;
    sla_hours: number;
    is_mandatory: boolean;
    auto_escalate_to?: string;
  }[];
  nodes?: any[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}
```

#### 3.2 `WorkflowInstance`
```typescript
interface WorkflowInstance {
  id: string;
  tenant_id: string;
  workflow_id: string;
  title: string;
  reference_type: 'LEAVE_PERMISSION' | 'FINANCIAL_VOUCHER' | 'ASSET_MOVEMENT' | 'OFFICIAL_DOCUMENT' | 'ATTENDANCE_CORRECTION' | 'CUSTOM';
  reference_id: string;
  requester_id: string;
  requester_name: string;
  requester_role: string;
  current_step_order: number;
  current_status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'CANCELLED';
  amount?: number;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

#### 3.3 `WorkflowTask`
```typescript
interface WorkflowTask {
  id: string;
  tenant_id: string;
  instance_id: string;
  step_order: number;
  task_name: string;
  assigned_role: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'SKIPPED';
  action_by_id?: string;
  action_by_name?: string;
  action_at?: string;
  notes?: string;
  sla_deadline?: string;
  is_escalated: boolean;
  created_at: string;
  updated_at: string;
}
```

#### 3.4 `NotificationTemplate` & `NotificationQueue`
```typescript
interface NotificationTemplate {
  id: string;
  tenant_id: string;
  name: string;
  channel_name: 'IN_APP' | 'WHATSAPP' | 'EMAIL' | 'PUSH' | 'SMS';
  category: string;
  subject?: string;
  body: string;
  variables: string[];
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

interface NotificationQueue {
  id: string;
  tenant_id: string;
  template_id?: string;
  channel_name: string;
  recipient: string;
  recipient_name?: string;
  payload: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Queued' | 'Sending' | 'Delivered' | 'Failed' | 'DeadLetter';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 4. API Endpoints & Actions Contract

The engine provides comprehensive REST endpoints under `/api/action` and `/api/v1/notifications` / `/api/v1/workflows`:
- **Workflow Definitions**: `getWorkflowCategories`, `getWorkflowTemplates`, `getWorkflowDefinitions`, `saveWorkflowDefinition`, `deleteWorkflowDefinition`.
- **Workflow Instances & Approvals**: `getWorkflowInstances`, `createWorkflowInstance`, `getWorkflowTasks`, `processWorkflowTask`, `cancelWorkflowInstance`.
- **Notification Management**: `announcementList`, `announcementCreate`, `announcementPublish`, `announcementDelete`, `announcementGenerateWording`, `broadcastCreate`, `broadcastSend`, `notificationTemplate`, `notificationQueue`, `notificationSend`, `notificationRetry`, `emailSend`, `pushSend`, `deliveryStatistic`, `notificationProvider`.
- **Automation & Integrations**: `automationRule`, `getN8nIntegrations`, `saveN8nIntegration`, `triggerN8nSimulator`.

---

### 5. Non-Academic Boundary & Zero-Mock Verification
1. **Academic Isolation**: No tight coupling with KBM lesson grades, CBT test scoring, or Leger generation.
2. **Audit Trail Guarantee**: Every approval transition, rejection note, and message dispatch creates an immutable log in `AuditLog` with timestamp and actor tracking.
3. **No Dummy Statistics**: All counts and KPI metrics are calculated in real time from queue records, task instances, and transmission logs.
