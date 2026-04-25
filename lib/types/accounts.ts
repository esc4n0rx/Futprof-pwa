export interface Account {
  id: string
  name: string
  base_url: string
  email: string
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ListAccountsResponse {
  accounts: Account[]
}

export interface CreateAccountPayload {
  botId: string
  name: string
  baseUrl: string
  email: string
  password: string
  makePrimary?: boolean
}

export interface CreateAccountResponse {
  account: Account
}

export interface UpdateAccountPayload {
  botId: string
  name: string
  baseUrl: string
  email: string
  password: string
}

export interface SetPrimaryPayload {
  botId: string
  accountId: string
}

export interface SetActivePayload {
  botId: string
  accountId: string
}

export interface CreateAutomationAccountSeed {
  accountName: string
  baseUrl: string
  nome: string
  cpf: string
  rg: string
  data_nasc: string
  sexo: string
  email: string
  senha: string
  cep: string
  endereco: string
  numero: number
  bairro: string
  cidade: string
  estado: string
  celular: string
}

export interface CreateAutomationAccountPayload extends CreateAutomationAccountSeed {
  botId: string
  saveToBot: boolean
}

export interface CreateAutomationAccountResponse {
  success: boolean
  email: string
  error?: string
  screenshotPath?: string
}
