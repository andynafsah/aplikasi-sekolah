/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { InventoryController } from '../inventory/controllers';
import { verifyJWT } from '../../server';

export const inventoryRoutes = Router();
const controller = new InventoryController();

// Create middleware / route listener wrapper to resolve user token
function wrapRoute(action: string) {
  return (req: any, res: any) => {
    const token = req.headers.authorization?.split(' ')[1] || req.body.token;
    const authUser = token ? verifyJWT(token) : null;
    const tenantId = authUser ? authUser.tenant_id : req.body.tenant_id;
    const username = authUser ? authUser.username : '';
    const role = authUser ? authUser.role : '';
    
    // Fallback logActivity if we are testing/outside server execution bounds
    const logActivity = (tenant_id: string, user_id: string, username_str: string, role_str: string, act: string, mod: string, det: string) => {
      console.log(`[AUDIT LOG] tenant:${tenant_id} user:${username_str} action:${act} module:${mod} - ${det}`);
    };

    controller.handle(action, req, res, tenantId, authUser, username, role, logActivity);
  };
}

// Map endpoints for direct REST routing
inventoryRoutes.post('/getInventoryItemsList', wrapRoute('getInventoryItemsList'));
inventoryRoutes.post('/createInventoryItem', wrapRoute('createInventoryItem'));
inventoryRoutes.post('/updateInventoryItem', wrapRoute('updateInventoryItem'));
inventoryRoutes.post('/deleteInventoryItem', wrapRoute('deleteInventoryItem'));
inventoryRoutes.post('/adjustStockLevel', wrapRoute('adjustStockLevel'));
inventoryRoutes.post('/getStockMovementsList', wrapRoute('getStockMovementsList'));
inventoryRoutes.post('/getInventoryCategoriesList', wrapRoute('getInventoryCategoriesList'));
inventoryRoutes.post('/createInventoryCategory', wrapRoute('createInventoryCategory'));
inventoryRoutes.post('/updateInventoryCategory', wrapRoute('updateInventoryCategory'));
inventoryRoutes.post('/deleteInventoryCategory', wrapRoute('deleteInventoryCategory'));
inventoryRoutes.post('/getInventoryUnitsList', wrapRoute('getInventoryUnitsList'));
inventoryRoutes.post('/createInventoryUnit', wrapRoute('createInventoryUnit'));
inventoryRoutes.post('/updateInventoryUnit', wrapRoute('updateInventoryUnit'));
inventoryRoutes.post('/deleteInventoryUnit', wrapRoute('deleteInventoryUnit'));
inventoryRoutes.post('/getInventoryWarehousesList', wrapRoute('getInventoryWarehousesList'));
inventoryRoutes.post('/createInventoryWarehouse', wrapRoute('createInventoryWarehouse'));
inventoryRoutes.post('/updateInventoryWarehouse', wrapRoute('updateInventoryWarehouse'));
inventoryRoutes.post('/deleteInventoryWarehouse', wrapRoute('deleteInventoryWarehouse'));
inventoryRoutes.post('/getInventorySuppliersList', wrapRoute('getInventorySuppliersList'));
inventoryRoutes.post('/createInventorySupplier', wrapRoute('createInventorySupplier'));

// Procurement
inventoryRoutes.post('/getPurchaseRequestsList', wrapRoute('getPurchaseRequestsList'));
inventoryRoutes.post('/createPurchaseRequest', wrapRoute('createPurchaseRequest'));
inventoryRoutes.post('/approvePurchaseRequest', wrapRoute('approvePurchaseRequest'));
inventoryRoutes.post('/rejectPurchaseRequest', wrapRoute('rejectPurchaseRequest'));
inventoryRoutes.post('/getPurchaseOrdersList', wrapRoute('getPurchaseOrdersList'));
inventoryRoutes.post('/createPurchaseOrder', wrapRoute('createPurchaseOrder'));
inventoryRoutes.post('/receivePurchaseOrder', wrapRoute('receivePurchaseOrder'));

// Assets
inventoryRoutes.post('/getFixedAssetsList', wrapRoute('getFixedAssetsList'));
inventoryRoutes.post('/createFixedAsset', wrapRoute('createFixedAsset'));
inventoryRoutes.post('/updateFixedAsset', wrapRoute('updateFixedAsset'));
inventoryRoutes.post('/deleteFixedAsset', wrapRoute('deleteFixedAsset'));
inventoryRoutes.post('/getAssetLoansList', wrapRoute('getAssetLoansList'));
inventoryRoutes.post('/createAssetLoan', wrapRoute('createAssetLoan'));
inventoryRoutes.post('/returnAssetLoan', wrapRoute('returnAssetLoan'));
inventoryRoutes.post('/getAssetMaintenancesList', wrapRoute('getAssetMaintenancesList'));
inventoryRoutes.post('/createAssetMaintenance', wrapRoute('createAssetMaintenance'));
inventoryRoutes.post('/updateAssetMaintenanceStatus', wrapRoute('updateAssetMaintenanceStatus'));
inventoryRoutes.post('/createFixedAssetDisposal', wrapRoute('createFixedAssetDisposal'));
inventoryRoutes.post('/getFixedAssetDisposalsList', wrapRoute('getFixedAssetDisposalsList'));
inventoryRoutes.post('/getAssetMovementsList', wrapRoute('getAssetMovementsList'));
inventoryRoutes.post('/createAssetTransfer', wrapRoute('createAssetTransfer'));

// Scanner, Stock Card, Opname
inventoryRoutes.post('/scanCode', wrapRoute('scanCode'));
inventoryRoutes.post('/getItemStockCard', wrapRoute('getItemStockCard'));
inventoryRoutes.post('/getOpnameSessionsList', wrapRoute('getOpnameSessionsList'));
inventoryRoutes.post('/createOpnameSession', wrapRoute('createOpnameSession'));
inventoryRoutes.post('/updateOpnameSessionItem', wrapRoute('updateOpnameSessionItem'));
inventoryRoutes.post('/approveOpnameSession', wrapRoute('approveOpnameSession'));

// Imports
inventoryRoutes.post('/importInventoryItemsExcel', wrapRoute('importInventoryItemsExcel'));
inventoryRoutes.post('/importFixedAssetsExcel', wrapRoute('importFixedAssetsExcel'));

// Export unified function for central server action dispatcher
export async function handleInventory(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string,
  logActivity: any
): Promise<any> {
  return controller.handle(action, req, res, tenantId, authUser, username, role, logActivity);
}
