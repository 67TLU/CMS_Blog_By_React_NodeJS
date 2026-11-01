const clients = new Map();

function addClient(userId, res) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }

  clients.get(userId).add(res);
}

function removeClient(userId, res) {
  const userClients = clients.get(userId);

  if (!userClients) return;

  userClients.delete(res);

  if (userClients.size === 0) {
    clients.delete(userId);
  }
}

function sendToUser(userId, event, data) {
  const userClients = clients.get(userId);
  console.log(`Sending event "${event}" to user ${userId} with data:`, data);
  console.log(userClients);
  console.log("Current clients map:", clients);
  if (!userClients) return;

  for (const client of userClients) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

export { addClient, removeClient, sendToUser }