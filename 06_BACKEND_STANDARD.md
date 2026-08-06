# MASTER PROMPT V3
# 06_BACKEND_STANDARD.md

Version : 3.0.0

Priority : CRITICAL

Status : Production

====================================================

# PURPOSE

Dokumen ini menentukan
standar Backend
ERP Sekolah & Pondok Pesantren.

Seluruh Sprint
WAJIB mengikuti
dokumen ini.

====================================================

# BACKEND STACK

Runtime

Node.js 22 LTS

Framework

Fastify

Language

TypeScript

ORM

Prisma ORM

Database

MySQL 8

Validation

Zod

Authentication

JWT

Refresh Token

Logging

Pino

Queue

BullMQ

Cache

Redis

====================================================

# BACKEND PRINCIPLE

Gunakan

Clean Architecture

Repository Pattern

Service Layer

Dependency Injection

DTO

Validation Layer

Middleware

Global Error Handler

====================================================

# REQUEST FLOW

Client

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

Prisma ORM

↓

MySQL

↓

Response

====================================================

# CONTROLLER

Controller hanya bertugas

Menerima Request

Memanggil Service

Mengembalikan Response

Controller tidak boleh

Business Logic

SQL

Prisma Query

Calculation

====================================================

# SERVICE

Service bertugas

Business Rule

Workflow

Validation lanjutan

Calculation

Approval

Transaction

AI Integration

Notification

Service tidak boleh

Query Database secara langsung.

====================================================

# REPOSITORY

Repository bertugas

Create

Read

Update

Delete

Search

Filter

Pagination

Repository hanya berisi
akses database.

====================================================

# DTO

Semua Request

WAJIB menggunakan DTO.

Contoh

CreateStudentDto

UpdateStudentDto

CreateTeacherDto

UpdateTeacherDto

====================================================

# VALIDATION

Gunakan

Zod

Semua input

WAJIB divalidasi.

====================================================

# RESPONSE STANDARD

{
success,
message,
data,
meta,
errors
}

Semua endpoint
menggunakan format ini.

====================================================

# ERROR HANDLER

Gunakan

Global Error Handler

Validation Error

Authentication Error

Authorization Error

Business Error

Database Error

Unknown Error

====================================================

# AUTHENTICATION

JWT Access Token

Refresh Token

Session

Remember Me

Logout

Single Device

Multiple Device Ready

====================================================

# AUTHORIZATION

Gunakan

RBAC

Role

Permission

Policy

====================================================

# MIDDLEWARE

Authentication

Authorization

Tenant Resolver

Audit

Request Logger

Rate Limit

====================================================

# TRANSACTION

Semua proses
yang mengubah
lebih dari satu tabel

WAJIB menggunakan
Prisma Transaction.

====================================================

# FILE UPLOAD

Gunakan

Multipart

Semua file

divalidasi

Ukuran

Tipe

Virus Scan Ready

====================================================

# IMAGE

Gunakan Sharp.

Resize otomatis.

Compress otomatis.

Thumbnail otomatis.

====================================================

# STORAGE

Backend hanya
menyimpan metadata.

File disimpan
di Storage Service.

====================================================

# AUDIT

Semua perubahan

Create

Update

Delete

Approve

Reject

Restore

Import

Export

Harus masuk Audit Log.

====================================================

# EVENT

Gunakan Event.

Contoh

StudentCreated

TeacherCreated

AttendanceCreated

PayrollGenerated

InvoicePaid

====================================================

# QUEUE

Gunakan Queue

untuk

Email

WhatsApp

PDF

Import

Export

Backup

Restore

OCR

AI

====================================================

# CACHE

Gunakan Redis

untuk

Session

Permission

Menu

Dashboard

Configuration

OTP

====================================================

# API VERSION

/api/v1

Semua endpoint

menggunakan versioning.

====================================================

# API PREFIX

/auth

/students

/teachers

/employees

/attendance

/finance

/payroll

/library

/inventory

/dormitory

/report

/settings

====================================================

# LOGGING

Gunakan Pino.

Log

Request

Response

Slow Query

Exception

Audit

====================================================

# CONFIGURATION

Gunakan

.env

Tidak boleh
hardcode

Credential

Secret

API Key

====================================================

# GOOGLE WORKSPACE

Google Apps Script

BUKAN Backend.

Backend hanya
berkomunikasi

melalui

Google Workspace Service.

====================================================

# AI

Backend hanya
berkomunikasi

melalui

AI Provider Interface.

Tidak boleh
langsung memanggil
provider AI
dari Controller.

====================================================

# TESTING

Semua endpoint

WAJIB memiliki

Unit Test

Integration Test

API Test

====================================================

# DOCUMENTATION

Semua endpoint

harus otomatis
terdokumentasi

OpenAPI

Swagger

====================================================

# FINAL RULE

Seluruh Backend
ERP

WAJIB mengikuti
dokumen ini.

Tidak boleh
membuat Backend
di luar standar ini.