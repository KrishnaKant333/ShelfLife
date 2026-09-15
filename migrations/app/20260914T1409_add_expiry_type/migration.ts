#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/45ea66c3b071af7c93a58b736bc53cf1b8a5c50957d5af6df8b3b647ac56c692/contract';
import endContract from '../../snapshots/45ea66c3b071af7c93a58b736bc53cf1b8a5c50957d5af6df8b3b647ac56c692/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/99fdac8734649b7a8fa8126f722dbaf5bee5fb096f16e704e3dfe6329e1affaf/contract';
import startContract from '../../snapshots/99fdac8734649b7a8fa8126f722dbaf5bee5fb096f16e704e3dfe6329e1affaf/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'inventoryItem',
        column: col('expiryType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
