#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6059162589031ed870d8d501475ad224dde50213d4a1e4d0138c053dd1efbbb8/contract';
import endContract from '../../snapshots/6059162589031ed870d8d501475ad224dde50213d4a1e4d0138c053dd1efbbb8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b70d5295c1bd97549f3e243febfb4d8089f4ecf243f67f8dd528a5430956032a/contract';
import startContract from '../../snapshots/b70d5295c1bd97549f3e243febfb4d8089f4ecf243f67f8dd528a5430956032a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.alterColumnType({
        schema: 'public',
        table: 'inventoryConsumption',
        column: 'quantityUsed',
        options: {
          qualifiedTargetType: 'float8',
          formatTypeExpected: 'double precision',
          rawTargetTypeForLabel: 'float8',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
