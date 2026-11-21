
import React from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { api, errorMessage } from "./services/api";
import "./styles.css";

function Login() {
  const [u, U] = useState("admin"),
    [p, P] = useState(""),
    [err, E] = useState("");

  const n = useNavigate();

  async function go(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        username: u,
        password: p,
      });

      localStorage.setItem("shawarma_token", data.token);
      localStorage.setItem("shawarma_user", JSON.stringify(data.user));

      n("/");
    } catch (x) {
      E(errorMessage(x));
    }
  }

  return (
    <main className="login">
      <form onSubmit={go}>
        <div className="logo">
          S<span>SHAWARMA</span>
        </div>

        <small>PLATAFORMA DE OPERACIONES</small>
        <h1>Bienvenido de nuevo</h1>
        <p>Ingresa para administrar el restaurante.</p>

        {err && <div className="error">{err}</div>}

        <label>
          Usuario
          <input
            value={u}
            onChange={(e) => U(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={p}
            onChange={(e) => P(e.target.value)}
            required
          />
        </label>

        <button type="submit">Iniciar sesión</button>

        <small>Inicial: admin / Admin123!</small>
      </form>
    </main>
  );
}

function Shell() {
  const [page, Page] = useState("Panel"),
    [data, D] = useState<any>([]),
    [summary, S] = useState<any>(null),
    [err, E] = useState("");

  const n = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("shawarma_user") || "{}"
  );

  async function load() {
    try {
      if (page === "Menú") {
        D((await api.get("/products?all=true")).data);
      } else if (page === "Pedidos" || page === "Cocina") {
        D((await api.get("/orders")).data);
      } else if (page === "Pagos") {
        D((await api.get("/payments")).data);
      } else if (page === "Incidencias") {
        D((await api.get("/incidents")).data);
      } else if (page === "Auditoría") {
        D((await api.get("/audit")).data);
      } else if (page === "Entregas") {
        D(
          (await api.get("/orders")).data.filter(
            (o: any) => o.status === "DELIVERED"
          )
        );
      } else if (page === "Reportes" || page === "Panel") {
        S((await api.get("/reports/summary")).data);
      }

      E("");
    } catch (e) {
      E(errorMessage(e));
      D([]);
    }
  }

  // Corrección: ejecutar la promesa explícitamente con void.
  useEffect(() => {
    void load();
  }, [page]);

  async function action(path: string, body: any) {
    try {
      await api.post(path, body);
      await load();
    } catch (e) {
      E(errorMessage(e));
    }
  }

  async function status(o: any, s: string) {
    let comment =
      s === "CANCELLED"
        ? prompt("Motivo de cancelación")
        : undefined;

    if (s === "CANCELLED" && !comment) return;

    try {
      await api.patch(`/orders/${o.id}/status`, {
        status: s,
        comment,
      });

      await load();
    } catch (e) {
      E(errorMessage(e));
    }
  }

  function createProduct() {
    const name = prompt("Nombre del producto");

    if (!name) return;

    const categoryId = Number(
      prompt("ID de categoría (consulta en base de datos)", "1")
    );

    const currentPrice = Number(
      prompt("Precio en Q", "25")
    );

    // Corrección: promesa marcada explícitamente como ignorada.
    void action("/products", {
      name,
      categoryId,
      currentPrice,
    });
  }

  function createOrder() {
    const productId = Number(
      prompt("ID del producto")
    );

    const quantity = Number(
      prompt("Cantidad", "1")
    );

    if (productId && quantity) {
      // Corrección: promesa marcada explícitamente como ignorada.
      void action("/orders", {
        mode: "DINE_IN",
        items: [{ productId, quantity }],
      });
    }
  }

  function createPayment() {
    const orderId = Number(
      prompt("ID del pedido")
    );

    const amount = Number(
      prompt("Importe en Q")
    );

    if (orderId && amount) {
      // Corrección: promesa marcada explícitamente como ignorada.
      void action("/payments", {
        orderId,
        amount,
        method: "CASH",
      });
    }
  }

  function content() {
    if (page === "Panel" || page === "Reportes") {
      return (
        <div className="cards">
          {[
            ["Pedidos", summary?.orders ?? "—"],
            [
              "Pagos registrados",
              `Q ${Number(
                summary?.recordedPayments || 0
              ).toFixed(2)}`,
            ],
            [
              "Productos activos",
              summary?.activeProducts ?? "—",
            ],
            [
              "Incidencias abiertas",
              summary?.openIncidents ?? "—",
            ],
          ].map((x) => (
            <article>
              <small>{x[0]}</small>
              <strong>{x[1]}</strong>
            </article>
          ))}
        </div>
      );
    }

    const rows = data.map((x: any) =>
      page === "Menú"
        ? [
            x.name,
            x.category?.name || "—",
            `Q ${Number(x.currentPrice).toFixed(2)}`,
            x.isAvailable ? "Disponible" : "Agotado",
          ]
        : page === "Pedidos" || page === "Cocina"
          ? [
              `#${x.orderNumber}`,
              x.mode,
              x.items
                ?.map(
                  (i: any) =>
                    `${i.quantity} × ${i.product?.name}`
                )
                .join(", "),
              `Q ${Number(x.total || 0).toFixed(2)}`,
              x.status,
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    void status(x, e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Cambiar estado</option>

                {x.status === "REGISTERED" && (
                  <>
                    <option value="PREPARING">
                      Preparando
                    </option>
                    <option value="CANCELLED">
                      Cancelar
                    </option>
                  </>
                )}

                {x.status === "PREPARING" && (
                  <>
                    <option value="READY">
                      Listo
                    </option>
                    <option value="CANCELLED">
                      Cancelar
                    </option>
                  </>
                )}

                {x.status === "READY" && (
                  <option value="DELIVERED">
                    Entregado
                  </option>
                )}
              </select>,
            ]
          : page === "Pagos"
            ? [
                `#${x.id}`,
                `Pedido #${x.orderId}`,
                x.method,
                `Q ${Number(x.amount).toFixed(2)}`,
                x.status,
              ]
            : page === "Incidencias"
              ? [
                  `#${x.id}`,
                  x.orderId,
                  x.incidentType,
                  x.description,
                  x.status,
                ]
              : page === "Auditoría"
                ? [
                    x.actionCode,
                    x.entityName,
                    x.entityId,
                    new Date(
                      x.occurredAt
                    ).toLocaleString(),
                  ]
                : [
                    `#${x.orderNumber}`,
                    x.status,
                    `Q ${Number(x.total || 0).toFixed(2)}`,
                  ]
    );

    const headers =
      page === "Menú"
        ? [
            "Producto",
            "Categoría",
            "Precio",
            "Disponibilidad",
          ]
        : page === "Pedidos" || page === "Cocina"
          ? [
              "Pedido",
              "Modalidad",
              "Detalle",
              "Total",
              "Estado",
              "Acción",
            ]
          : page === "Pagos"
            ? [
                "Pago",
                "Pedido",
                "Método",
                "Importe",
                "Estado",
              ]
            : page === "Incidencias"
              ? [
                  "ID",
                  "Pedido",
                  "Tipo",
                  "Descripción",
                  "Estado",
                ]
              : page === "Auditoría"
                ? [
                    "Acción",
                    "Entidad",
                    "ID",
                    "Fecha",
                  ]
                : [
                    "Pedido",
                    "Estado",
                    "Total",
                  ];

    return (
      <section className="panel">
        <div className="table-head">
          <h2>{page}</h2>

          <div>
            {page === "Menú" && (
              <button onClick={createProduct}>
                + Producto
              </button>
            )}

            {page === "Pedidos" && (
              <button onClick={createOrder}>
                + Pedido
              </button>
            )}

            {page === "Pagos" && (
              <button onClick={createPayment}>
                + Pago
              </button>
            )}

            <button
              className="light"
              onClick={() => void load()}
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r: any[], i: number) => (
                <tr key={i}>
                  {r.map((v: any, j: number) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {!rows.length && (
            <p className="empty">
              No hay registros o no tienes permisos para
              consultar esta sección.
            </p>
          )}
        </div>
      </section>
    );
  }

  const links = [
    "Panel",
    "Menú",
    "Pedidos",
    "Cocina",
    "Pagos",
    "Entregas",
    "Reportes",
    "Incidencias",
    "Auditoría",
    "Usuarios",
  ];

  return (
    <div className="app">
      <aside>
        <div className="brand">
          S <b>SHAWARMA</b>
        </div>

        <nav>
          {links
            .filter((x) => x !== "Usuarios")
            .map((x) => (
              <button
                key={x}
                className={page === x ? "selected" : ""}
                onClick={() => Page(x)}
              >
                {x}
              </button>
            ))}
        </nav>

        <footer>
          <small>
            {user.fullName || user.username}
          </small>

          <button
            onClick={() => {
              localStorage.clear();
              n("/login");
            }}
          >
            Cerrar sesión
          </button>
        </footer>
      </aside>

      <main>
        <header>
          <div>
            <small>OPERACIONES</small>
            <h1>Restaurante Shawarma</h1>
          </div>

          <span>● Sistema activo</span>
        </header>

        <div className="body">
          <div className="title">
            <div>
              <small>GESTIÓN DEL RESTAURANTE</small>
              <h2>{page}</h2>
            </div>
          </div>

          {err && (
            <div className="error">{err}</div>
          )}

          {content()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="*"
          element={
            localStorage.getItem("shawarma_token") ? (
              <Shell />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
