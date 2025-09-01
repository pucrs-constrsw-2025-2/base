import { bootstrap } from './bootstrap';

jest.mock('./bootstrap', () => ({
  bootstrap: jest.fn().mockResolvedValue(undefined),
}));

describe('main', () => {
  it('should call bootstrap', () => {
    require('./main');
    expect(bootstrap).toHaveBeenCalled();
  });
});