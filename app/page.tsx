"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

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
  price: number;
  status: string;
  guestName?: string;
};

type Tx = {
  _id: string;
  type: string;
  amount: number;
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

type FormData = Record<string, any>;

type MenuItem = {
  id: string;
  label: string;
  icon: any;
};

/* =========================
   HELPERS
========================= */

const money = (n: number) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* =========================
   PAGE
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
  const [editing, setEditing] = useState<Room | null>(null);
  const [toast, setToast] = useState("");
  const [q, setQ] = useState("");

  const [form, setForm] = useState<FormData>({});

  /* =========================
     ADMIN
  ========================= */

  const isAdmin =
    email.trim().toLowerCase() === "alkos@geita.tz";

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
     LOAD DASHBOARD
  ========================= */

  async function load() {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setToast("Failed to load dashboard");
        return;
      }

      const data = await response.json();

      if (data.summary) {
        setSummary(data.summary);
      }

      if (Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }

      if (Array.isArray(data.transactions)) {
        setTx(data.transactions);
      }
    } catch (error) {
      console.error(error);
      setToast("Server connection failed");
    }
  }

  useEffect(() => {
    if (logged) {
      load();
    }
  }, [logged]);

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

      const data = await response.json();

      setToast(
        data.message ||
          data.error ||
          (response.ok ? "Completed successfully" : "Something went wrong")
      );

      setTimeout(() => {
        setToast("");
      }, 3000);

      if (response.ok) {
        setModal(null);
        setEditing(null);
        setForm({});
        await load();
      }
    } catch (error) {
      console.error(error);
      setToast("Unable to connect to server");

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  }

  /* =========================
     OPEN MODAL
  ========================= */

  function open(
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
    setEditing(null);
    setForm({});
  }

  /* =========================
     LOGOUT
  ========================= */

  function logout() {
    setLogged(false);
    setEmail("");
    setTab("dashboard");
    setRooms([]);
    setTx([]);
    setForm({});
    setModal(null);
  }

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!logged) {
    return (
      <div className="login">
        <div className="loginbox">

          <div className="loginbrand">
            <div className="loginmark">
              A
            </div>

            ALKOS
          </div>

          <h1>
            Management Portal
          </h1>

          <p className="subtitle">
            Secure operations dashboard for apartments,
            bar sales, expenses and weekly verification.
          </p>

          <div className="field">
            <label>
              Staff Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="staff@alkos.tz"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  email.includes("@")
                ) {
                  setLogged(true);
                }
              }}
            />
          </div>

          <br />

          <button
            className="btn"
            style={{
              width: "100%",
              justifyContent: "center",
            }}
            onClick={() => {
              if (email.includes("@")) {
                setLogged(true);
              }
            }}
          >
            Sign In
          </button>

        </div>
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
          <div className="brandmark">
            A
          </div>

          <span>
            ALKOS
          </span>
        </div>

        <div className="navgroup">

          <div className="navlabel">
            Management
          </div>

          {menu.map((item) => (
            <button
              key={item.id}
              className={
                "navbtn " +
                (tab === item.id ? "active" : "")
              }
              onClick={() =>
                setTab(item.id)
              }
            >
              <FontAwesomeIcon
                icon={item.icon}
              />

              <span>
                {item.label}
              </span>
            </button>
          ))}

          <div className="navlabel">
            Account
          </div>

          <button
            className="navbtn"
            onClick={logout}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
            />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>

      {/* CONTENT */}

      <section className="content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>
            <b>
              ALKOS Apartments
            </b>

            <div className="subtitle">
              {isAdmin
                ? "Master Administrator"
                : "Staff"}{" "}
              · {email}
            </div>
          </div>

          <div className="actions">

            <button
              className="btn secondary"
              onClick={load}
            >
              <FontAwesomeIcon
                icon={faClockRotateLeft}
              />

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

                  <h1>
                    ALKOS Management
                  </h1>

                  <p>
                    Luxury meets comfort · Geita
                  </p>

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
                  open("room", {
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
                        <th>
                          Room
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Guest
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {rooms.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: 30,
                            }}
                          >
                            No rooms found.
                          </td>
                        </tr>
                      ) : (
                        rooms.map((room) => (
                          <tr
                            key={
                              room._id ||
                              room.number
                            }
                          >

                            <td>
                              {room.number}
                            </td>

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
                              {room.guestName ||
                                "—"}
                            </td>

                            <td>

                              <button
                                className="btn secondary"
                                onClick={() => {
                                  setEditing(room);

                                  open(
                                    "room",
                                    room
                                  );
                                }}
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
                add={() =>
                  open("booking")
                }
                label="New Booking"
              />

              <div className="card">

                <p className="subtitle">
                  Standard room rate:
                  TZS 200,000 per day.
                  Discounts and unpaid
                  balances are tracked
                  automatically.
                </p>

              </div>
            </>
          )}

          {/* ================= BAR ================= */}

          {tab === "bar" && (
            <>
              <Head
                title="Bar POS"
                add={() =>
                  open("bar")
                }
                label="Record Sale"
              />

              <div className="card">

                <p className="subtitle">
                  Record drinks as room
                  charges or standalone
                  cash sales.
                </p>

              </div>
            </>
          )}

          {/* ================= EXPENSES ================= */}

          {tab === "expenses" && (
            <>
              <Head
                title="Expenses & Payroll"
                add={() =>
                  open("expense")
                }
                label="Add Expense"
              />

              <div className="card">

                <p className="subtitle">
                  Operational expenses are
                  included automatically in
                  weekly profit calculations.
                </p>

              </div>
            </>
          )}

          {/* ================= REPORTS ================= */}

          {tab === "reports" && (
            <Reports
              setToast={setToast}
            />
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

                  <label>
                    Search
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                    }}
                  >

                    <input
                      value={q}
                      onChange={(e) =>
                        setQ(e.target.value)
                      }
                      placeholder="Search transactions"
                    />

                    <button
                      className="btn secondary"
                      type="button"
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

                        <th>
                          Date
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actor
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {tx
                        .filter((item) =>
                          (
                            item.description ||
                            ""
                          )
                            .toLowerCase()
                            .includes(
                              q.toLowerCase()
                            )
                        )
                        .map((item) => (
                          <tr
                            key={item._id}
                          >

                            <td>
                              {new Date(
                                item.createdAt
                              ).toLocaleString()}
                            </td>

                            <td>
                              {item.type}
                            </td>

                            <td>
                              {item.description}
                            </td>

                            <td>
                              {money(
                                item.amount
                              )}
                            </td>

                            <td>
                              {item.actorEmail ||
                                "—"}
                            </td>

                          </tr>
                        ))}

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
              ? editing
                ? "Edit Room"
                : "Room"
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
                save(
                  "/api/rooms",
                  form
                )
              }
              close={closeModal}
              isAdmin={isAdmin}
            />
          )}

          {modal === "booking" && (
            <BookingForm
              form={form}
              setForm={setForm}
              rooms={rooms}
              save={() =>
                save(
                  "/api/bookings",
                  form
                )
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
                save(
                  "/api/bar",
                  form
                )
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
                save(
                  "/api/expenses",
                  form
                )
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

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </div>
  );
}

/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="card">
      <div className="metriclabel">
        {label}
      </div>

      <div className="metric">
        {value}
      </div>
    </div>
  );
}

/* =====================================================
   HEADER
===================================================== */

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

        <h1 className="title">
          {title}
        </h1>

        <div className="subtitle">
          Manage and verify records
        </div>

      </div>

      {add && (
        <button
          className="btn"
          onClick={add}
        >
          <FontAwesomeIcon
            icon={faPlus}
          />

          {label || "Add"}
        </button>
      )}

    </div>
  );
}

/* =====================================================
   MODAL
===================================================== */

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
        if (
          event.target ===
          event.currentTarget
        ) {
          close();
        }
      }}
    >

      <div className="modal">

        <div className="modalhead">

          <h2>
            {title}
          </h2>

          <button
            className="iconbtn"
            onClick={close}
            type="button"
          >
            <FontAwesomeIcon
              icon={faXmark}
            />
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

/* =====================================================
   SIMPLE FORM
===================================================== */

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
  setForm: (
    value: FormData
  ) => void;
  save: () => void;
  labels: string[];
  close: () => void;
}) {
  return (
    <>
      <div className="form">

        {fields.map((field, index) => (
          <div
            className="field"
            key={field}
          >

            <label>
              {labels[index]}
            </label>

            <input
              type={
                field === "amount"
                  ? "number"
                  : "text"
              }
              value={
                form[field] ?? ""
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  [field]:
                    event.target.value,
                })
              }
            />

          </div>
        ))}

      </div>

      <br />

      <div className="actions">

        <button
          className="btn secondary"
          onClick={close}
          type="button"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
          />

          Back
        </button>

        <button
          className="btn"
          onClick={save}
          type="button"
        >
          Save
        </button>

      </div>
    </>
  );
}

/* =====================================================
   ROOM FORM
===================================================== */

function RoomForm({
  form,
  setForm,
  save,
  close,
  isAdmin,
}: {
  form: FormData;
  setForm: (
    value: FormData
  ) => void;
  save: () => void;
  close: () => void;
  isAdmin: boolean;
}) {
  return (
    <>
      <div className="form">

        <div className="field">

          <label>
            Room Number
          </label>

          <input
            value={form.number ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                number:
                  event.target.value,
              })
            }
          />

        </div>

        <div className="field">

          <label>
            Price (TZS)
          </label>

          <input
            type="number"
            value={
              form.price ?? 200000
            }
            onChange={(event) =>
              setForm({
                ...form,
                price:
                  Number(
                    event.target.value
                  ),
              })
            }
          />

        </div>

        <div className="field">

          <label>
            Status
          </label>

          <select
            value={
              form.status ||
              "VACANT"
            }
            onChange={(event) =>
              setForm({
                ...form,
                status:
                  event.target.value,
              })
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
          className="btn secondary"
          onClick={close}
          type="button"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
          />

          Back
        </button>

        <button
          className="btn"
          onClick={save}
          type="button"
        >
          Save
        </button>

        {isAdmin &&
          form._id && (
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                alert(
                  "Delete endpoint is not connected yet. Add a DELETE API before enabling deletion."
                );
              }}
            >
              <FontAwesomeIcon
                icon={faTrash}
              />

              Delete
            </button>
          )}

      </div>
    </>
  );
}

/* =====================================================
   BOOKING FORM
===================================================== */

function BookingForm({
  form,
  setForm,
  rooms,
  save,
  close,
}: {
  form: FormData;
  setForm: (
    value: FormData
  ) => void;
  rooms: Room[];
  save: () => void;
  close: () => void;
}) {
  return (
    <>
      <div className="form">

        <div className="field">

          <label>
            Guest Name
          </label>

          <input
            value={form.name ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                name:
                  event.target.value,
              })
            }
          />

        </div>

        <div className="field">

          <label>
            Room
          </label>

          <select
            value={form.room ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                room:
                  event.target.value,
              })
            }
          >

            <option value="">
              Select room
            </option>

            {rooms
              .filter(
                (room) =>
                  room.status ===
                  "VACANT"
              )
              .map((room) => (
                <option
                  key={
                    room._id ||
                    room.number
                  }
                  value={room.number}
                >
                  {room.number}
                </option>
              ))}

          </select>

        </div>

        <div className="field">

          <label>
            Days
          </label>

          <input
            type="number"
            min="1"
            value={
              form.days ?? 1
            }
            onChange={(event) =>
              setForm({
                ...form,
                days:
                  Number(
                    event.target.value
                  ),
              })
            }
          />

        </div>

        <div className="field">

          <label>
            Discount (TZS)
          </label>

          <input
            type="number"
            min="0"
            value={
              form.discount ?? 0
            }
            onChange={(event) =>
              setForm({
                ...form,
                discount:
                  Number(
                    event.target.value
                  ),
              })
            }
          />

        </div>

        <div className="field">

          <label>
            Payment Received (TZS)
          </label>

          <input
            type="number"
            min="0"
            value={
              form.paid ?? 0
            }
            onChange={(event) =>
              setForm({
                ...form,
                paid:
                  Number(
                    event.target.value
                  ),
              })
            }
          />

        </div>

      </div>

      <br />

      <div className="actions">

        <button
          className="btn secondary"
          onClick={close}
          type="button"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
          />

          Back
        </button>

        <button
          className="btn"
          onClick={save}
          type="button"
        >
          Confirm & Save
        </button>

      </div>
    </>
  );
}

/* =====================================================
   REPORTS
===================================================== */

function Reports({
  setToast,
}: {
  setToast: (
    value: string
  ) => void;
}) {
  async function copy() {
    try {
      const response = await fetch(
        "/api/reports/weekly?format=text"
      );

      if (!response.ok) {
        throw new Error(
          "Report failed"
        );
      }

      const text =
        await response.text();

      await navigator.clipboard.writeText(
        text
      );

      setToast(
        "Weekly report copied"
      );

      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (error) {
      console.error(error);

      setToast(
        "Could not copy report"
      );

      setTimeout(() => {
        setToast("");
      }, 2500);
    }
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
            Automatically arranged
            by rolling seven-day
            window.
          </p>

        </div>

      </div>

      <div className="card section">

        <div className="actions">

          <button
            className="btn"
            onClick={() =>
              window.open(
                "/api/reports/weekly",
                "_blank"
              )
            }
            type="button"
          >
            <FontAwesomeIcon
              icon={faPrint}
            />

            View / Print
          </button>

          <button
            className="btn secondary"
            onClick={copy}
            type="button"
          >
            <FontAwesomeIcon
              icon={faCopy}
            />

            Copy Report
          </button>

        </div>

      </div>
    </>
  );
}
