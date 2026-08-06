# ERP ENTERPRISE BLUEPRINT V3

# 18_DATA_DICTIONARY.md

Version : 3.0

Priority : CRITICAL

Status : Enterprise

====================================================

PURPOSE

====================================================

Dokumen ini menjadi
sumber utama
seluruh struktur data ERP.

Tidak boleh ada
field database

API

DTO

Form

Report

Import

Export

yang dibuat
di luar Data Dictionary.

====================================================

DATA SOURCE

====================================================

Seluruh field berasal dari

Dapodik

EMIS

BAN S/M

BAN PDM

PDP Indonesia

Kementerian Agama

Kementerian Pendidikan

Internal ERP

====================================================

STANDARD FIELD

====================================================

Semua tabel wajib memiliki

id

uuid

tenant_id

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by

version

sync_version

status

====================================================

FIELD TYPE

====================================================

UUID

VARCHAR

TEXT

BOOLEAN

INTEGER

BIGINT

DECIMAL

DATE

TIME

DATETIME

JSON

ENUM

====================================================

FIELD PROPERTY

====================================================

Setiap field

WAJIB memiliki

Nama

Label

Description

Data Type

Length

Nullable

Default Value

Validation

Unique

Index

Reference

Source

====================================================

NAMING

====================================================

Gunakan

snake_case

Tidak boleh

camelCase

di database.

====================================================

PRIMARY KEY

====================================================

UUID

====================================================

FOREIGN KEY

====================================================

Seluruh relasi

WAJIB

menggunakan UUID.

====================================================

INDEX

====================================================

Semua field

yang sering dicari

WAJIB

memiliki Index.

====================================================

SOFT DELETE

====================================================

Semua Entity

WAJIB

mendukung

Soft Delete.

====================================================

AUDIT FIELD

====================================================

created_by

updated_by

deleted_by

approved_by

approved_at

====================================================

SYNC FIELD

====================================================

version

sync_version

sync_status

last_sync_at

====================================================

FILE FIELD

====================================================

path

filename

mime_type

extension

checksum

size

====================================================

LOCATION FIELD

====================================================

latitude

longitude

accuracy

====================================================

BARCODE FIELD

====================================================

barcode

barcode_type

qr_code

====================================================

PHOTO FIELD

====================================================

photo_url

thumbnail_url

====================================================

DOCUMENT FIELD

====================================================

document_number

issue_date

expired_date

====================================================

STATUS FIELD

====================================================

ACTIVE

INACTIVE

ARCHIVED

DELETED

====================================================

VALIDATION

====================================================

Semua field

WAJIB memiliki

Validation Rule.

====================================================

IMPORT

====================================================

Excel

CSV

JSON

====================================================

EXPORT

====================================================

Excel

PDF

CSV

JSON

====================================================

API

====================================================

Seluruh API

mengacu

ke Data Dictionary.

====================================================

FORM

====================================================

Seluruh Form

dibangun

berdasarkan

Data Dictionary.

====================================================

FINAL RULE

====================================================

Data Dictionary

adalah

Single Source of Truth

untuk seluruh ERP.

Tidak boleh
membuat field baru
tanpa memperbarui
dokumen ini.