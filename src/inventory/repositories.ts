/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DB } from '../../server';

export class InventoryRepository {
  private static ensureCollection(name: string, defaults: any[] = []) {
    const dbObj = DB as any;
    if (!dbObj[name]) {
      dbObj[name] = defaults;
    }
    return dbObj[name];
  }

  // --- 1. Inventory Items ---
  public static getItems(tenantId: string): any[] {
    const list = this.ensureCollection('inventoryItems', [
      { id: 'invt-1', tenant_id: 'tenant-1', name: 'Proyektor Epson EB-X400', code: 'PRJ-001', category_id: 'cat-atk', brand: 'Epson', model: 'EB-X400', serial_number: 'EPS-X400-88', unit: 'Pcs', min_stock: 2, quantity: 5, warehouse_id: 'wh-school', rack: 'Rak A', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', deleted_at: null, created_by: 'system', updated_by: 'system' },
      { id: 'invt-2', tenant_id: 'tenant-2', name: 'Genset Honda 5KVA', code: 'GNS-01', category_id: 'cat-elek', brand: 'Honda', model: '5KVA-H', serial_number: 'HND-55', unit: 'Unit', min_stock: 1, quantity: 1, warehouse_id: 'wh-pondok', rack: 'Sektor G', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', deleted_at: null, created_by: 'system', updated_by: 'system' }
    ]);
    return list.filter((i: any) => i.tenant_id === tenantId && i.deleted_at === null);
  }

  public static createItem(tenantId: string, item: any, userId: string): any {
    const list = this.ensureCollection('inventoryItems');
    const newItem = {
      id: `invt-${Date.now()}`,
      tenant_id: tenantId,
      ...item,
      quantity: Number(item.quantity || 0),
      min_stock: Number(item.min_stock || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: userId,
      updated_by: userId
    };
    list.unshift(newItem);
    return newItem;
  }

  public static updateItem(tenantId: string, id: string, item: any, userId: string): any {
    const list = this.ensureCollection('inventoryItems');
    const index = list.findIndex((i: any) => i.id === id && i.tenant_id === tenantId);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...item,
      quantity: Number(item.quantity !== undefined ? item.quantity : list[index].quantity),
      min_stock: Number(item.min_stock !== undefined ? item.min_stock : list[index].min_stock),
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    return list[index];
  }

  public static deleteItem(tenantId: string, id: string, userId: string): boolean {
    const list = this.ensureCollection('inventoryItems');
    const index = list.findIndex((i: any) => i.id === id && i.tenant_id === tenantId);
    if (index === -1) return false;
    list[index].deleted_at = new Date().toISOString();
    list[index].updated_by = userId;
    return true;
  }

  // --- 2. Categories ---
  public static getCategories(tenantId: string): any[] {
    return this.ensureCollection('inventoryCategories', [
      { id: 'cat-atk', tenant_id: 'tenant-1', name: 'Alat Tulis Kantor', code: 'ATK' },
      { id: 'cat-elek', tenant_id: 'tenant-1', name: 'Elektronik & Multimedia', code: 'ELEK' },
      { id: 'cat-lab', tenant_id: 'tenant-1', name: 'Peralatan Laboratorium', code: 'LAB' },
      { id: 'cat-sar', tenant_id: 'tenant-2', name: 'Sarana Prasana Kitab', code: 'KITAB' }
    ]).filter((c: any) => c.tenant_id === tenantId || c.tenant_id === 'tenant-1'); // share global template
  }

  public static createCategory(tenantId: string, cat: any): any {
    const list = this.ensureCollection('inventoryCategories');
    const newCat = { id: `cat-${Date.now()}`, tenant_id: tenantId, ...cat };
    list.push(newCat);
    return newCat;
  }

  public static updateCategory(tenantId: string, id: string, cat: any): any {
    const list = this.ensureCollection('inventoryCategories');
    const idx = list.findIndex((c: any) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...cat };
    return list[idx];
  }

  public static deleteCategory(tenantId: string, id: string): boolean {
    const list = this.ensureCollection('inventoryCategories');
    const idx = list.findIndex((c: any) => c.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  // --- 2b. Units Master ---
  public static getUnits(tenantId: string): any[] {
    return this.ensureCollection('inventoryUnits', [
      { id: 'unit-1', tenant_id: 'tenant-1', name: 'Pcs', code: 'PCS' },
      { id: 'unit-2', tenant_id: 'tenant-1', name: 'Unit', code: 'UNIT' },
      { id: 'unit-3', tenant_id: 'tenant-1', name: 'Box', code: 'BOX' },
      { id: 'unit-4', tenant_id: 'tenant-1', name: 'Pack', code: 'PACK' },
      { id: 'unit-5', tenant_id: 'tenant-1', name: 'Rim', code: 'RIM' },
      { id: 'unit-6', tenant_id: 'tenant-1', name: 'Liter', code: 'LTR' },
      { id: 'unit-7', tenant_id: 'tenant-1', name: 'Kg', code: 'KG' },
      { id: 'unit-8', tenant_id: 'tenant-1', name: 'Set', code: 'SET' }
    ]).filter((u: any) => u.tenant_id === tenantId || u.tenant_id === 'tenant-1');
  }

  public static createUnit(tenantId: string, unit: any): any {
    const list = this.ensureCollection('inventoryUnits');
    const newUnit = { id: `unit-${Date.now()}`, tenant_id: tenantId, ...unit };
    list.push(newUnit);
    return newUnit;
  }

  public static updateUnit(tenantId: string, id: string, unit: any): any {
    const list = this.ensureCollection('inventoryUnits');
    const idx = list.findIndex((u: any) => u.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...unit };
    return list[idx];
  }

  public static deleteUnit(tenantId: string, id: string): boolean {
    const list = this.ensureCollection('inventoryUnits');
    const idx = list.findIndex((u: any) => u.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  // --- 3. Warehouses / Locations ---
  public static getWarehouses(tenantId: string): any[] {
    return this.ensureCollection('inventoryWarehouses', [
      { id: 'wh-school', tenant_id: 'tenant-1', name: 'Gudang Utama Sekolah', code: 'GDG-SEKOLAH', location: 'Gedung Utara Lt.1' },
      { id: 'wh-pondok', tenant_id: 'tenant-1', name: 'Gudang Logistik Pondok', code: 'GDG-PONDOK', location: 'Samping Dapur Umum' },
      { id: 'wh-yayasan', tenant_id: 'tenant-1', name: 'Gudang Yayasan Pusat', code: 'GDG-YAYASAN', location: 'Gedung Rektorat Lt. Basement' },
      { id: 'wh-pkbm', tenant_id: 'tenant-1', name: 'Gudang PKBM & Kursus', code: 'GDG-PKBM', location: 'Gedung PKBM Lt.2' }
    ]).filter((w: any) => w.tenant_id === tenantId);
  }

  public static createWarehouse(tenantId: string, wh: any): any {
    const list = this.ensureCollection('inventoryWarehouses');
    const newWh = { id: `wh-${Date.now()}`, tenant_id: tenantId, ...wh };
    list.push(newWh);
    return newWh;
  }

  public static updateWarehouse(tenantId: string, id: string, wh: any): any {
    const list = this.ensureCollection('inventoryWarehouses');
    const idx = list.findIndex((w: any) => w.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...wh };
    return list[idx];
  }

  public static deleteWarehouse(tenantId: string, id: string): boolean {
    const list = this.ensureCollection('inventoryWarehouses');
    const idx = list.findIndex((w: any) => w.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  // --- 4. Suppliers ---
  public static getSuppliers(tenantId: string): any[] {
    return this.ensureCollection('inventorySuppliers', [
      { id: 'sup-1', tenant_id: 'tenant-1', name: 'PT Sarana Edukasi Nusantara', address: 'Jl. Sudirman No. 12, Jakarta', contact: '0812-3456-7890', npwp: '01.234.567.8-012.000', bank_info: 'BCA 123456789 (a.n. PT Sarana)' },
      { id: 'sup-2', tenant_id: 'tenant-1', name: 'CV Logistik Pondok Berkah', address: 'Jl. Pesantren No. 9, Bogor', contact: '0855-9988-7766', npwp: '02.999.888.7-033.000', bank_info: 'Mandiri Syariah 987654321 (a.n. CV LBP)' }
    ]).filter((s: any) => s.tenant_id === tenantId);
  }

  public static createSupplier(tenantId: string, sup: any): any {
    const list = this.ensureCollection('inventorySuppliers');
    const newSup = { id: `sup-${Date.now()}`, tenant_id: tenantId, ...sup };
    list.push(newSup);
    return newSup;
  }

  // --- 5. Purchase Requests ---
  public static getPurchaseRequests(tenantId: string): any[] {
    return this.ensureCollection('purchaseRequests', [
      { id: 'pr-1', tenant_id: 'tenant-1', item_name: 'Kertas HVS A4 80gr Sinar Dunia', quantity: 20, estimated_cost: 1100000, requester: 'Siti Aminah', department: 'Tata Usaha', date: '2026-07-01', status: 'APPROVED', notes: 'Untuk keperluan ujian semester genap' },
      { id: 'pr-2', tenant_id: 'tenant-1', item_name: 'Printer HP Laserjet M107a', quantity: 2, estimated_cost: 3200000, requester: 'Budi Raharjo', department: 'Kurikulum', date: '2026-07-05', status: 'PENDING', notes: 'Ganti printer ruang ujian yang rusak' }
    ]).filter((p: any) => p.tenant_id === tenantId);
  }

  public static createPurchaseRequest(tenantId: string, pr: any): any {
    const list = this.ensureCollection('purchaseRequests');
    const newPr = { 
      id: `pr-${Date.now()}`, 
      tenant_id: tenantId, 
      status: 'PENDING', 
      created_at: new Date().toISOString(),
      ...pr 
    };
    list.unshift(newPr);
    return newPr;
  }

  public static updatePurchaseRequestStatus(tenantId: string, id: string, status: string): any {
    const list = this.ensureCollection('purchaseRequests');
    const pr = list.find((p: any) => p.id === id && p.tenant_id === tenantId);
    if (pr) {
      pr.status = status;
    }
    return pr;
  }

  // --- 6. Purchase Orders ---
  public static getPurchaseOrders(tenantId: string): any[] {
    return this.ensureCollection('purchaseOrders', [
      { id: 'po-1', tenant_id: 'tenant-1', request_id: 'pr-1', po_number: 'PO-2026-001', supplier_id: 'sup-1', date: '2026-07-02', total_amount: 1100000, status: 'SENT' }
    ]).filter((p: any) => p.tenant_id === tenantId);
  }

  public static createPurchaseOrder(tenantId: string, po: any): any {
    const list = this.ensureCollection('purchaseOrders');
    const newPo = { 
      id: `po-${Date.now()}`, 
      tenant_id: tenantId, 
      status: 'SENT', 
      created_at: new Date().toISOString(),
      ...po 
    };
    list.unshift(newPo);
    
    // update purchase request status
    const prList = this.ensureCollection('purchaseRequests');
    const pr = prList.find((p: any) => p.id === po.request_id);
    if (pr) {
      pr.status = 'PO_CREATED';
    }

    return newPo;
  }

  // --- 7. Receivings ---
  public static createReceiving(tenantId: string, rec: any, userId: string): any {
    const list = this.ensureCollection('inventoryReceivings', []);
    const newRec = {
      id: `rec-${Date.now()}`,
      tenant_id: tenantId,
      ...rec,
      created_at: new Date().toISOString()
    };
    list.unshift(newRec);

    // Update PO status to DELIVERED/RECEIVED
    const poList = this.ensureCollection('purchaseOrders');
    const po = poList.find((p: any) => p.id === rec.po_id);
    if (po) {
      po.status = 'DELIVERED';

      // Automatically add items into Inventory Items
      const prList = this.ensureCollection('purchaseRequests');
      const pr = prList.find((p: any) => p.id === po.request_id);
      if (pr) {
        pr.status = 'RECEIVED';
        
        // Find if item already exists in Inventory Items
        const items = this.getItems(tenantId);
        const matchItem = items.find((i: any) => i.name.toLowerCase() === pr.item_name.toLowerCase());
        if (matchItem) {
          this.updateItem(tenantId, matchItem.id, {
            quantity: matchItem.quantity + pr.quantity
          }, userId);
        } else {
          this.createItem(tenantId, {
            name: pr.item_name,
            code: 'INV-' + Math.floor(1000 + Math.random() * 9000),
            category_id: 'cat-atk',
            unit: 'Pcs',
            min_stock: 5,
            quantity: pr.quantity,
            warehouse_id: 'wh-school',
            rack: 'Rak Penerimaan'
          }, userId);
        }
      }
    }

    return newRec;
  }

  // --- 8. Stock Movements ---
  public static getMovements(tenantId: string): any[] {
    return this.ensureCollection('stockMovements', [
      { id: 'mov-1', tenant_id: 'tenant-1', item_name: 'Proyektor Epson EB-X400', type: 'IN', quantity: 5, to_warehouse: 'wh-school', date: '2026-01-01', ref_no: 'REF-001', operator: 'System Seeder', notes: 'Saldo Awal' },
      { id: 'mov-2', tenant_id: 'tenant-2', item_name: 'Genset Honda 5KVA', type: 'IN', quantity: 1, to_warehouse: 'wh-pondok', date: '2026-01-01', ref_no: 'REF-002', operator: 'System Seeder', notes: 'Saldo Awal' }
    ]).filter((m: any) => m.tenant_id === tenantId);
  }

  public static createMovement(tenantId: string, movement: any): any {
    const list = this.ensureCollection('stockMovements');
    const newMov = {
      id: `mov-${Date.now()}`,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      ...movement
    };
    list.unshift(newMov);
    return newMov;
  }

  // --- 9. Fixed Assets ---
  public static getFixedAssets(tenantId: string): any[] {
    return this.ensureCollection('fixedAssets', [
      { id: 'ast-1', tenant_id: 'tenant-1', name: 'Gedung Rektorat Utama', code: 'AST-GDG-01', category: 'Gedung', status: 'OPERATIONAL', purchase_date: '2020-01-10', cost: 1500000000, location: 'Kampus Barat', depreciation_method: 'STRAIGHT_LINE', depreciation_rate: 5, residual_value: 200000000, useful_life: 20, deleted_at: null },
      { id: 'ast-2', tenant_id: 'tenant-1', name: 'Mobil Ambulans Pesantren', code: 'AST-KND-02', category: 'Kendaraan', status: 'OPERATIONAL', purchase_date: '2023-06-15', cost: 350000000, location: 'Sektor Kesehatan', depreciation_method: 'STRAIGHT_LINE', depreciation_rate: 10, residual_value: 50000000, useful_life: 10, deleted_at: null },
      { id: 'ast-3', tenant_id: 'tenant-1', name: 'Server HP ProLiant DL380', code: 'AST-KOM-03', category: 'Komputer', status: 'MAINTENANCE', purchase_date: '2024-02-20', cost: 85000000, location: 'Server Room', depreciation_method: 'DECLINING_BALANCE', depreciation_rate: 20, residual_value: 5000000, useful_life: 5, deleted_at: null }
    ]).filter((a: any) => a.tenant_id === tenantId && a.deleted_at === null);
  }

  public static createFixedAsset(tenantId: string, asset: any, userId: string): any {
    const list = this.ensureCollection('fixedAssets');
    const newAsset = {
      id: `ast-${Date.now()}`,
      tenant_id: tenantId,
      ...asset,
      cost: Number(asset.cost || 0),
      depreciation_rate: Number(asset.depreciation_rate || 0),
      residual_value: Number(asset.residual_value || 0),
      useful_life: Number(asset.useful_life || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: userId,
      updated_by: userId
    };
    list.unshift(newAsset);
    return newAsset;
  }

  public static updateFixedAsset(tenantId: string, id: string, asset: any, userId: string): any {
    const list = this.ensureCollection('fixedAssets');
    const index = list.findIndex((a: any) => a.id === id && a.tenant_id === tenantId);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...asset,
      cost: Number(asset.cost !== undefined ? asset.cost : list[index].cost),
      depreciation_rate: Number(asset.depreciation_rate !== undefined ? asset.depreciation_rate : list[index].depreciation_rate),
      residual_value: Number(asset.residual_value !== undefined ? asset.residual_value : list[index].residual_value),
      useful_life: Number(asset.useful_life !== undefined ? asset.useful_life : list[index].useful_life),
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    return list[index];
  }

  public static deleteFixedAsset(tenantId: string, id: string, userId: string): boolean {
    const list = this.ensureCollection('fixedAssets');
    const index = list.findIndex((a: any) => a.id === id && a.tenant_id === tenantId);
    if (index === -1) return false;
    list[index].deleted_at = new Date().toISOString();
    list[index].updated_by = userId;
    return true;
  }

  // --- 10. Asset Loans ---
  public static getLoans(tenantId: string): any[] {
    return this.ensureCollection('assetLoans', [
      { id: 'loan-1', tenant_id: 'tenant-1', asset_id: 'ast-3', borrower_name: 'Ahmad Ghozali', borrower_type: 'GURU', loan_date: '2026-07-02', due_date: '2026-07-09', return_date: null, status: 'BORROWED', notes: 'Untuk workshop kurikulum' }
    ]).filter((l: any) => l.tenant_id === tenantId);
  }

  public static createLoan(tenantId: string, loan: any): any {
    const list = this.ensureCollection('assetLoans');
    const newLoan = {
      id: `loan-${Date.now()}`,
      tenant_id: tenantId,
      status: 'BORROWED',
      return_date: null,
      created_at: new Date().toISOString(),
      ...loan
    };
    list.unshift(newLoan);
    return newLoan;
  }

  public static returnLoan(tenantId: string, id: string, returnDate: string): any {
    const list = this.ensureCollection('assetLoans');
    const loan = list.find((l: any) => l.id === id && l.tenant_id === tenantId);
    if (loan) {
      loan.return_date = returnDate;
      loan.status = 'RETURNED';
    }
    return loan;
  }

  // --- 11. Asset Maintenances ---
  public static getMaintenances(tenantId: string): any[] {
    return this.ensureCollection('assetMaintenances', [
      { id: 'maint-1', tenant_id: 'tenant-1', asset_id: 'ast-3', schedule_date: '2026-07-05', completion_date: '2026-07-06', cost: 1500000, vendor: 'CV Servis Computindo', description: 'Ganti RAM & thermal paste server', status: 'COMPLETED' },
      { id: 'maint-2', tenant_id: 'tenant-1', asset_id: 'ast-2', schedule_date: '2026-07-20', completion_date: null, cost: 850000, vendor: 'Bengkel Toyota Jaya', description: 'Ganti oli & servis berkala ambulans', status: 'SCHEDULED' }
    ]).filter((m: any) => m.tenant_id === tenantId);
  }

  public static createMaintenance(tenantId: string, maint: any): any {
    const list = this.ensureCollection('assetMaintenances');
    const newMaint = {
      id: `maint-${Date.now()}`,
      tenant_id: tenantId,
      status: 'SCHEDULED',
      created_at: new Date().toISOString(),
      ...maint,
      cost: Number(maint.cost || 0)
    };
    list.unshift(newMaint);
    return newMaint;
  }

  public static updateMaintenanceStatus(tenantId: string, id: string, status: string, completionDate?: string): any {
    const list = this.ensureCollection('assetMaintenances');
    const maint = list.find((m: any) => m.id === id && m.tenant_id === tenantId);
    if (maint) {
      maint.status = status;
      if (completionDate) {
        maint.completion_date = completionDate;
      }
    }
    return maint;
  }

  // --- 12. Asset Disposals ---
  public static getDisposals(tenantId: string): any[] {
    return this.ensureCollection('assetDisposals', []).filter((d: any) => d.tenant_id === tenantId);
  }

  public static createDisposal(tenantId: string, disposal: any, userId: string): any {
    const list = this.ensureCollection('assetDisposals');
    const newDisp = {
      id: `disp-${Date.now()}`,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      ...disposal,
      sale_amount: Number(disposal.sale_amount || 0)
    };
    list.unshift(newDisp);

    // Set corresponding Fixed Asset status to SCRAPPED/DECOMMISSIONED
    this.updateFixedAsset(tenantId, disposal.asset_id, { status: 'SCRAPPED' }, userId);

    return newDisp;
  }

  // --- 13. Asset Movements & Transfers ---
  public static getAssetMovements(tenantId: string): any[] {
    return this.ensureCollection('assetMovements', [
      { id: 'astm-1', tenant_id: 'tenant-1', asset_id: 'ast-3', asset_name: 'Server HP ProLiant DL380', from_location: 'Gudang Utama', to_location: 'Server Room', transferred_by: 'Budi (IT)', transfer_date: '2026-06-01', reason: 'Penempatan awal' }
    ]).filter((m: any) => m.tenant_id === tenantId);
  }

  public static createAssetTransfer(tenantId: string, transfer: any, userId: string): any {
    const list = this.ensureCollection('assetMovements');
    const newTransfer = {
      id: `astm-${Date.now()}`,
      tenant_id: tenantId,
      transfer_date: transfer.transfer_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      ...transfer
    };
    list.unshift(newTransfer);

    if (transfer.asset_id && transfer.to_location) {
      this.updateFixedAsset(tenantId, transfer.asset_id, {
        location: transfer.to_location,
        responsible_person: transfer.responsible_person || undefined
      }, userId);
    }

    return newTransfer;
  }

  // --- 14. Universal QR/Barcode Scanner Lookup ---
  public static scanCode(tenantId: string, code: string): any {
    const search = (code || '').trim().toLowerCase();
    if (!search) return null;

    const items = this.getItems(tenantId);
    const matchedItem = items.find((i: any) => 
      (i.code && i.code.toLowerCase() === search) || 
      (i.id && i.id.toLowerCase() === search)
    );

    if (matchedItem) {
      const movements = this.getMovements(tenantId).filter((m: any) => m.item_name === matchedItem.name);
      return {
        type: 'INVENTORY_ITEM',
        data: matchedItem,
        movements
      };
    }

    const assets = this.getFixedAssets(tenantId);
    const matchedAsset = assets.find((a: any) => 
      (a.code && a.code.toLowerCase() === search) || 
      (a.id && a.id.toLowerCase() === search)
    );

    if (matchedAsset) {
      const loans = this.getLoans(tenantId).filter((l: any) => l.asset_id === matchedAsset.id);
      const maintenances = this.getMaintenances(tenantId).filter((m: any) => m.asset_id === matchedAsset.id);
      const movements = this.getAssetMovements(tenantId).filter((m: any) => m.asset_id === matchedAsset.id);
      return {
        type: 'FIXED_ASSET',
        data: matchedAsset,
        loans,
        maintenances,
        movements
      };
    }

    return null;
  }

  // --- 15. Stock Ledger / Stock Card ---
  public static getItemStockCard(tenantId: string, itemId: string): any {
    const items = this.getItems(tenantId);
    const item = items.find((i: any) => i.id === itemId);
    if (!item) return null;

    const movements = this.getMovements(tenantId)
      .filter((m: any) => m.item_name === item.name)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const ledger = movements.map((m: any) => {
      let inQty = 0;
      let outQty = 0;
      if (m.type === 'IN') {
        inQty = m.quantity;
        runningBalance += inQty;
      } else if (m.type === 'OUT' || m.type === 'TRANSFER') {
        outQty = m.quantity;
        runningBalance -= outQty;
      } else if (m.type === 'ADJUSTMENT' || m.type === 'OPNAME') {
        const diff = m.quantity - runningBalance;
        if (diff >= 0) inQty = diff;
        else outQty = Math.abs(diff);
        runningBalance = m.quantity;
      }

      return {
        id: m.id,
        date: m.date,
        ref_no: m.ref_no,
        type: m.type,
        operator: m.operator,
        notes: m.notes,
        in_qty: inQty,
        out_qty: outQty,
        balance: runningBalance
      };
    });

    return {
      item,
      current_stock: item.quantity,
      ledger
    };
  }

  // --- 16. Stock Opname Sessions ---
  public static getOpnameSessions(tenantId: string): any[] {
    return this.ensureCollection('opnameSessions', [
      {
        id: 'opn-1',
        tenant_id: 'tenant-1',
        title: 'Opname Semester Genap 2026',
        warehouse_id: 'wh-school',
        date: '2026-06-30',
        status: 'APPROVED',
        created_by: 'Petugas Gudang',
        items: [
          { item_id: 'invt-1', item_name: 'Proyektor Epson EB-X400', system_qty: 5, actual_qty: 5, status: 'MATCH' }
        ]
      }
    ]).filter((o: any) => o.tenant_id === tenantId);
  }

  public static createOpnameSession(tenantId: string, payload: any, userId: string, username: string): any {
    const list = this.ensureCollection('opnameSessions');
    const items = this.getItems(tenantId);
    const warehouseItems = payload.warehouse_id && payload.warehouse_id !== 'ALL'
      ? items.filter((i: any) => i.warehouse_id === payload.warehouse_id)
      : items;

    const sessionItems = warehouseItems.map((i: any) => ({
      item_id: i.id,
      item_name: i.name,
      item_code: i.code,
      system_qty: i.quantity,
      actual_qty: i.quantity,
      status: 'MATCH',
      notes: ''
    }));

    const newSession = {
      id: `opn-${Date.now()}`,
      tenant_id: tenantId,
      title: payload.title || 'Stock Opname ' + new Date().toLocaleDateString('id-ID'),
      warehouse_id: payload.warehouse_id || 'ALL',
      date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      created_by: username,
      created_at: new Date().toISOString(),
      items: sessionItems
    };

    list.unshift(newSession);
    return newSession;
  }

  public static updateOpnameSessionItem(tenantId: string, sessionId: string, itemId: string, actualQty: number, notes?: string): any {
    const list = this.ensureCollection('opnameSessions');
    const session = list.find((s: any) => s.id === sessionId && s.tenant_id === tenantId);
    if (!session) return null;

    const itemIdx = session.items.findIndex((i: any) => i.item_id === itemId);
    if (itemIdx !== -1) {
      session.items[itemIdx].actual_qty = Number(actualQty);
      if (notes) session.items[itemIdx].notes = notes;
      session.items[itemIdx].status = Number(actualQty) === session.items[itemIdx].system_qty ? 'MATCH' : 'DISCREPANCY';
    }

    return session;
  }

  public static approveOpnameSession(tenantId: string, sessionId: string, userId: string, username: string, adjustStockFn: Function): any {
    const list = this.ensureCollection('opnameSessions');
    const session = list.find((s: any) => s.id === sessionId && s.tenant_id === tenantId);
    if (!session) return null;

    if (session.status === 'APPROVED') return session;

    session.status = 'APPROVED';
    session.approved_at = new Date().toISOString();
    session.approved_by = username;

    session.items.forEach((opItem: any) => {
      if (opItem.actual_qty !== opItem.system_qty) {
        adjustStockFn(
          tenantId,
          opItem.item_id,
          'OPNAME',
          opItem.actual_qty,
          userId,
          username,
          {
            refNo: `OPNAME-${session.id}`,
            notes: `Stock Opname: ${session.title} (${opItem.notes || 'Penyesuaian fisik'})`
          }
        );
      }
    });

    return session;
  }
}
