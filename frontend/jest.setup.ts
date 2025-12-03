// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock do fetch global
global.fetch = jest.fn();

// Limpa mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
