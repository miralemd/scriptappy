describe('reference', () => {
  let sandbox;
  let ref;
  let dom;
  before(() => {
    sandbox = sinon.createSandbox();
    dom = {
      create: {
        namedTypeReference: v => v,
      },
    };

    [ref] = aw.mock([[require.resolve('dts-dom'), () => dom]], ['../lib/types/reference']);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should return just the first level', () => {
    expect(ref('#/entries/Animal', false, {})).to.eql('Animal');
  });

  it('should ignore every other level', () => {
    expect(ref('#/entries/Animal/definitions/Dog', false, {})).to.eql('Animal.Dog');
  });

  it('should return with namespace prefix', () => {
    expect(ref('#/entries/Animal', false, { namespace: 'farm' })).to.eql('farm.Animal');
  });
});
