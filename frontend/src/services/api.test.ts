
import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, errorMessage } from "./api";

describe("Servicio API - Shawarma", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it("debe configurar correctamente la URL base", () => {
    expect(api.defaults.baseURL).toBe(
      import.meta.env.VITE_API_URL || "http://localhost:4000/api"
    );
  });

  it("debe agregar el token de autenticación a la petición", async () => {
    localStorage.setItem("shawarma_token", "token_prueba");

    const config = await api.interceptors.request
      .handlers[0].fulfilled({
        headers: {},
      } as any);

    expect(config.headers.Authorization).toBe("Bearer token_prueba");
  });

  it("no debe agregar Authorization cuando no existe token", async () => {
    const config = await api.interceptors.request
      .handlers[0].fulfilled({
        headers: {},
      } as any);

    expect(config.headers.Authorization).toBeUndefined();
  });

  it("debe devolver el mensaje del servidor", () => {
    const error = {
      response: {
        data: {
          error: "Usuario no autorizado"
        }
      }
    };

    expect(errorMessage(error)).toBe("Usuario no autorizado");
  });

  it("debe devolver el mensaje del error cuando no existe respuesta", () => {
    const error = new Error("Error de conexión");

    expect(errorMessage(error)).toBe("Error de conexión");
  });

  it("debe devolver un mensaje genérico cuando no existe error", () => {
    expect(errorMessage(null)).toBe("Error inesperado");
  });

});
