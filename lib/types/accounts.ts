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

export interface BaseAccountRecord {
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
  [key: string]: unknown
}

export interface AccountBaseResponse {
  accounts: BaseAccountRecord[]
}

export interface ConsumeAccountBasePayload {
  used: Array<{
    email: string
    cpf: string
  }>
}

export type CreateAutomationAccountStep = "personal-data" | "address" | "optional-data" | "final-validation"

export interface CreateAutomationAccountValidationMessage {
  name: string
  message: string
}

export interface CreateAutomationAccountDiagnostics {
  step?: CreateAutomationAccountStep
  currentUrl?: string
  title?: string
  alerts?: string[]
  fieldErrors?: string[]
  validationMessages?: CreateAutomationAccountValidationMessage[]
}

export interface CreateAutomationAccountSuccessResponse {
  success: true
  email: string
  currentUrl?: string
  savedToBot: boolean
  accountId?: string
  saveError?: string
}

export interface CreateAutomationAccountFailureResponse {
  success: false
  email?: string
  error: string
  step?: CreateAutomationAccountStep
  diagnostics?: CreateAutomationAccountDiagnostics
  screenshotPath?: string
}

export type CreateAutomationAccountResponse =
  | CreateAutomationAccountSuccessResponse
  | CreateAutomationAccountFailureResponse

export interface CreateAutomationAccountResultSummary {
  success: boolean
  email?: string
  savedToBot?: boolean
  accountId?: string
  error?: string
  saveError?: string
  step?: CreateAutomationAccountStep
  diagnostics?: CreateAutomationAccountDiagnostics
  screenshotPath?: string
}
