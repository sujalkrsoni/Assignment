import {
  Document,
  Model,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

export interface CrudService<TDocument extends Document> {
  create: (payload: Partial<TDocument>) => Promise<TDocument>;
  findAll: (
    filter?: Record<string, unknown>,
    options?: QueryOptions<TDocument>
  ) => Promise<TDocument[]>;
  findById: (
    id: string,
    options?: QueryOptions<TDocument>
  ) => Promise<TDocument | null>;
  updateById: (
    id: string,
    payload: UpdateQuery<TDocument>,
    options?: QueryOptions<TDocument>
  ) => Promise<TDocument | null>;
  deleteById: (id: string) => Promise<TDocument | null>;
}

// Reusable CRUD helpers so feature services stay focused.
export const createBaseService = <TDocument extends Document>(
  model: Model<TDocument>
): CrudService<TDocument> => {
  const create = (payload: Partial<TDocument>): Promise<TDocument> => {
    return model.create(payload);
  };

  const findAll = (
    filter: Record<string, unknown> = {},
    options: QueryOptions<TDocument> = {}
  ): Promise<TDocument[]> => {
    return model.find(filter as never, null, options);
  };

  const findById = (
    id: string,
    options: QueryOptions<TDocument> = {}
  ): Promise<TDocument | null> => {
    return model.findById(id, null, options);
  };

  const updateById = (
    id: string,
    payload: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> = { new: true, runValidators: true }
  ): Promise<TDocument | null> => {
    return model.findByIdAndUpdate(id, payload, options);
  };

  const deleteById = (id: string): Promise<TDocument | null> => {
    return model.findByIdAndDelete(id);
  };

  return {
    create,
    findAll,
    findById,
    updateById,
    deleteById,
  };
};
