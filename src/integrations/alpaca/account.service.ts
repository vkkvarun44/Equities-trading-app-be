import { alpacaBrokerClient } from './client.js'

export interface CreateAlpacaAccountPayload {
  contact: {
    email_address: string
    phone_number: string
    street_address: string[]
    city: string
    state: string
    postal_code: string
    country?: string
  }
  identity: {
    given_name: string
    family_name: string
    date_of_birth: string
    tax_id_type: string
    tax_id: string
    country_of_citizenship?: string
    country_of_tax_residence?: string
    funding_source: string[]
  }
  disclosures: {
    is_control_person: boolean
    is_affiliated_exchange_or_finra: boolean
    is_politically_exposed: boolean
    immediate_family_exposed: boolean
  }
  agreements: Array<{
    agreement: string
    signed_at: string
    ip_address: string
  }>
}

export class AlpacaAccountService {
  async createAccount(payload: CreateAlpacaAccountPayload) {
    const { data } = await alpacaBrokerClient.post('/v1/accounts', payload)
    return data
  }

  async getAccount(accountId: string) {
    const { data } = await alpacaBrokerClient.get(`/v1/accounts/${accountId}`)
    return data
  }

  async listAccounts(params?: { query?: string; created_after?: string; created_before?: string }) {
    const { data } = await alpacaBrokerClient.get('/v1/accounts', { params })
    return data
  }

  async getTradingAccount(accountId: string) {
    const { data } = await alpacaBrokerClient.get(`/v1/trading/accounts/${accountId}/account`)
    return data
  }
}

export const alpacaAccountService = new AlpacaAccountService()
