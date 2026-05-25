import { Axios } from "axios";

export interface ISearchCnpjProvider {
  search: (cnpj: string) => Promise<any>;
}

export class SearchCnpjProvider implements ISearchCnpjProvider {
  private httpProvider: Axios;
  private readonly cnpjApi = {
    name: "Brasil API",
    docUrl: "https://brasilapi.com.br/docs#tag/CNPJ",
    apiUrl: "https://brasilapi.com.br/api/cnpj/v1",
  };

  constructor() {
    console.info(`Using ${this.cnpjApi.name} to fetch CNPJ infos!`);
    this.httpProvider = new Axios({ baseURL: this.cnpjApi.apiUrl });
  }

  async search(cnpj: string): Promise<any> {
    const request = await this.httpProvider.get(`/${cnpj}`);
    return request;
  }
}
