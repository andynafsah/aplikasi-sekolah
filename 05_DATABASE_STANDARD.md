# MASTER PROMPT V3
# 05_DATABASE_STANDARD.md

Version : 3.0.0

Priority : CRITICAL

Status : Production

====================================================

# PURPOSE

Dokumen ini menjadi standar
seluruh database ERP.

Semua Sprint
WAJIB mengikuti dokumen ini.

AI tidak boleh
membuat struktur tabel
di luar standar ini.

====================================================

# DATABASE ENGINE

Primary Database

MySQL 8.4 LTS

Storage Engine

InnoDB

Character Set

utf8mb4

Collation

utf8mb4_unicode_ci

Timezone

UTC

====================================================

# DATABASE PRINCIPLE

Single Source of Truth

Normalized Database

Reusable

Scalable

High Performance

Audit Ready

History Ready

Multi Tenant Ready

Offline Ready

AI Ready

====================================================

# PRIMARY KEY

Gunakan UUID.

Format

CHAR(36)

Contoh

id

36 Character UUID

Tidak menggunakan

AUTO_INCREMENT

kecuali tabel log
yang sangat besar
dan memang diperlukan.

====================================================

# STANDARD COLUMN

Semua tabel
WAJIB memiliki

id

tenant_id

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by

version

====================================================

# SOFT DELETE

Seluruh data
menggunakan

deleted_at

deleted_by

Tidak diperbolehkan
menghapus data permanen
kecuali oleh
System Owner.

====================================================

# AUDIT

Semua perubahan data
harus tercatat.

Create

Update

Delete

Approve

Reject

Restore

Import

Export

====================================================

# AUDIT TABLE

audit_logs

Field

id

tenant_id

module

table_name

record_id

action

old_value

new_value

ip_address

browser

device

user_agent

created_by

created_at

====================================================

# MULTI TENANT

Semua tabel

WAJIB memiliki

tenant_id

Semua query

WAJIB otomatis
memfilter tenant_id

kecuali

System Owner

====================================================

# RELATION

Gunakan

Foreign Key

ON UPDATE CASCADE

ON DELETE RESTRICT

Tidak boleh
menggunakan
Foreign Key
tanpa index.

====================================================

# INDEX

Gunakan

Primary Key

Unique Index

Composite Index

Foreign Index

Full Text Index
bila diperlukan.

====================================================

# DATA TYPE

UUID

CHAR(36)

Name

VARCHAR(200)

Description

TEXT

JSON

JSON

Price

DECIMAL(18,2)

Date

DATE

Time

TIME

Datetime

DATETIME

Boolean

BOOLEAN

====================================================

# ENUM

Hindari ENUM.

Jika data
berpotensi bertambah

gunakan

Master Table.

Contoh

Status

Jenis Kelamin

Agama

Golongan

Jabatan

====================================================

# MASTER TABLE

Semua master
dipisahkan.

Contoh

master_religions

master_genders

master_jobs

master_provinces

master_cities

master_districts

master_villages

====================================================

# HISTORY

Seluruh transaksi penting

memiliki

History Table.

Contoh

student_history

salary_history

finance_history

attendance_history

====================================================

# FILE

Dokumen
tidak disimpan
di database.

Database
hanya menyimpan

metadata

filename

path

mime

size

hash

====================================================

# BARCODE

Setiap

Student

Teacher

Employee

Inventory

Library

Asset

WAJIB memiliki

barcode

qr_code

====================================================

# SEARCH

Gunakan

Full Text Search

untuk

Nama

Alamat

Catatan

Dokumen

====================================================

# IMPORT

Semua modul
mendukung

Excel

CSV

JSON

====================================================

# EXPORT

Semua modul
mendukung

Excel

CSV

PDF

JSON

====================================================

# BACKUP

Database

Backup Harian

Backup Mingguan

Backup Bulanan

Backup Manual

====================================================

# RESTORE

Restore

Per Tenant

Per Modul

Full Database

====================================================

# MIGRATION

Gunakan

Prisma Migration

Semua perubahan database
melalui migration.

Tidak boleh
mengubah tabel langsung.

====================================================

# SEEDER

Gunakan

Prisma Seeder

Semua master
dibuat melalui Seeder.

====================================================

# NAMING

Table

snake_case

Column

snake_case

Constraint

fk_

Index

idx_

Unique

uk_

====================================================

# DAPODIK READY

Semua data siswa
mengikuti standar Dapodik.

Semua data guru
mengikuti standar Dapodik.

====================================================

# EMIS READY

Semua data santri
mengikuti standar EMIS.

====================================================

# AKREDITASI READY

Database harus mendukung

BAN-PDM

BAN-SM

BAN-PT

dan kebutuhan
akreditasi lainnya.

====================================================

# OFFLINE

Semua tabel transaksi

harus memiliki

sync_status

sync_at

sync_version

====================================================

# VERSION

Semua tabel

version

digunakan
untuk sinkronisasi.

====================================================

# FINAL RULE

AI tidak boleh
membuat tabel
yang tidak mengikuti
dokumen ini.

Dokumen ini
menjadi standar
seluruh database ERP.