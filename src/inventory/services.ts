/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryRepository } from './repositories';
import { InventoryMapper } from './mappers';

export class InventoryEngine {
  public static handleStockAdjustment(
    tenantId: string,
    itemId: string,
    type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'OPNAME',
    qty: number,
    userId: string,
    username: string,
    options: {
      fromWarehouseId?: string;
      toWarehouseId?: string;
      refNo?: string;
      notes?: string;
    }
  ): any {
    const item = InventoryRepository.getItems(tenantId).find(i => i.id === itemId);
    if (!item) throw new Error('Barang tidak ditemukan');

    let newQuantity = item.quantity;
    if (type === 'IN') {
      newQuantity += qty;
    } else if (type === 'OUT') {
      if (item.quantity < qty) throw new Error('Stok barang tidak mencukupi');
      newQuantity -= qty;
    } else if (type === 'TRANSFER') {
      if (item.quantity < qty) throw new Error('Stok barang untuk transfer tidak mencukupi');
      newQuantity -= qty;
      
      // Try to find or create the item in destination warehouse
      const destItems = InventoryRepository.getItems(tenantId);
      const destItem = destItems.find(i => i.name === item.name && i.warehouse_id === options.toWarehouseId);
      if (destItem) {
        InventoryRepository.updateItem(tenantId, destItem.id, {
          quantity: destItem.quantity + qty
        }, userId);
      } else {
        InventoryRepository.createItem(tenantId, {
          ...item,
          id: undefined,
          quantity: qty,
          warehouse_id: options.toWarehouseId,
          rack: 'Rak Mutasi'
        }, userId);
      }
    } else if (type === 'ADJUSTMENT' || type === 'OPNAME') {
      newQuantity = qty; // For Adjustment/Opname, qty acts as the actual physical stock count
    }

    // Save updated stock
    const updated = InventoryRepository.updateItem(tenantId, itemId, { quantity: newQuantity }, userId);

    // Create Stock Movement record
    const movement = InventoryRepository.createMovement(tenantId, {
      item_name: item.name,
      type,
      quantity: qty,
      from_warehouse: options.fromWarehouseId,
      to_warehouse: options.toWarehouseId,
      date: new Date().toISOString().split('T')[0],
      ref_no: options.refNo || `MOV-${Date.now()}`,
      operator: username,
      notes: options.notes || `Penyesuaian stok tipe ${type}`
    });

    return { updated, movement };
  }
}

export class ProcurementEngine {
  public static approvePurchaseRequest(tenantId: string, prId: string, username: string): any {
    return InventoryRepository.updatePurchaseRequestStatus(tenantId, prId, 'APPROVED');
  }

  public static rejectPurchaseRequest(tenantId: string, prId: string, username: string): any {
    return InventoryRepository.updatePurchaseRequestStatus(tenantId, prId, 'REJECTED');
  }

  public static createPOFromRequest(
    tenantId: string,
    prId: string,
    supplierId: string,
    poNumber: string,
    totalAmount: number,
    username: string
  ): any {
    const pr = InventoryRepository.getPurchaseRequests(tenantId).find(p => p.id === prId);
    if (!pr) throw new Error('Purchase Request tidak ditemukan');
    if (pr.status !== 'APPROVED') throw new Error('Hanya request berstatus APPROVED yang dapat dibuat PO');

    const po = InventoryRepository.createPurchaseOrder(tenantId, {
      request_id: prId,
      po_number: poNumber,
      supplier_id: supplierId,
      date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      approved_by: username
    });

    return po;
  }
}

export class AssetEngine {
  public static calculateDepreciationReport(tenantId: string): any[] {
    const assets = InventoryRepository.getFixedAssets(tenantId);
    return assets.map(asset => InventoryMapper.mapFixedAsset(asset));
  }

  public static processAssetLoan(
    tenantId: string,
    assetId: string,
    borrowerName: string,
    borrowerType: 'GURU' | 'KARYAWAN' | 'SANTRI' | 'SISWA' | 'UNIT',
    loanDate: string,
    dueDate: string,
    notes?: string
  ): any {
    const asset = InventoryRepository.getFixedAssets(tenantId).find(a => a.id === assetId);
    if (!asset) throw new Error('Aset tidak ditemukan');
    if (asset.status !== 'OPERATIONAL') throw new Error('Aset sedang tidak tersedia untuk dipinjam');

    const loan = InventoryRepository.createLoan(tenantId, {
      asset_id: assetId,
      borrower_name: borrowerName,
      borrower_type: borrowerType,
      loan_date: loanDate,
      due_date: dueDate,
      notes
    });

    // Update asset status to BORROWED or keep OPERATIONAL but log it
    return loan;
  }
}

export class BarcodeEngine {
  public static generateBarcodeData(code: string): string {
    return `BARCODE-${code}-${Math.floor(Math.random() * 1000)}`;
  }
}

export class QREngine {
  public static generateQRData(type: 'ITEM' | 'ASSET', id: string): string {
    return `${type}-TRACK-ID-${id}`;
  }
}
