Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah arsitektur backend.
Jangan membuat business logic di Flutter.

Buat dokumen lengkap:

71_MOBILE_API_CONTRACT.md

==================================================

TARGET

Buat Mobile API Contract resmi.

Dokumen ini menjadi standar komunikasi antara:

ERP Web

Flutter Mobile

REST API

Semua endpoint menggunakan backend yang sudah ada.

==================================================

STACK

Backend

Node.js

Express.js

TypeScript

Prisma ORM

MySQL

Authentication

JWT

Refresh Token

Response JSON

==================================================

RULE

Flutter hanya menggunakan REST API.

Tidak boleh query database langsung.

Tidak boleh duplicate business logic.

Semua validasi berada di backend.

==================================================

API STANDARD

Gunakan:

GET

POST

PUT

PATCH

DELETE

Response:

success

message

data

meta

errors

Pagination:

page

limit

total

==================================================

AUTH

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/refresh

GET /api/auth/profile

POST /api/auth/change-password

==================================================

DASHBOARD

GET /api/dashboard

GET /api/dashboard/widgets

GET /api/dashboard/summary

==================================================

MENU

GET /api/menu

GET /api/menu/mobile

Menu berasal dari database sesuai RBAC.

==================================================

PROFILE

GET /api/profile

PUT /api/profile

POST /api/profile/photo

==================================================

ATTENDANCE

GET /api/attendance

POST /api/attendance/checkin

POST /api/attendance/checkout

POST /api/attendance/scan

POST /api/attendance/manual

GET /api/attendance/report

==================================================

KBM

GET /api/kbm

GET /api/kbm/schedule

POST /api/kbm/start

POST /api/kbm/end

POST /api/kbm/journal

==================================================

ASSESSMENT

GET /api/assessment

POST /api/assessment

PUT /api/assessment

GET /api/assessment/formula

==================================================

LEGER

GET /api/leger

GET /api/leger/student

GET /api/leger/class

==================================================

RAPOR

GET /api/report-card

GET /api/report-card/student

POST /api/report-card/finalize

==================================================

STUDENT

GET /api/students

GET /api/students/{id}

POST /api/students

PUT /api/students/{id}

==================================================

EMPLOYEE

GET /api/employees

GET /api/employees/{id}

PUT /api/employees/{id}

==================================================

PARENT

GET /api/parents

GET /api/parents/dashboard

==================================================

BOARDING

GET /api/boarding

GET /api/tahfidz

GET /api/diniyah

==================================================

FINANCE

GET /api/billing

GET /api/payment

POST /api/payment/upload

GET /api/invoice

==================================================

NOTIFICATION

GET /api/notifications

POST /api/notifications/read

==================================================

CALENDAR

GET /api/calendar

GET /api/calendar/events

==================================================

REPORT

GET /api/reports

GET /api/reports/download

==================================================

SETTING

GET /api/settings

==================================================

FILE

POST /api/upload

DELETE /api/upload

==================================================

RBAC

Semua endpoint mengikuti:

Role

Permission

Assignment

Unit

Class

Subject

Tidak boleh hardcode.

==================================================

SECURITY

JWT

HTTPS

Validation

Rate Limit

Audit Trail

==================================================

DOCUMENTATION

Setiap endpoint harus memiliki:

Deskripsi

Method

URL

Header

Request Body

Query Parameter

Response Success

Response Error

Permission

Role

Assignment Scope

Contoh JSON

==================================================

OUTPUT

Buat dokumen API Contract lengkap sebagai standar integrasi Flutter dan ERP Web sehingga seluruh modul mobile menggunakan endpoint yang sama, konsisten, aman, mudah dikembangkan, dan siap produksi tanpa duplikasi business logic.