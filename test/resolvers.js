import test from 'ava';
import sinon from 'sinon';
import { resolvePackage, resolveChildren } from '../public/resolvers';

let mockPkg = {
  name: 'package',
  version: '1.0.0',
  link: '/p/package@1.0.0',
  dependencies: [],
};

let fetchJsonStub = sinon.stub();

test.beforeEach(() => global.fetch = sinon.stub().resolves({
  clone: sinon.stub().returns({
    json: fetchJsonStub.returns(mockPkg),
  }),
}));

test.after(() => global.fetch = void 0);

test.serial('#resolvePackage returns fetch', async t => {
  t.assert(global.fetch.notCalled);
  t.is(await resolvePackage('package'), mockPkg);
  t.true(global.fetch.calledOnce);
});

test.serial('#resolvePackage results are cached', async t => {
  t.assert(global.fetch.notCalled);
  t.is(await resolvePackage('package-a'), mockPkg);
  t.is(await resolvePackage('package-a'), mockPkg);
  t.is(await resolvePackage('package-a'), mockPkg);
  t.true(global.fetch.calledOnce);

  t.is(await resolvePackage('package-b'), mockPkg);
  t.false(global.fetch.calledOnce);
  t.is(global.fetch.callCount, 2);
});

test.serial('#resolveChildren returns array when there are no dependencies', async t => {
  t.deepEqual(await resolveChildren({
    ...mockPkg,
    dependencies: [],
  }), []);
});

test.serial('#resolveChildren process dependencies', async t => {
  t.deepEqual(await resolveChildren({
    ...mockPkg,
    dependencies: [mockPkg],
  }, () => {}), [{
    ...mockPkg,
    resolved: mockPkg.version,
  }]);
});

test.serial('#resolveChildren calls progress callback', async t => {
  const cbFunction = sinon.stub();
  await resolveChildren({ ...mockPkg, dependencies: [mockPkg] }, cbFunction);
  t.true(cbFunction.calledOnce);
});

test.serial('#resolveChildren detects, marks and stops loops', async t => {
  fetchJsonStub.returns({
    ...mockPkg,
    dependencies: [{
      ...mockPkg,
    }],
  });

  const result = await resolveChildren({
    ...mockPkg,
    dependencies: [{
      ...mockPkg,
    }],
  }, () => {});

  t.pass(result[0].loop, 'resolver is not in loop and dependency is marked as loop');
});