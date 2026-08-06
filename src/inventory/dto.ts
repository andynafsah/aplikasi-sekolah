/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- DTOs for Inventory and Logistics ---
export interface InventoryItemDTO {
  id?: string;
  name: string;
  code: string;
  category_id: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  unit: string;
  min_stock: number;
  quantity: number;
  warehouse_id: string;
  rack?: string;
}

export interface CategoryDTO {
  id?: string;
  name: string;
  code: string;
}

export interface UnitDTO {
  id?: string;
  name: string;
  code: string;
}

export interface WarehouseDTO {
  id?: string;
  name: string;
  code: string;
  location?: string;
}

export interface SupplierDTO {
  id?: string;
  name: string;
  address: string;
  contact: string;
  npwp?: string;
  bank_info?: string;
}

// --- DTOs for Procurement ---
export interface PurchaseRequestDTO {
  id?: string;
  item_name: string;
  quantity: number;
  estimated_cost: number;
  requester: string;
  department: string;
  date: string;
  notes?: string;
}

export interface PurchaseOrderDTO {
  id?: string;
  request_id: string;
  po_number: string;
  supplier_id: string;
  date: string;
  total_amount: number;
  status: 'SENT' | 'DELIVERED' | 'PAID';
}

export interface ReceivingDTO {
  id?: string;
  po_id: string;
  received_date: string;
  received_by: string;
  notes?: string;
}

// --- DTOs for Fixed Assets ---
export interface FixedAssetDTO {
  id?: string;
  name: string;
  code: string;
  category: 'Gedung' | 'Tanah' | 'Kendaraan' | 'Komputer' | 'Printer' | 'Furniture' | 'Mesin' | 'Elektronik';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'BROKEN' | 'DECOMMISSIONED' | 'SCRAPPED';
  purchase_date: string;
  cost: number;
  location: string;
  depreciation_method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'CUSTOM';
  depreciation_rate: number;
  residual_value: number;
  useful_life: number;
}

export interface AssetLoanDTO {
  id?: string;
  asset_id: string;
  borrower_name: string;
  borrower_type: 'GURU' | 'KARYAWAN' | 'SANTRI' | 'SISWA' | 'UNIT';
  loan_date: string;
  due_date: string;
}

export interface AssetMaintenanceDTO {
  id?: string;
  asset_id: string;
  schedule_date: string;
  cost: number;
  vendor: string;
  description: string;
}
