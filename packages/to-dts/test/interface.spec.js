describe('class', () => {
  let sandbox;
  let iface;
  let params;
  let typeParams;
  before(() => {
    sandbox = sinon.createSandbox();
    params = sandbox.stub();
    typeParams = sandbox.stub();

    [iface] = aw.mock(
      [
        ['**/*/params.js', () => params],
        ['**/*/type-params.js', () => typeParams],
      ],
      ['../lib/types/interface']
    );
  });
  afterEach(() => {
    sandbox.reset();
  });

  it('should create empty', () => {
    const def = { name: 'foo' };
    params.returns([]);
    const v = iface(def);
    expect(v).to.eql({
      baseTypes: [],
      kind: 'interface',
      name: 'foo',
      flags: 0,
      members: [],
    });
  });

  it('should create with empty call signature', () => {
    const def = {
      name: 'foo',
      params: 'par',
      this: 'self',
    };
    params.withArgs('par', 'self', 'g').returns([]);
    const v = iface(def, {}, 'g');
    expect(v).to.eql({
      baseTypes: [],
      kind: 'interface',
      name: 'foo',
      flags: 0,
      members: [
        {
          kind: 'call-signature',
          parameters: [],
          returnType: 'void',
          typeParameters: [],
        },
      ],
    });
  });

  it('should create with call signature', () => {
    const def = {
      name: 'foo',
      params: 'par',
      this: 'self',
      returns: 'ret',
    };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('ret').returns('num');
    params.withArgs('par', 'self', g).returns([
      { name: 'first', flags: 1 },
      { name: 'second', flags: 2 },
    ]);
    const v = iface(def, {}, g);
    expect(v).to.eql({
      baseTypes: [],
      kind: 'interface',
      name: 'foo',
      flags: 0,
      members: [
        {
          kind: 'call-signature',
          parameters: [
            { name: 'first?', flags: 0 },
            { name: '...second', flags: 0 },
          ],
          returnType: 'num',
          typeParameters: [],
        },
      ],
    });
  });

  it('should extend from multiple types', () => {
    const def = { name: 'Dog', extends: ['Animal', 'Mammal'] };
    const g = {
      getType: sandbox.stub(),
    };
    g.getType.withArgs('Animal').returns('Anim');
    g.getType.withArgs('Mammal').returns('Mam');
    const v = iface(def, false, g);
    expect(v).to.eql({
      kind: 'interface',
      name: 'Dog',
      flags: 0,
      members: [],
      baseTypes: ['Anim', 'Mam'],
    });
  });

  it('should attach type parameters', () => {
    const def = {
      name: 'foo',
      templates: 'te',
    };
    typeParams.withArgs('te', false, 'g').returns([
      {
        kind: 'type-parameter',
        name: 'T',
      },
      {
        kind: 'type-parameter',
        name: 'K',
        baseType: 'U<S>',
        defaultType: 'P',
      },
    ]);
    const v = iface(def, {}, 'g');
    expect(v).to.eql({
      baseTypes: [],
      kind: 'interface',
      name: 'foo<T, K extends U<S> = P>',
      members: [],
      flags: 0,
    });
  });
});
