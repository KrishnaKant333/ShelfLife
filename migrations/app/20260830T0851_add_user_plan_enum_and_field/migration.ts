#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/9682769de1d982d05c79270d7065ea8ab4be9f92bf660746fea5b2bfb60832e0/contract';
import startContract from '../../snapshots/9682769de1d982d05c79270d7065ea8ab4be9f92bf660746fea5b2bfb60832e0/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d4341e80715f7a0c19697cb7cdf4aeb13f5909d3fcfa44224e3c5bdec398e120/contract';
import endContract from '../../snapshots/d4341e80715f7a0c19697cb7cdf4aeb13f5909d3fcfa44224e3c5bdec398e120/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('plan', 'text', {
          notNull: true,
          default: lit('consumer_free'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_plan_check_41cfe064',
        expression:
          "\"plan\" IN ('consumer_free', 'consumer_plus', 'business_starter', 'business_pro', 'business_growth')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
