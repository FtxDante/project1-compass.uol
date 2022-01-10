import {AlreadyRegisteredError, NotFoundError, NotGivenQuery} from '../errors';
import {City} from '../interfaces/City';
import {Client} from '../interfaces/Client';
import Repository from '../Repository/Repository';

export default class Service {
  constructor(private repository: Repository) {
  }
  async create(data: City | Client) {
    await this.alreadyRegistered(data);
    const create = await this.repository.create(data);
    return create;
  }

  async getAll(where: any) {
    const result = await this.repository.findAll(where);
    return this.paginate(where, result);
  }

  async findOne(where: object) {
    const isEmptyWhere = Object.keys(where).length === 0;
    if (isEmptyWhere) throw new NotGivenQuery();
    const result = await this.repository.findOne(where);
    if (!result) throw new NotFoundError();
    return result;
  }

  async updateOne(id: string, data: any) {
    await this.findOne({id});
    const columnsFiltered = this.filterColumns(data);
    const result = await this.repository.update(id, data, columnsFiltered);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.findOne({id});
    await this.repository.delete(id);
  }

  async alreadyRegistered(where: City | Client): Promise<void> {
    const AlreadyRegistered = await this.repository.findOne(where);
    if (AlreadyRegistered) throw new AlreadyRegisteredError();
  }

  paginate({limit, page}: any, result: any) {
    const [items, total] = result;
    const offsets = Math.ceil(total/limit);
    const offset = parseInt(page);
    limit = parseInt(limit);
    return {
      items,
      total,
      limit,
      offset,
      offsets,
    };
  }

  filterColumns(data: City) {
    const columns = Object.keys(data);
    return columns.filter((column) => {
      if (column == 'id' || column == 'createdAt') {};
      return column;
    });
  }
};