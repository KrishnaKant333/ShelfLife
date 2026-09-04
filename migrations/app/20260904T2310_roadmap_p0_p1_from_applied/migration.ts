#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b70d5295c1bd97549f3e243febfb4d8089f4ecf243f67f8dd528a5430956032a/contract';
import endContract from '../../snapshots/b70d5295c1bd97549f3e243febfb4d8089f4ecf243f67f8dd528a5430956032a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d4341e80715f7a0c19697cb7cdf4aeb13f5909d3fcfa44224e3c5bdec398e120/contract';
import startContract from '../../snapshots/d4341e80715f7a0c19697cb7cdf4aeb13f5909d3fcfa44224e3c5bdec398e120/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'inventoryActivity',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('businessId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('inventoryItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('occurredAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('unit', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'inventoryItem',
        column: col('imageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('emailVerificationExpiresAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('emailVerificationTokenHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('emailVerifiedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'inventoryItem',
        column: 'quantity',
        options: {
          qualifiedTargetType: 'float8',
          formatTypeExpected: 'double precision',
          rawTargetTypeForLabel: 'float8',
        },
      }),
      this.dropNotNull({ schema: 'public', table: 'inventoryItem', column: 'expiryDate' }),
      this.createIndex({
        schema: 'public',
        table: 'inventoryActivity',
        index: 'inventoryActivity_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventoryActivity',
        index: 'inventoryActivity_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventoryActivity',
        foreignKey: {
          name: 'inventoryActivity_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventoryActivity',
        foreignKey: {
          name: 'inventoryActivity_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'business', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
