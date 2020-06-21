import { Mutation, Options, Query } from '@paljs/types';
import { schema } from './schema';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { format, Options as PrettierOptions } from 'prettier';

export class Generators {
  protected options: Options = {
    output: 'src/graphql',
    excludeFields: [],
    excludeModels: [],
    excludeFieldsByModel: {},
    excludeQueriesAndMutations: [],
    excludeQueriesAndMutationsByModel: {},
  };

  protected queries: Query[] = ['findOne', 'findMany', 'findCount'];
  protected mutations: Mutation[] = [
    'createOne',
    'updateOne',
    'upsertOne',
    'deleteOne',
    'updateMany',
    'deleteMany',
  ];

  constructor(customOptions?: Partial<Options>) {
    this.options = { ...this.options, ...customOptions };
  }

  protected get models() {
    return schema.outputTypes.filter(
      (model) =>
        !['Query', 'Mutation'].includes(model.name) &&
        !model.name.startsWith('Aggregate') &&
        model.name !== 'BatchPayload' &&
        (!this.options.models || this.options.models.includes(model.name)),
    );
  }

  protected excludeFields(model: string) {
    return this.options.excludeFields.concat(
      this.options.excludeFieldsByModel[model],
    );
  }

  protected disableQueries(model: string) {
    return (
      !this.options.disableQueries &&
      !this.options.excludeModels.find(
        (item) => item.name === model && item.queries,
      )
    );
  }

  protected disableMutations(model: string) {
    return (
      !this.options.disableMutations &&
      !this.options.excludeModels.find(
        (item) => item.name === model && item.mutations,
      )
    );
  }

  protected smallModel(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  protected excludedOperations(model: string) {
    return this.options.excludeQueriesAndMutations.concat(
      this.options.excludeQueriesAndMutationsByModel[model] ?? [],
    );
  }

  protected mkdir(path: string) {
    !existsSync(path) && mkdirSync(path, { recursive: true });
  }

  protected createFileIfNotfound(
    path: string,
    fileName: string,
    content: string,
  ) {
    !existsSync(path) && this.mkdir(path);
    !existsSync(`${path}/${fileName}`) &&
      writeFileSync(`${path}/${fileName}`, content);
  }

  protected formation(
    text: string,
    parser: PrettierOptions['parser'] = 'babel',
  ) {
    return format(text, {
      singleQuote: true,
      semi: false,
      trailingComma: 'all',
      parser,
    });
  }
}
