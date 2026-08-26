#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7683435dcb11f5352a48d32c2a3662797ae86a465df62117c89f0c2d249d66d0/contract';
import endContract from '../../snapshots/7683435dcb11f5352a48d32c2a3662797ae86a465df62117c89f0c2d249d66d0/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/77314f8b6ab904b0b2747cf7ad9c0ec595dcc05f6aaf578899197f78d6443ed7/contract';
import startContract from '../../snapshots/77314f8b6ab904b0b2747cf7ad9c0ec595dcc05f6aaf578899197f78d6443ed7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'business',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('industry', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'inventoryItem',
        column: col('businessId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('accountType', 'text', {
          notNull: true,
          default: lit('consumer'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('businessId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_accountType_check_3458d6a6',
        expression: "\"accountType\" IN ('consumer', 'business')",
      }),
      this.createIndex({
        schema: 'public',
        table: 'business',
        index: 'business_name_idx_ce87e6ba',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventoryItem',
        index: 'inventoryItem_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user',
        index: 'user_businessId_idx_ae0ed511',
        columns: ['businessId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventoryItem',
        foreignKey: {
          name: 'inventoryItem_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'business', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user',
        foreignKey: {
          name: 'user_businessId_fkey',
          columns: ['businessId'],
          references: { schema: 'public', table: 'business', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
