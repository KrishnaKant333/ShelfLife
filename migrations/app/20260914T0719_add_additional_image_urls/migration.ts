#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6059162589031ed870d8d501475ad224dde50213d4a1e4d0138c053dd1efbbb8/contract';
import startContract from '../../snapshots/6059162589031ed870d8d501475ad224dde50213d4a1e4d0138c053dd1efbbb8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/99fdac8734649b7a8fa8126f722dbaf5bee5fb096f16e704e3dfe6329e1affaf/contract';
import endContract from '../../snapshots/99fdac8734649b7a8fa8126f722dbaf5bee5fb096f16e704e3dfe6329e1affaf/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'inventoryItem',
        column: col('additionalImageUrls', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
