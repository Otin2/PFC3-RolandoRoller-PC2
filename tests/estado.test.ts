import { describe, expect, it } from "vitest";
import { valoresSeguros } from "@/lib/acciones/estado";

describe("valoresSeguros", () => {
  it("nunca devuelve la contraseña ni campos internos de Next.js", () => {
    const seguros = valoresSeguros({ email: "demo@demo.com", password: "123456", "$ACTION_ID_abc": "" });
    expect(seguros).toEqual({ email: "demo@demo.com" });
  });
});
