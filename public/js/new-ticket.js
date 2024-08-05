const currentTicketLabel = document.querySelector("span");
const createTicketBtn = document.querySelector("button");

const getLastTicket = async () => {
  const lastTicket = await fetch("/api/ticket/last").then((res) => res.json());

  currentTicketLabel.innerHTML = lastTicket;
};

const createTicket = async () => {
  const newTicket = await fetch("/api/ticket", {
    method: "POST",
  }).then((res) => res.json());

  currentTicketLabel.innerHTML = newTicket.number;
};

createTicketBtn.addEventListener("click", createTicket);

getLastTicket();
