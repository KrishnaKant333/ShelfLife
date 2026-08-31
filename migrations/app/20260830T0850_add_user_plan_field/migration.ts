#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/9682769de1d982d05c79270d7065ea8ab4be9f92bf660746fea5b2bfb60832e0/contract';
import endContract from '../../snapshots/9682769de1d982d05c79270d7065ea8ab4be9f92bf660746fea5b2bfb60832e0/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ab4adaf7850aa4ebb2fbe906f356b41637eb4ac33fb20b3b96627a35398798d7/contract';
import startContract from '../../snapshots/ab4adaf7850aa4ebb2fbe906f356b41637eb4ac33fb20b3b96627a35398798d7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'inventoryConsumption',
        columns: [
          col('businessId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('consumedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('inventoryItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('normalizedQuantityUsed', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantityUsed', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('unit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventoryConsumption',
        index: 'inventoryConsumption_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventoryConsumption',
        index: 'inventoryConsumption_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventoryConsumption',
        foreignKey: {
          name: 'inventoryConsumption_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventoryConsumption',
        foreignKey: {
          name: 'inventoryConsumption_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'business', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
