#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7683435dcb11f5352a48d32c2a3662797ae86a465df62117c89f0c2d249d66d0/contract';
import startContract from '../../snapshots/7683435dcb11f5352a48d32c2a3662797ae86a465df62117c89f0c2d249d66d0/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ab4adaf7850aa4ebb2fbe906f356b41637eb4ac33fb20b3b96627a35398798d7/contract';
import endContract from '../../snapshots/ab4adaf7850aa4ebb2fbe906f356b41637eb4ac33fb20b3b96627a35398798d7/contract.json' with { type: 'json' };

import {
  Migration,
  MigrationCLI,
  col,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
  return [
    this.addColumn({
      schema: 'public',
      table: 'user',
      column: col('passwordHash', 'text'),
    }),
  ];
}
}

MigrationCLI.run(import.meta.url, M);
