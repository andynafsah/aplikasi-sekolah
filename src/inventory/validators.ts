/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  InventoryItemDTO, 
  CategoryDTO, 
  SupplierDTO, 
  PurchaseRequestDTO, 
  FixedAssetDTO, 
  AssetLoanDTO 
} from './dto';

export class InventoryValidator {
  public static validateItem(item: InventoryItemDTO): string | null {
    if (!item.name || item.name.trim() === '') return 'Nama barang wajib diisi';
    if (!item.code || item.code.trim() === '') return 'Kode barang wajib diisi';
    if (!item.unit || item.unit.trim() === '') return 'Satuan wajib diisi';
    if (item.quantity < 0) return 'Stok tidak boleh negatif';
    if (item.min_stock < 0) return 'Stok minimal tidak boleh negatif';
    return null;
  }

  public static validateCategory(cat: CategoryDTO): string | null {
    if (!cat.name || cat.name.trim() === '') return 'Nama kategori wajib diisi';
    if (!cat.code || cat.code.trim() === '') return 'Kode kategori wajib diisi';
    return null;
  }

  public static validateSupplier(sup: SupplierDTO): string | null {
    if (!sup.name || sup.name.trim() === '') return 'Nama supplier wajib diisi';
    if (!sup.address || sup.address.trim() === '') return 'Alamat supplier wajib diisi';
    if (!sup.contact || sup.contact.trim() === '') return 'Kontak supplier wajib diisi';
    return null;
  }

  public static validatePurchaseRequest(pr: PurchaseRequestDTO): string | null {
    if (!pr.item_name || pr.item_name.trim() === '') return 'Nama barang pengadaan wajib diisi';
    if (pr.quantity <= 0) return 'Jumlah kuantitas harus lebih dari 0';
    if (pr.estimated_cost <= 0) return 'Estimasi biaya harus lebih dari 0';
    if (!pr.requester || pr.requester.trim() === '') return 'Pemohon wajib diisi';
    return null;
  }

  public static validateFixedAsset(asset: FixedAssetDTO): string | null {
    if (!asset.name || asset.name.trim() === '') return 'Nama aset wajib diisi';
    if (!asset.code || asset.code.trim() === '') return 'Kode aset wajib diisi';
    if (asset.cost <= 0) return 'Nilai perolehan aset harus lebih dari 0';
    if (asset.depreciation_rate < 0 || asset.depreciation_rate > 100) return 'Persentase penyusutan harus antara 0% dan 100%';
    return null;
  }

  public static validateAssetLoan(loan: AssetLoanDTO): string | null {
    if (!loan.asset_id) return 'ID Aset wajib diisi';
    if (!loan.borrower_name || loan.borrower_name.trim() === '') return 'Nama peminjam wajib diisi';
    if (!loan.loan_date) return 'Tanggal peminjaman wajib diisi';
    if (!loan.due_date) return 'Tanggal jatuh tempo pengembalian wajib diisi';
    return null;
  }
}
