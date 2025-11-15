import { ClientesRepository } from "./clientes.repository";
import { CreateClienteBody } from "./clientes.schemas";

export class ClientesService {
  constructor(private readonly repo = new ClientesRepository()) {}

  cadastrarCliente(data: CreateClienteBody) {
    return this.repo.create(data);
  }

  listarClientes() {
    return this.repo.listAll();
  }
}
