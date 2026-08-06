/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryRepository } from './repositories';
import { InventoryValidator } from './validators';
import { InventoryMapper } from './mappers';
import { InventoryEngine, ProcurementEngine, AssetEngine } from './services';

export class InventoryController {
  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string,
    logActivity: any
  ): Promise<any> {
    const userId = authUser ? authUser.id : 'system';
    
    try {
      switch (action) {
        // --- INVENTORY MANAGEMENT ---
        case 'getInventoryItemsList': {
          const list = InventoryRepository.getItems(tenantId);
          const mapped = list.map(item => InventoryMapper.mapInventoryItem(item));
          return res.json({ success: true, data: mapped });
        }

        case 'createInventoryItem': {
          const validationError = InventoryValidator.validateItem(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const created = InventoryRepository.createItem(tenantId, req.body, userId);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Asset & Inventory', `Membuat barang baru: ${created.name} (${created.code})`);
          return res.json({ success: true, data: created });
        }

        case 'updateInventoryItem': {
          const id = req.body.id || req.query.id;
          const validationError = InventoryValidator.validateItem(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const updated = InventoryRepository.updateItem(tenantId, id, req.body, userId);
          if (!updated) {
            return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
          }
          logActivity(tenantId, userId, username, role, 'UPDATE', 'Asset & Inventory', `Memperbarui barang: ${updated.name} (${updated.code})`);
          return res.json({ success: true, data: updated });
        }

        case 'deleteInventoryItem': {
          const id = req.body.id || req.query.id;
          const success = InventoryRepository.deleteItem(tenantId, id, userId);
          if (!success) {
            return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
          }
          logActivity(tenantId, userId, username, role, 'DELETE', 'Asset & Inventory', `Menghapus barang dengan ID: ${id}`);
          return res.json({ success: true, message: 'Barang berhasil dihapus' });
        }

        // --- STOCK ADJUSTMENT / MUTATION / OPNAME ---
        case 'adjustStockLevel': {
          const { itemId, type, quantity, fromWarehouseId, toWarehouseId, notes, refNo } = req.body;
          const result = InventoryEngine.handleStockAdjustment(tenantId, itemId, type, Number(quantity), userId, username, {
            fromWarehouseId,
            toWarehouseId,
            refNo,
            notes
          });
          logActivity(tenantId, userId, username, role, 'ADJUST', 'Asset & Inventory', `Penyesuaian stok barang ${type} qty: ${quantity} ref: ${refNo || '-'}`);
          return res.json({ success: true, data: result });
        }

        case 'getStockMovementsList': {
          const movements = InventoryRepository.getMovements(tenantId);
          return res.json({ success: true, data: movements });
        }

        // --- CATEGORIES & WAREHOUSES ---
        case 'getInventoryCategoriesList': {
          const cats = InventoryRepository.getCategories(tenantId);
          return res.json({ success: true, data: cats });
        }

        case 'createInventoryCategory': {
          const created = InventoryRepository.createCategory(tenantId, req.body);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Asset & Inventory', `Membuat kategori barang: ${created.name}`);
          return res.json({ success: true, data: created });
        }

        case 'getInventoryWarehousesList': {
          const whs = InventoryRepository.getWarehouses(tenantId);
          return res.json({ success: true, data: whs });
        }

        case 'createInventoryWarehouse': {
          const created = InventoryRepository.createWarehouse(tenantId, req.body);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Asset & Inventory', `Membuat gudang baru: ${created.name}`);
          return res.json({ success: true, data: created });
        }

        case 'getInventorySuppliersList': {
          const suppliers = InventoryRepository.getSuppliers(tenantId);
          return res.json({ success: true, data: suppliers });
        }

        case 'createInventorySupplier': {
          const created = InventoryRepository.createSupplier(tenantId, req.body);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Asset & Inventory', `Membuat supplier baru: ${created.name}`);
          return res.json({ success: true, data: created });
        }

        // --- PROCUREMENT ENGINE ---
        case 'getPurchaseRequestsList': {
          const list = InventoryRepository.getPurchaseRequests(tenantId);
          return res.json({ success: true, data: list });
        }

        case 'createPurchaseRequest': {
          const validationError = InventoryValidator.validatePurchaseRequest(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const created = InventoryRepository.createPurchaseRequest(tenantId, req.body);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Procurement', `Membuat Purchase Request untuk: ${created.item_name}`);
          return res.json({ success: true, data: created });
        }

        case 'approvePurchaseRequest': {
          const id = req.body.id || req.query.id;
          const pr = ProcurementEngine.approvePurchaseRequest(tenantId, id, username);
          if (!pr) return res.status(404).json({ success: false, message: 'Request tidak ditemukan' });
          logActivity(tenantId, userId, username, role, 'APPROVE', 'Procurement', `Menyetujui Purchase Request ID: ${id}`);
          return res.json({ success: true, data: pr });
        }

        case 'rejectPurchaseRequest': {
          const id = req.body.id || req.query.id;
          const pr = ProcurementEngine.rejectPurchaseRequest(tenantId, id, username);
          if (!pr) return res.status(404).json({ success: false, message: 'Request tidak ditemukan' });
          logActivity(tenantId, userId, username, role, 'REJECT', 'Procurement', `Menolak Purchase Request ID: ${id}`);
          return res.json({ success: true, data: pr });
        }

        case 'getPurchaseOrdersList': {
          const list = InventoryRepository.getPurchaseOrders(tenantId);
          return res.json({ success: true, data: list });
        }

        case 'createPurchaseOrder': {
          const { request_id, supplier_id, po_number, total_amount } = req.body;
          const po = ProcurementEngine.createPOFromRequest(tenantId, request_id, supplier_id, po_number, Number(total_amount), username);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Procurement', `Membuat PO baru: ${po.po_number}`);
          return res.json({ success: true, data: po });
        }

        case 'receivePurchaseOrder': {
          const { po_id, received_date, notes } = req.body;
          const rec = InventoryRepository.createReceiving(tenantId, { po_id, received_date, notes, received_by: username }, userId);
          logActivity(tenantId, userId, username, role, 'RECEIVE', 'Procurement', `Menerima pengiriman PO ID: ${po_id}`);
          return res.json({ success: true, data: rec });
        }

        // --- ASSET ENGINE ---
        case 'getFixedAssetsList': {
          const list = AssetEngine.calculateDepreciationReport(tenantId);
          return res.json({ success: true, data: list });
        }

        case 'createFixedAsset': {
          const validationError = InventoryValidator.validateFixedAsset(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const created = InventoryRepository.createFixedAsset(tenantId, req.body, userId);
          logActivity(tenantId, userId, username, role, 'CREATE', 'Fixed Asset', `Membuat aset tetap: ${created.name} (${created.code})`);
          return res.json({ success: true, data: created });
        }

        case 'updateFixedAsset': {
          const id = req.body.id || req.query.id;
          const validationError = InventoryValidator.validateFixedAsset(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const updated = InventoryRepository.updateFixedAsset(tenantId, id, req.body, userId);
          if (!updated) {
            return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
          }
          logActivity(tenantId, userId, username, role, 'UPDATE', 'Fixed Asset', `Memperbarui aset tetap: ${updated.name} (${updated.code})`);
          return res.json({ success: true, data: updated });
        }

        case 'deleteFixedAsset': {
          const id = req.body.id || req.query.id;
          const success = InventoryRepository.deleteFixedAsset(tenantId, id, userId);
          if (!success) {
            return res.status(404).json({ success: false, message: 'Aset tidak ditemukan' });
          }
          logActivity(tenantId, userId, username, role, 'DELETE', 'Fixed Asset', `Menghapus aset ID: ${id}`);
          return res.json({ success: true, message: 'Aset berhasil dihapus' });
        }

        case 'getAssetLoansList': {
          const loans = InventoryRepository.getLoans(tenantId);
          return res.json({ success: true, data: loans });
        }

        case 'createAssetLoan': {
          const validationError = InventoryValidator.validateAssetLoan(req.body);
          if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
          }
          const { asset_id, borrower_name, borrower_type, loan_date, due_date, notes } = req.body;
          const created = AssetEngine.processAssetLoan(tenantId, asset_id, borrower_name, borrower_type, loan_date, due_date, notes);
          logActivity(tenantId, userId, username, role, 'LOAN', 'Fixed Asset', `Meminjamkan aset ID: ${asset_id} kepada ${borrower_name}`);
          return res.json({ success: true, data: created });
        }

        case 'returnAssetLoan': {
          const { id, return_date } = req.body;
          const returned = InventoryRepository.returnLoan(tenantId, id, return_date || new Date().toISOString().split('T')[0]);
          if (!returned) return res.status(404).json({ success: false, message: 'Catatan peminjaman tidak ditemukan' });
          logActivity(tenantId, userId, username, role, 'RETURN', 'Fixed Asset', `Mengembalikan peminjaman aset ID: ${returned.asset_id}`);
          return res.json({ success: true, data: returned });
        }

        case 'getAssetMaintenancesList': {
          const list = InventoryRepository.getMaintenances(tenantId);
          return res.json({ success: true, data: list });
        }

        case 'createAssetMaintenance': {
          const created = InventoryRepository.createMaintenance(tenantId, req.body);
          logActivity(tenantId, userId, username, role, 'MAINTENANCE', 'Fixed Asset', `Menjadwalkan perawatan aset ID: ${created.asset_id}`);
          return res.json({ success: true, data: created });
        }

        case 'updateAssetMaintenanceStatus': {
          const { id, status, completion_date } = req.body;
          const updated = InventoryRepository.updateMaintenanceStatus(tenantId, id, status, completion_date);
          if (!updated) return res.status(404).json({ success: false, message: 'Jadwal perawatan tidak ditemukan' });
          logActivity(tenantId, userId, username, role, 'MAINTENANCE_UPDATE', 'Fixed Asset', `Memperbarui perawatan ID: ${id} menjadi ${status}`);
          return res.json({ success: true, data: updated });
        }

        case 'createFixedAssetDisposal': {
          const created = InventoryRepository.createDisposal(tenantId, req.body, userId);
          logActivity(tenantId, userId, username, role, 'DISPOSAL', 'Fixed Asset', `Penghapusan/Disposal aset ID: ${created.asset_id}`);
          return res.json({ success: true, data: created });
        }

        // --- EXPORTS & IMPORTS ---
        case 'importInventoryItemsExcel': {
          const { items } = req.body;
          let importedCount = 0;
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              InventoryRepository.createItem(tenantId, {
                name: item.name,
                code: item.code || 'INV-IMP-' + Math.floor(1000 + Math.random() * 9000),
                category_id: item.category_id || 'cat-atk',
                unit: item.unit || 'Pcs',
                min_stock: Number(item.min_stock || 5),
                quantity: Number(item.quantity || 0),
                warehouse_id: item.warehouse_id || 'wh-school',
                rack: item.rack || 'Rak Import'
              }, userId);
              importedCount++;
            });
          }
          logActivity(tenantId, userId, username, role, 'IMPORT', 'Asset & Inventory', `Mengimpor ${importedCount} barang logistik via berkas Excel/CSV`);
          return res.json({ success: true, message: `Berhasil mengimpor ${importedCount} barang logistik` });
        }

        case 'importFixedAssetsExcel': {
          const { assets } = req.body;
          let importedCount = 0;
          if (Array.isArray(assets)) {
            assets.forEach((ast: any) => {
              InventoryRepository.createFixedAsset(tenantId, {
                name: ast.name,
                code: ast.code || 'AST-IMP-' + Math.floor(1000 + Math.random() * 9000),
                category: ast.category || 'Komputer',
                status: ast.status || 'OPERATIONAL',
                purchase_date: ast.purchase_date || new Date().toISOString().split('T')[0],
                cost: Number(ast.cost || 1000000),
                location: ast.location || 'Kampus Utama',
                depreciation_method: ast.depreciation_method || 'STRAIGHT_LINE',
                depreciation_rate: Number(ast.depreciation_rate || 10),
                residual_value: Number(ast.residual_value || 100000),
                useful_life: Number(ast.useful_life || 5)
              }, userId);
              importedCount++;
            });
          }
          logActivity(tenantId, userId, username, role, 'IMPORT', 'Fixed Asset', `Mengimpor ${importedCount} aset tetap via berkas Excel/CSV`);
          return res.json({ success: true, message: `Berhasil mengimpor ${importedCount} aset tetap` });
        }

        default:
          return null;
      }
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message || 'Kesalahan Server Internal' });
    }
  }
}
