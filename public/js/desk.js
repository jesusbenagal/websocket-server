const lblPending = document.querySelector("#lbl-pending");
const deskHeading = document.querySelector("#desk");
const noMoreAlert = document.querySelector(".alert");
const btnDraw = document.querySelector("#btn-draw");
const btnDone = document.querySelector("#btn-done");
const lblCurrentTicket = document.querySelector("small");

const searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("escritorio")) {
  window.location = "index.html";
  throw new Error("El escritorio es obligatorio");
}

const deskNumber = searchParams.get("escritorio");
deskHeading.innerText = deskNumber;

let workingTicket = null;

const checkTicketCount = (currentCount = 0) => {
  if (currentCount === 0) {
    noMoreAlert.classList.remove("d-none");
  } else {
    noMoreAlert.classList.add("d-none");
  }
  lblPending.innerHTML = currentCount;
};

const loadInitialCount = async () => {
  const pending = await fetch("/api/ticket/pending").then((res) => res.json());

  checkTicketCount(pending.length);
};

const getTicket = async () => {
  await finishTicket();

  const { status, ticket, message } = await fetch(
    `/api/ticket/draw/${deskNumber}`
  ).then((res) => res.json());

  if (status === "error") {
    lblCurrentTicket.innerText = message;
    return;
  }

  workingTicket = ticket;
  lblCurrentTicket.innerText = `Ticket ${ticket.number}`;
};

const finishTicket = async () => {
  if (!workingTicket) return;

  const { status, message } = await fetch(
    `/api/ticket/done/${workingTicket.id}`,
    {
      method: "put",
    }
  ).then((res) => res.json());

  if (status === "ok") {
    lblCurrentTicket.innerText = "Nadie";
    workingTicket = null;
  }

  if (status === "error") {
    lblCurrentTicket.innerText = message;
  }
};

function connectToWebSockets() {
  const socket = new WebSocket("ws://localhost:3000/ws");

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "on-ticket-count-changed") {
      checkTicketCount(payload);
    }
  };

  socket.onclose = (event) => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}

btnDraw.addEventListener("click", getTicket);
btnDone.addEventListener("click", finishTicket);

loadInitialCount();
connectToWebSockets();
