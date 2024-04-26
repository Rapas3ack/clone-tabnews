function status(request, response) {
  response.status(200).json({ chave: "OK - Mas como está a acentuação?" });
}

export default status;
