import {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  Professor,
  ProfessorCreateRequest,
} from "../professors.service";

describe("Professors Service", () => {
  const mockFetch = global.fetch as jest.Mock;
  const mockLocalStorage = window.localStorage as unknown as {
    getItem: jest.Mock;
  };

  const mockToken = "mock-jwt-token";
  const mockAuthTokens = JSON.stringify({ access_token: mockToken });

  const mockProfessor: Professor = {
    id: "123",
    name: "Dr. João Silva",
    registration_number: 12345,
    institucional_email: "joao@uni.edu.br",
    status: "active",
  };

  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(mockAuthTokens);
    mockFetch.mockReset();
  });

  // =====================
  // Testes de Autenticação
  // =====================

  describe("Autenticação", () => {
    it("deve lançar erro quando não há token", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(getProfessors()).rejects.toThrow("Usuário não autenticado");
    });

    it("deve incluir token no header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getProfessors();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });
  });

  // =====================
  // Testes de getProfessors
  // =====================

  describe("getProfessors", () => {
    it("deve retornar lista de professores", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProfessor]),
      });

      const result = await getProfessors();

      expect(result).toEqual([mockProfessor]);
    });

    it("deve retornar array vazio quando não há professores", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await getProfessors();

      expect(result).toEqual([]);
    });
  });

  // =====================
  // Testes de getProfessorById
  // =====================

  describe("getProfessorById", () => {
    it("deve retornar professor por ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfessor),
      });

      const result = await getProfessorById("123");

      expect(result).toEqual(mockProfessor);
    });

    it("deve lançar erro quando professor não existe", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.resolve({ message: "Professor não encontrado" }),
      });

      await expect(getProfessorById("invalid")).rejects.toThrow(
        "Professor não encontrado"
      );
    });
  });

  // =====================
  // Testes de createProfessor
  // =====================

  describe("createProfessor", () => {
    const newProfessor: ProfessorCreateRequest = {
      name: "Dr. Maria Santos",
      registration_number: 67890,
      institucional_email: "maria@uni.edu.br",
      status: "active",
    };

    it("deve criar um novo professor", async () => {
      const created = { ...newProfessor, id: "456" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(created),
      });

      const result = await createProfessor(newProfessor);

      expect(result.id).toBe("456");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/professors"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newProfessor),
        })
      );
    });
  });

  // =====================
  // Testes de updateProfessor
  // =====================

  describe("updateProfessor", () => {
    it("deve atualizar um professor", async () => {
      const updated = { ...mockProfessor, name: "Dr. João Silva Jr." };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updated),
      });

      const result = await updateProfessor("123", {
        name: "Dr. João Silva Jr.",
      });

      expect(result.name).toBe("Dr. João Silva Jr.");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/professors/123"),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  // =====================
  // Testes de deleteProfessor
  // =====================

  describe("deleteProfessor", () => {
    it("deve deletar um professor", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      });

      await expect(deleteProfessor("123")).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/professors/123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  // =====================
  // Testes de Erros
  // =====================

  describe("Tratamento de Erros", () => {
    it("deve extrair mensagem de erro da resposta", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ message: "Dados inválidos" }),
      });

      await expect(getProfessors()).rejects.toThrow("Dados inválidos");
    });

    it("deve tratar erro de rede", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getProfessors()).rejects.toThrow("Network Error");
    });
  });
});
