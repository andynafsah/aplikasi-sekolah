# MASTER PROMPT V3
# 07_FRONTEND_STANDARD.md

Version : 3.0.0

Priority : CRITICAL

Status : Production

====================================================

PURPOSE

Dokumen ini menjadi standar
seluruh Frontend ERP.

Semua Sprint
WAJIB mengikuti
dokumen ini.

====================================================

FRONTEND STACK

Framework

React 19

Language

TypeScript

Bundler

Vite

CSS

TailwindCSS

Routing

React Router

State Management

Zustand

Server State

TanStack Query

Form

React Hook Form

Validation

Zod

HTTP

Axios

Table

TanStack Table

Calendar

FullCalendar

Chart

Recharts

Icons

Lucide React

Animation

Framer Motion

Date Library

dayjs

Barcode

JsBarcode

QR Code

react-qr-code

Printing

react-to-print

PDF

React PDF

====================================================

FRONTEND PRINCIPLE

Frontend hanya bertugas

Presentation

User Interaction

Form Validation

API Communication

Navigation

State UI

Frontend tidak boleh

Business Logic

Database Query

Perhitungan utama

Rule Engine

====================================================

ARCHITECTURE

src/

assets/

components/

features/

hooks/

layouts/

pages/

providers/

routes/

services/

stores/

types/

utils/

validators/

====================================================

COMPONENT RULE

Gunakan

Atomic Design

Atoms

Molecules

Organisms

Templates

Pages

====================================================

FEATURE STRUCTURE

students/

components/

pages/

hooks/

services/

types/

validators/

teachers/

attendance/

finance/

payroll/

library/

inventory/

====================================================

ROUTING

Gunakan

React Router.

Pisahkan

Public Route

Protected Route

Tenant Route

Admin Route

Owner Route

====================================================

LAYOUT

Minimal

Public Layout

Dashboard Layout

Admin Layout

Auth Layout

Print Layout

====================================================

STATE MANAGEMENT

Gunakan

Zustand

Hanya untuk

Theme

Sidebar

Session

User Profile

Configuration

UI State

====================================================

SERVER STATE

Gunakan

TanStack Query

Untuk

GET

POST

PUT

PATCH

DELETE

Caching

Retry

Refetch

Invalidation

====================================================

FORM

Gunakan

React Hook Form

Semua Form

WAJIB menggunakan

Zod Validation.

====================================================

VALIDATION

Client Validation

Zod

Server Validation

Backend

====================================================

HTTP

Gunakan

Axios

Semua Request

melalui

API Client.

Tidak boleh

fetch()

langsung.

====================================================

API CLIENT

Semua komunikasi
menggunakan

services/api.ts

Gunakan

Interceptor

Access Token

Refresh Token

Error Handler

====================================================

AUTH

Login

Logout

Refresh Token

Remember Me

Multi Device Ready

====================================================

ROLE

Gunakan

RBAC.

Frontend hanya
menampilkan menu
sesuai Permission.

====================================================

MENU

Menu dibangun
berdasarkan

Permission

Role

Tenant

Subscription

====================================================

TABLE

Gunakan

TanStack Table

Support

Sorting

Filtering

Column Visibility

Pagination

Export

Import

====================================================

SEARCH

Semua halaman list

WAJIB memiliki

Search

Filter

Sorting

Pagination

====================================================

UPLOAD

Gunakan

React Dropzone

Support

Image

PDF

Word

Excel

ZIP

====================================================

IMAGE

Preview

Resize

Crop

Compress

====================================================

BARCODE

Semua modul

Student

Teacher

Employee

Library

Inventory

Asset

WAJIB dapat
menampilkan Barcode
dan QR Code.

====================================================

THEME

Light

Dark

System

====================================================

RESPONSIVE

Desktop

Laptop

Tablet

Mobile

====================================================

ACCESSIBILITY

Keyboard Navigation

Focus Ring

Screen Reader Ready

Color Contrast

====================================================

NOTIFICATION

Toast

Dialog

Confirmation

Progress

====================================================

ERROR UI

404

403

500

Offline

Maintenance

====================================================

OFFLINE

Frontend
menyimpan Queue
sementara
jika internet putus.

====================================================

PRINT

Semua modul

harus dapat

Print

PDF

Excel

====================================================

LOADING

Skeleton

Spinner

Progress Bar

====================================================

CODE STYLE

Gunakan

Functional Component.

Gunakan Hooks.

Tidak menggunakan

Class Component.

====================================================

NAMING

Component

PascalCase

Hook

useStudent()

Store

useAuthStore()

Page

StudentPage

====================================================

TESTING

Gunakan

Vitest

React Testing Library

Playwright

====================================================

DOCUMENTATION

Semua Component

WAJIB memiliki

Props

Description

Usage

====================================================

FINAL RULE

Frontend

tidak boleh

mengandung

Business Logic.

Frontend

hanya

Presentation Layer.

Seluruh Sprint

WAJIB mengikuti
dokumen ini.