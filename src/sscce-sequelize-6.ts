import { DataTypes, Model, LOCK } from 'sequelize';
import { createSequelize6Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model {}

  Foo.init({
    name: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Foo',
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;

  await Foo.create({ name: 'TS foo' });
  expect(await Foo.count()).to.equal(1);

  console.log(typeof LOCK);
  console.log(JSON.stringify(LOCK));

  sequelize.transaction(async (t) => {
    const foo = await Foo.findByPk(1, { lock: LOCK.UPDATE, transaction: t });
    expect(foo).to.have.property('id', 1  );
    await foo?.update({ name: 'TS foo updated' }, { transaction: t });
  });

  expect(await Foo.findByPk(1)).to.have.property('name', 'TS foo updated');
}
