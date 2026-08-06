/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class InventoryMapper {
  // Map an inventory item to include Barcode & QR Code data dynamically
  public static mapInventoryItem(item: any): any {
    return {
      ...item,
      barcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.code || '')}`,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INV-TRACK-${item.id}`,
      status_stock: item.quantity <= (item.min_stock || 5) ? 'LOW_STOCK' : 'AVAILABLE'
    };
  }

  // Map a fixed asset to include simulated depreciation calculations
  public static mapFixedAsset(asset: any): any {
    const yearsElapsed = (Date.now() - new Date(asset.purchase_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
    const years = Math.max(0, yearsElapsed);

    let accumulatedDepreciation = 0;
    let bookValue = asset.cost;

    if (asset.depreciation_method === 'STRAIGHT_LINE') {
      accumulatedDepreciation = (asset.cost * (asset.depreciation_rate / 100)) * years;
      accumulatedDepreciation = Math.min(accumulatedDepreciation, asset.cost - (asset.residual_value || 0));
      bookValue = Math.max((asset.residual_value || 0), asset.cost - accumulatedDepreciation);
    } else if (asset.depreciation_method === 'DECLINING_BALANCE') {
      // declining balance simulation
      const rate = asset.depreciation_rate / 100;
      bookValue = asset.cost * Math.pow(1 - rate, years);
      bookValue = Math.max((asset.residual_value || 0), bookValue);
      accumulatedDepreciation = asset.cost - bookValue;
    } else {
      // custom straight line approximation
      accumulatedDepreciation = (asset.cost * 0.05) * years;
      accumulatedDepreciation = Math.min(accumulatedDepreciation, asset.cost * 0.9);
      bookValue = asset.cost - accumulatedDepreciation;
    }

    return {
      ...itemData(asset),
      accumulated_depreciation: Math.round(accumulatedDepreciation),
      book_value: Math.round(bookValue),
      barcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(asset.code || '')}`,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-TRACK-${asset.id}`
    };
  }
}

function itemData(obj: any): any {
  return { ...obj };
}
