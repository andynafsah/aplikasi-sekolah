# MASTER PROMPT V3
# 02_SYSTEM_ARCHITECTURE.md

Version : 3.0.0

Status : Enterprise

Priority : Highest

---

# SYSTEM ARCHITECTURE

Gunakan Enterprise Clean Architecture.

Seluruh modul wajib mengikuti
arsitektur ini.

Tidak diperbolehkan membuat
arsitektur baru
tanpa persetujuan.

---

# HIGH LEVEL ARCHITECTURE

                    Client Layer
────────────────────────────────────────────

React Web

Progressive Web App

React Native Mobile

Desktop (Future)

────────────────────────────────────────────

API Layer

REST API

JSON

HTTPS

JWT

────────────────────────────────────────────

Backend Layer

Node.js 22 LTS

Fastify

TypeScript

────────────────────────────────────────────

Business Layer

Controller

↓

Service

↓

Repository

↓

Prisma ORM

────────────────────────────────────────────

Database Layer

MySQL 8

────────────────────────────────────────────

Infrastructure

Redis

BullMQ

MinIO

Google Workspace

AI Engine

Monitoring

Backup

────────────────────────────────────────────

---

# CLIENT LAYER

Client tidak boleh
mengakses database.

Client hanya
mengakses REST API.

Semua komunikasi

HTTPS JSON.

---

# FRONTEND

Gunakan

React 19

TypeScript

Vite

TailwindCSS

React Router

TanStack Query

React Hook Form

Axios

Zod

Zustand

Frontend tidak boleh
berisi Business Logic.

Business Logic
berada di Backend.

---

# BACKEND

Gunakan

Node.js

Fastify

TypeScript

Prisma ORM

MySQL

Redis

BullMQ

Pino Logger

Zod Validation

Helmet

CORS

---

# BACKEND FLOW

HTTP Request

↓

Route

↓

Middleware

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

MySQL

↓

Response

---

# CONTROLLER

Controller hanya bertugas

Menerima Request

Validasi dasar

Memanggil Service

Mengirim Response

Controller tidak boleh

Query Database

Business Logic

SQL

---

# SERVICE

Service bertugas

Business Logic

Workflow

Validation

Calculation

Rule Engine

Transaction

Service tidak boleh

Mengakses Prisma langsung.

---

# REPOSITORY

Repository bertugas

Query Database

Create

Read

Update

Delete

Search

Pagination

Repository tidak boleh

Business Logic.

---

# DATABASE

Database utama

MySQL 8.4 LTS

Storage Engine

InnoDB

Charset

utf8mb4

UUID

Soft Delete

Foreign Key

Composite Index

Audit Ready

---

# CACHE

Gunakan Redis.

Cache hanya digunakan
untuk data yang sering dibaca.

Cache tidak boleh
menjadi sumber data utama.

---

# STORAGE

Gunakan MinIO.

Cloud Storage harus kompatibel dengan

Amazon S3

Cloudflare R2

Backblaze B2

Google Cloud Storage

Dokumen tidak disimpan
di database.

Database hanya menyimpan metadata.

---

# QUEUE

Gunakan BullMQ.

Queue digunakan untuk

Import

Export

Generate PDF

Generate ID Card

Email

WhatsApp

Backup

Restore

OCR

AI Processing

---

# EVENT BUS

Semua modul besar
menggunakan Event.

Contoh

Student Created

↓

Generate Barcode

↓

Generate QR

↓

Generate ID Card

↓

Create Notification

↓

Audit Log

↓

Sync Mobile

↓

Search Index

---

# GOOGLE WORKSPACE

Google Apps Script

BUKAN Backend.

Google Apps Script hanya
bertugas sebagai

Google Workspace Connector.

---

# GOOGLE SERVICE

Google Drive

Google Docs

Google Sheets

Google Calendar

Google Meet

Gmail

Gemini AI

---

# AI ENGINE

AI tidak boleh
mengakses database langsung.

Semua komunikasi AI

↓

Backend

↓

AI Service

↓

Provider

↓

Gemini

OpenAI

Claude

DeepSeek

Ollama

---

# MOBILE

Mobile menggunakan

React Native.

Menggunakan API
yang sama
dengan React Web.

Tidak boleh
membuat API khusus
jika API lama
masih dapat digunakan.

---

# OFFLINE

Gunakan

Offline Queue.

Semua perubahan
disimpan lokal.

Ketika internet tersedia

↓

Sinkronisasi otomatis.

---

# MULTI TENANT

Semua data

tenant_id

Semua Repository

wajib otomatis
menambahkan tenant filter.

---

# AUDIT

Semua perubahan data

Create

Update

Delete

Approve

Reject

Login

Logout

Harus tercatat.

---

# NOTIFICATION

Notification Service

Email

WhatsApp

Telegram

SMS

Push Notification

In App Notification

---

# REPORT

Semua laporan

PDF

Excel

Word

CSV

Harus melalui

Report Service.

---

# DOCUMENT

Document Service

Upload

Download

Version

Approval

Archive

Restore

OCR Ready

---

# SECURITY

Gunakan

JWT

Refresh Token

RBAC

Permission

Encryption

Rate Limit

Helmet

Prepared Statement

Audit

CSRF

XSS

SQL Injection Protection

---

# LOGGING

Gunakan

Pino Logger.

Semua Error

Audit

Slow Query

Request

Response

harus dicatat.

---

# DEPLOYMENT

Backend

Docker

Frontend

Docker

MySQL

Docker

Redis

Docker

MinIO

Docker

Nginx

Docker

Coolify Ready

Portainer Ready

---

# FOLDER PRINCIPLE

Frontend

Backend

Mobile

Docs

Database

Infrastructure

Harus dipisahkan.

---

# API PRINCIPLE

REST API

JSON

Versioning

/api/v1

Semua endpoint

menggunakan format yang sama.

---

# RESPONSE STANDARD

{
success,
message,
data,
meta,
errors
}

Tidak boleh
menggunakan format berbeda.

---

# FINAL RULE

Seluruh Sprint
wajib mengikuti
arsitektur ini.

Tidak diperbolehkan
membuat arsitektur lain
tanpa persetujuan.

Dokumen ini
menjadi acuan utama
Backend,
Frontend,
Database,
API,
Mobile,
AI,
dan Integrasi.