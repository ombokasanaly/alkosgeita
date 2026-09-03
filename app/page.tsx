"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faBed,
  faCalendarCheck,
  faWineGlass,
  faMoneyBillTransfer,
  faFileLines,
  faClockRotateLeft,
  faRightFromBracket,
  faPlus,
  faPen,
  faTrash,
  faXmark,
  faArrowLeft,
  faPrint,
  faCopy,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

/* =========================
   TYPES
========================= */

type Room = {
  _id?: string;
  number: string;
  price: number | string;
  status: string;
  guestName?: string;
};

type Tx = {
  _id?: string;
  type: string;
  amount: number | string;
  description: string;
  actorEmail?: string;
  createdAt: string;
};

type Summary = {
  revenue: number;
  expenses: number;
  profit: number;
  debt: number;
  occupancy: number;
  occupied: number;
  rooms: number;
  discounts: number;
};

type MenuItem = {
  id: string;
  label: string;
  icon: typeof faGaugeHigh;
};

type FormData = Record<string, string | number | undefined>;

/* =========================
   HELPERS
========================= */

const money = (value: number | string | undefined | null): string => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
};

/* =========================
   MENU
========================= */

const menu: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: faGaugeHigh,
  },
  {
    id: "rooms",
    label: "Rooms",
    icon: faBed,
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: faCalendarCheck,
  },
  {
    id: "bar",
    label: "Bar POS",
    icon: faWineGlass,
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: faMoneyBillTransfer,
  },
  {
    id: "reports",
    label: "Weekly Reports",
    icon: faFileLines,
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: faClockRotateLeft,
  },
];

/* =========================
   MAIN PAGE
========================= */

export default function Page() {
  const [email, setEmail] = useState("");
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tx, setTx] = useState<Tx[]>([]);

  const [summary, setSummary] = useState<Summary>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    debt: 0,
    occupancy: 0,
    occupied: 0,
    rooms: 5,
    discounts: 0,
  });

  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");

  const [form, setForm] = useState<FormData>({});

  const isAdmin = email.trim().toLowerCase() === "alkos@geita.tz";

  /* =========================
     LOAD DASHBOARD
  ========================= */

  async function load() {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const data = await response.json();

      if (data.summary) {
        setSummary({
          revenue: Number(data.summary.revenue ?? 0),
          expenses: Number(data.summary.expenses ?? 0),
          profit: Number(data.summary.profit ?? 0),
          debt: Number(data.summary.debt ?? 0),
          occupancy: Number(data.summary.occupancy ?? 0),
          occupied: Number(data.summary.occupied ?? 0),
          rooms: Number(data.summary.rooms ?? 5),
          discounts: Number(data.summary.discounts ?? 0),
        });
      }

      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      setTx(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (error) {
      console.error("Dashboard load error:", error);
      showToast("Failed to load dashboard");
    }
  }

  useEffect(() => {
    if (logged) {
      void load();
    }
  }, [logged]);

  /* =========================
     TOAST
  ========================= */

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  }

  /* =========================
     SAVE
  ========================= */

  async function save(url: string, body: FormData) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          actorEmail: email,
        }),
      });

      let data: { message?: string; error?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        showToast(data.error || "Operation failed");
        return;
      }

      showToast(data.message || "Completed successfully");

      setModal(null);
      setForm({});

      await load();
    } catch (error) {
      console.error("Save error:", error);
      showToast("Network error. Please try again.");
    }
  }

  /* =========================
     OPEN MODAL
  ========================= */

  function openModal(
    modalName: string,
    data: FormData = {}
  ) {
    setForm(data);
    setModal(modalName);
  }

  /* =========================
     CLOSE MODAL
  ========================= */

  function closeModal() {
    setModal(null);
    setForm({});
  }

  /* =========================
     LOGOUT
  ========================= */

  function logout() {
    setLogged(false);
    setEmail("");
    setTab("dashboard");
    setModal(null);
    setForm({});
  }

  /* =========================
     LOGIN
  ========================= */

  function handleLogin() {
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      showToast("Enter a valid email address");
      return;
    }

    setEmail(cleanEmail);
    setLogged(true);
  }

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!logged) {
    return (
      <div className="login">
        <div className="loginbox">
          <div className="loginbrand">
            <div className="loginmark">A</div>
            ALKOS
          </div>

          <h1>Management Portal</h1>

          <p className="subtitle">
            Secure operations dashboard for apartments, bar sales,
            expenses and weekly verification.
          </p>

          <div className="field">
            <label htmlFor="staff-email">Staff Email</label>

            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleLogin();
                }
              }}
              placeholder="staff@alkos.tz"
              autoComplete="email"
            />
          </div>

          <br />

          <button
            type="button"
            className="btn"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
            onClick={handleLogin}
          >
            Sign In
          </button>
        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  /* =========================
     MAIN APP
  ========================= */

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandmark">A</div>
          <span>ALKOS</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">Management</div>

          {menu.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                "navbtn " +
                (tab === item.id ? "active" : "")
              }
              onClick={() => setTab(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="navlabel">Account</div>

          <button
            type="button"
            className="navbtn"
            onClick={logout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <section className="content">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <b>ALKOS Apartments</b>

            <div className="subtitle">
              {isAdmin
                ? "Master Administrator"
                : "Staff"}{" "}
              · {email}
            </div>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => void load()}
            >
              <FontAwesomeIcon icon={faClockRotateLeft} />
              Refresh
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="main">
          {/* ================= DASHBOARD ================= */}

          {tab === "dashboard" && (
            <>
              <div className="hero">
                <div className="heroText">
                  <h1>ALKOS Management</h1>
                  <p>Luxury meets comfort · Geita</p>
                </div>
              </div>

              <div className="grid">
                <MetricCard
                  label="Revenue"
                  value={money(summary.revenue)}
                />

                <MetricCard
                  label="Expenses"
                  value={money(summary.expenses)}
                />

                <MetricCard
                  label="Net Profit"
                  value={money(summary.profit)}
                />

                <MetricCard
                  label="Outstanding Debt"
                  value={money(summary.debt)}
                />
              </div>

              <div className="grid">
                <MetricCard
                  label="Occupancy"
                  value={`${summary.occupancy}%`}
                />

                <MetricCard
                  label="Occupied Rooms"
                  value={`${summary.occupied} / ${summary.rooms}`}
                />

                <MetricCard
                  label="Discounts Given"
                  value={money(summary.discounts)}
                />

                <MetricCard
                  label="Audit Window"
                  value="7 Days"
                />
              </div>
            </>
          )}

          {/* ================= ROOMS ================= */}

          {tab === "rooms" && (
            <>
              <Head
                title="Rooms"
                add={() =>
                  openModal("room", {
                    price: 200000,
                    status: "VACANT",
                  })
                }
                label="Add Room"
              />

              <div className="card">
                <div className="tablewrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Guest</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rooms.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            No rooms found.
                          </td>
                        </tr>
                      ) : (
                        rooms.map((room, index) => (
                          <tr
                            key={
                              room._id ??
                              `${room.number}-${index}`
                            }
                          >
                            <td>{room.number}</td>

                            <td>
                              {money(room.price)}
                            </td>

                            <td>
                              <span
                                className={
                                  "badge " +
                                  (room.status ===
                                  "OCCUPIED"
                                    ? "red"
                                    : "green")
                                }
                              >
                                {room.status}
                              </span>
                            </td>

                            <td>
                              {room.guestName || "—"}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn secondary"
                                onClick={() =>
                                  openModal("room", {
                                    ...room,
                                  })
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faPen}
                                />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ================= BOOKINGS ================= */}

          {tab === "bookings" && (
            <>
              <Head
                title="Guest Billing"
                add={() => openModal("booking")}
                label="New Booking"
              />

              <div className="card">
                <p className="subtitle">
                  Standard room rate: TZS 200,000 per
                  day. Discounts and unpaid balances are
                  tracked automatically.
                </p>
              </div>
            </>
          )}

          {/* ================= BAR ================= */}

          {tab === "bar" && (
            <>
              <Head
                title="Bar POS"
                add={() => openModal("bar")}
                label="Record Sale"
              />

              <div className="card">
                <p className="subtitle">
                  Record drinks as room charges or
                  standalone cash sales.
                </p>
              </div>
            </>
          )}

          {/* ================= EXPENSES ================= */}

          {tab === "expenses" && (
            <>
              <Head
                title="Expenses & Payroll"
                add={() => openModal("expense")}
                label="Add Expense"
              />

              <div className="card">
                <p className="subtitle">
                  Operational expenses are included
                  automatically in weekly profit
                  calculations.
                </p>
              </div>
            </>
          )}

          {/* ================= REPORTS ================= */}

          {tab === "reports" && (
            <Reports setToast={showToast} />
          )}

          {/* ================= AUDIT ================= */}

          {tab === "audit" && (
            <>
              <Head title="Audit Log" />

              <div className="card">
                <div
                  className="field"
                  style={{
                    maxWidth: 350,
                    marginBottom: 12,
                  }}
                >
                  <label htmlFor="audit-search">
                    Search
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                    }}
                  >
                    <input
                      id="audit-search"
                      value={q}
                      onChange={(event) =>
                        setQ(event.target.value)
                      }
                      placeholder="Search transactions"
                    />

                    <button
                      type="button"
                      className="btn secondary"
                      aria-label="Search"
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                      />
                    </button>
                  </div>
                </div>

                <div className="tablewrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Actor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tx
                        .filter((transaction) =>
                          (
                            transaction.description ||
                            ""
                          )
                            .toLowerCase()
                            .includes(
                              q.toLowerCase()
                            )
                        )
                        .map((transaction, index) => (
                          <tr
                            key={
                              transaction._id ??
                              `${transaction.createdAt}-${index}`
                            }
                          >
                            <td>
                              {transaction.createdAt
                                ? new Date(
                                    transaction.createdAt
                                  ).toLocaleString()
                                : "—"}
                            </td>

                            <td>
                              {transaction.type}
                            </td>

                            <td>
                              {
                                transaction.description
                              }
                            </td>

                            <td>
                              {money(
                                transaction.amount
                              )}
                            </td>

                            <td>
                              {
                                transaction.actorEmail ||
                                "—"
                              }
                            </td>
                          </tr>
                        ))}

                      {tx.length === 0 && (
                        <tr>
                          <td colSpan={5}>
                            No audit records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </section>

      {/* ================= MODAL ================= */}

      {modal && (
        <Modal
          title={
            modal === "room"
              ? "Room"
              : modal === "booking"
              ? "New Booking"
              : modal === "bar"
              ? "Bar Sale"
              : "Expense"
          }
          close={closeModal}
        >
          {modal === "room" && (
            <RoomForm
              form={form}
              setForm={setForm}
              save={() =>
                void save("/api/rooms", form)
              }
              isAdmin={isAdmin}
              close={closeModal}
            />
          )}

          {modal === "booking" && (
            <BookingForm
              form={form}
              setForm={setForm}
              rooms={rooms}
              save={() =>
                void save("/api/bookings", form)
              }
              close={closeModal}
            />
          )}

          {modal === "bar" && (
            <SimpleForm
              fields={[
                "description",
                "amount",
                "guest",
              ]}
              form={form}
              setForm={setForm}
              save={() =>
                void save("/api/bar", form)
              }
              labels={[
                "Item / drink",
                "Amount (TZS)",
                "Guest / room (optional)",
              ]}
              close={closeModal}
            />
          )}

          {modal === "expense" && (
            <SimpleForm
              fields={[
                "description",
                "amount",
              ]}
              form={form}
              setForm={setForm}
              save={() =>
                void save("/api/expenses", form)
              }
              labels={[
                "Description",
                "Amount (TZS)",
              ]}
              close={closeModal}
            />
          )}
        </Modal>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* =========================
   METRIC CARD
========================= */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="card">
      <div className="metriclabel">{label}</div>
      <div className="metric">{value}</div>
    </div>
  );
}

/* =========================
   SECTION HEADER
========================= */

function Head({
  title,
  add,
  label,
}: {
  title: string;
  add?: () => void;
  label?: string;
}) {
  return (
    <div className="sectionhead">
      <div>
        <h1 className="title">{title}</h1>

        <div className="subtitle">
          Manage and verify records
        </div>
      </div>

      {add && (
        <button
          type="button"
          className="btn"
          onClick={add}
        >
          <FontAwesomeIcon icon={faPlus} />
          {label}
        </button>
      )}
    </div>
  );
}

/* =========================
   MODAL
========================= */

function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modalback"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div className="modal">
        <div className="modalhead">
          <h2>{title}</h2>

          <button
            type="button"
            className="iconbtn"
            onClick={close}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================
   SIMPLE FORM
========================= */

function SimpleForm({
  fields,
  form,
  setForm,
  save,
  labels,
  close,
}: {
  fields: string[];
  form: FormData;
  setForm: React.Dispatch<
    React.SetStateAction<FormData>
  >;
  save: () => void;
  labels: string[];
  close: () => void;
}) {
  return (
    <>
      <div className="form">
        {fields.map((field, index) => (
          <div className="field" key={field}>
            <label htmlFor={`form-${field}`}>
              {labels[index] ?? field}
            </label>

            <input
              id={`form-${field}`}
              type={
                field === "amount"
                  ? "number"
                  : "text"
              }
              value={String(form[field] ?? "")}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [field]: event.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>

      <br />

      <div className="actions">
        <button
          type="button"
          className="btn secondary"
          onClick={close}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        <button
          type="button"
          className="btn"
          onClick={save}
        >
          Save
        </button>
      </div>
    </>
  );
}

/* =========================
   ROOM FORM
========================= */

function RoomForm({
  form,
  setForm,
  save,
  isAdmin,
  close,
}: {
  form: FormData;
  setForm: React.Dispatch<
    React.SetStateAction<FormData>
  >;
  save: () => void;
  isAdmin: boolean;
  close: () => void;
}) {
  function deleteRoom() {
    window.alert(
      "Delete endpoint is not connected yet. The room can be edited safely."
    );
  }

  return (
    <>
      <div className="form">
        <div className="field">
          <label htmlFor="room-number">
            Room Number
          </label>

          <input
            id="room-number"
            value={String(form.number ?? "")}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                number: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="room-price">
            Price (TZS)
          </label>

          <input
            id="room-price"
            type="number"
            min="0"
            value={String(
              form.price ?? 200000
            )}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                price: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="room-status">
            Status
          </label>

          <select
            id="room-status"
            value={String(
              form.status ?? "VACANT"
            )}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                status: event.target.value,
              }))
            }
          >
            <option value="VACANT">
              VACANT
            </option>

            <option value="OCCUPIED">
              OCCUPIED
            </option>
          </select>
        </div>
      </div>

      <br />

      <div className="actions">
        <button
          type="button"
          className="btn secondary"
          onClick={close}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        <button
          type="button"
          className="btn"
          onClick={save}
        >
          Save
        </button>

        {isAdmin && form._id && (
          <button
            type="button"
            className="btn danger"
            onClick={deleteRoom}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        )}
      </div>
    </>
  );
}

/* =========================
   BOOKING FORM
========================= */

function BookingForm({
  form,
  setForm,
  rooms,
  save,
  close,
}: {
  form: FormData;
  setForm: React.Dispatch<
    React.SetStateAction<FormData>
  >;
  rooms: Room[];
  save: () => void;
  close: () => void;
}) {
  const vacantRooms = rooms.filter(
    (room) => room.status === "VACANT"
  );

  return (
    <>
      <div className="form">
        <div className="field">
          <label htmlFor="guest-name">
            Guest Name
          </label>

          <input
            id="guest-name"
            value={String(form.name ?? "")}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="booking-room">
            Room
          </label>

          <select
            id="booking-room"
            value={String(form.room ?? "")}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                room: event.target.value,
              }))
            }
          >
            <option value="">
              Select room
            </option>

            {vacantRooms.map((room, index) => (
              <option
                key={
                  room._id ??
                  `${room.number}-${index}`
                }
                value={room.number}
              >
                {room.number}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="booking-days">
            Days
          </label>

          <input
            id="booking-days"
            type="number"
            min="1"
            value={String(form.days ?? 1)}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                days: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="booking-discount">
            Discount (TZS)
          </label>

          <input
            id="booking-discount"
            type="number"
            min="0"
            value={String(
              form.discount ?? 0
            )}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                discount: event.target.value,
              }))
            }
          />
        </div>

        <div className="field">
          <label htmlFor="booking-paid">
            Payment Received (TZS)
          </label>

          <input
            id="booking-paid"
            type="number"
            min="0"
            value={String(form.paid ?? 0)}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                paid: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <br />

      <div className="actions">
        <button
          type="button"
          className="btn secondary"
          onClick={close}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </button>

        <button
          type="button"
          className="btn"
          onClick={save}
        >
          Confirm & Save
        </button>
      </div>
    </>
  );
}

/* =========================
   REPORTS
========================= */

function Reports({
  setToast,
}: {
  setToast: (message: string) => void;
}) {
  async function copyReport() {
    try {
      const response = await fetch(
        "/api/reports/weekly?format=text",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not generate report"
        );
      }

      const text = await response.text();

      await navigator.clipboard.writeText(text);

      setToast("Weekly report copied");
    } catch (error) {
      console.error("Report copy error:", error);
      setToast(
        "Could not copy weekly report"
      );
    }

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  }

  function viewReport() {
    window.open(
      "/api/reports/weekly",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      <Head title="Weekly Reports" />

      <div className="grid">
        <div className="card">
          <div className="metriclabel">
            Audit Cycle
          </div>

          <div className="metric">
            7 Days
          </div>

          <p className="subtitle">
            Automatically arranged by rolling
            seven-day window.
          </p>
        </div>
      </div>

      <div className="card section">
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={viewReport}
          >
            <FontAwesomeIcon icon={faPrint} />
            View / Print
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() => void copyReport()}
          >
            <FontAwesomeIcon icon={faCopy} />
            Copy Report
          </button>
        </div>
      </div>
    </>
  );
}
