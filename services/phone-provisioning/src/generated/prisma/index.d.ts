
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model PhoneNumber
 * 
 */
export type PhoneNumber = $Result.DefaultSelection<Prisma.$PhoneNumberPayload>
/**
 * Model PortingRequest
 * 
 */
export type PortingRequest = $Result.DefaultSelection<Prisma.$PortingRequestPayload>
/**
 * Model ProvisioningJob
 * 
 */
export type ProvisioningJob = $Result.DefaultSelection<Prisma.$ProvisioningJobPayload>
/**
 * Model InventoryItem
 * 
 */
export type InventoryItem = $Result.DefaultSelection<Prisma.$InventoryItemPayload>
/**
 * Model Webhook
 * 
 */
export type Webhook = $Result.DefaultSelection<Prisma.$WebhookPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const PhoneNumberStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  RELEASED: 'RELEASED',
  SUSPENDED: 'SUSPENDED'
};

export type PhoneNumberStatus = (typeof PhoneNumberStatus)[keyof typeof PhoneNumberStatus]


export const PortingStatus: {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export type PortingStatus = (typeof PortingStatus)[keyof typeof PortingStatus]


export const JobStatus: {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]


export const JobPriority: {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

export type JobPriority = (typeof JobPriority)[keyof typeof JobPriority]


export const InventoryType: {
  PHONE_NUMBER: 'PHONE_NUMBER',
  DEVICE: 'DEVICE',
  SIM_CARD: 'SIM_CARD'
};

export type InventoryType = (typeof InventoryType)[keyof typeof InventoryType]


export const InventoryStatus: {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  ALLOCATED: 'ALLOCATED',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus]


export const WebhookStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export type WebhookStatus = (typeof WebhookStatus)[keyof typeof WebhookStatus]

}

export type PhoneNumberStatus = $Enums.PhoneNumberStatus

export const PhoneNumberStatus: typeof $Enums.PhoneNumberStatus

export type PortingStatus = $Enums.PortingStatus

export const PortingStatus: typeof $Enums.PortingStatus

export type JobStatus = $Enums.JobStatus

export const JobStatus: typeof $Enums.JobStatus

export type JobPriority = $Enums.JobPriority

export const JobPriority: typeof $Enums.JobPriority

export type InventoryType = $Enums.InventoryType

export const InventoryType: typeof $Enums.InventoryType

export type InventoryStatus = $Enums.InventoryStatus

export const InventoryStatus: typeof $Enums.InventoryStatus

export type WebhookStatus = $Enums.WebhookStatus

export const WebhookStatus: typeof $Enums.WebhookStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more PhoneNumbers
 * const phoneNumbers = await prisma.phoneNumber.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more PhoneNumbers
   * const phoneNumbers = await prisma.phoneNumber.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.phoneNumber`: Exposes CRUD operations for the **PhoneNumber** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PhoneNumbers
    * const phoneNumbers = await prisma.phoneNumber.findMany()
    * ```
    */
  get phoneNumber(): Prisma.PhoneNumberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portingRequest`: Exposes CRUD operations for the **PortingRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PortingRequests
    * const portingRequests = await prisma.portingRequest.findMany()
    * ```
    */
  get portingRequest(): Prisma.PortingRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.provisioningJob`: Exposes CRUD operations for the **ProvisioningJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProvisioningJobs
    * const provisioningJobs = await prisma.provisioningJob.findMany()
    * ```
    */
  get provisioningJob(): Prisma.ProvisioningJobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inventoryItem`: Exposes CRUD operations for the **InventoryItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryItems
    * const inventoryItems = await prisma.inventoryItem.findMany()
    * ```
    */
  get inventoryItem(): Prisma.InventoryItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.webhook`: Exposes CRUD operations for the **Webhook** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Webhooks
    * const webhooks = await prisma.webhook.findMany()
    * ```
    */
  get webhook(): Prisma.WebhookDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.3
   * Query Engine version: bb420e667c1820a8c05a38023385f6cc7ef8e83a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    PhoneNumber: 'PhoneNumber',
    PortingRequest: 'PortingRequest',
    ProvisioningJob: 'ProvisioningJob',
    InventoryItem: 'InventoryItem',
    Webhook: 'Webhook'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "phoneNumber" | "portingRequest" | "provisioningJob" | "inventoryItem" | "webhook"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      PhoneNumber: {
        payload: Prisma.$PhoneNumberPayload<ExtArgs>
        fields: Prisma.PhoneNumberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PhoneNumberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PhoneNumberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          findFirst: {
            args: Prisma.PhoneNumberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PhoneNumberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          findMany: {
            args: Prisma.PhoneNumberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>[]
          }
          create: {
            args: Prisma.PhoneNumberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          createMany: {
            args: Prisma.PhoneNumberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PhoneNumberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>[]
          }
          delete: {
            args: Prisma.PhoneNumberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          update: {
            args: Prisma.PhoneNumberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          deleteMany: {
            args: Prisma.PhoneNumberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PhoneNumberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PhoneNumberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>[]
          }
          upsert: {
            args: Prisma.PhoneNumberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PhoneNumberPayload>
          }
          aggregate: {
            args: Prisma.PhoneNumberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePhoneNumber>
          }
          groupBy: {
            args: Prisma.PhoneNumberGroupByArgs<ExtArgs>
            result: $Utils.Optional<PhoneNumberGroupByOutputType>[]
          }
          count: {
            args: Prisma.PhoneNumberCountArgs<ExtArgs>
            result: $Utils.Optional<PhoneNumberCountAggregateOutputType> | number
          }
        }
      }
      PortingRequest: {
        payload: Prisma.$PortingRequestPayload<ExtArgs>
        fields: Prisma.PortingRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortingRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortingRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          findFirst: {
            args: Prisma.PortingRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortingRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          findMany: {
            args: Prisma.PortingRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>[]
          }
          create: {
            args: Prisma.PortingRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          createMany: {
            args: Prisma.PortingRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PortingRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>[]
          }
          delete: {
            args: Prisma.PortingRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          update: {
            args: Prisma.PortingRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          deleteMany: {
            args: Prisma.PortingRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortingRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PortingRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>[]
          }
          upsert: {
            args: Prisma.PortingRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortingRequestPayload>
          }
          aggregate: {
            args: Prisma.PortingRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortingRequest>
          }
          groupBy: {
            args: Prisma.PortingRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortingRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortingRequestCountArgs<ExtArgs>
            result: $Utils.Optional<PortingRequestCountAggregateOutputType> | number
          }
        }
      }
      ProvisioningJob: {
        payload: Prisma.$ProvisioningJobPayload<ExtArgs>
        fields: Prisma.ProvisioningJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProvisioningJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProvisioningJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          findFirst: {
            args: Prisma.ProvisioningJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProvisioningJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          findMany: {
            args: Prisma.ProvisioningJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>[]
          }
          create: {
            args: Prisma.ProvisioningJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          createMany: {
            args: Prisma.ProvisioningJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProvisioningJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>[]
          }
          delete: {
            args: Prisma.ProvisioningJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          update: {
            args: Prisma.ProvisioningJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          deleteMany: {
            args: Prisma.ProvisioningJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProvisioningJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProvisioningJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>[]
          }
          upsert: {
            args: Prisma.ProvisioningJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProvisioningJobPayload>
          }
          aggregate: {
            args: Prisma.ProvisioningJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProvisioningJob>
          }
          groupBy: {
            args: Prisma.ProvisioningJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProvisioningJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProvisioningJobCountArgs<ExtArgs>
            result: $Utils.Optional<ProvisioningJobCountAggregateOutputType> | number
          }
        }
      }
      InventoryItem: {
        payload: Prisma.$InventoryItemPayload<ExtArgs>
        fields: Prisma.InventoryItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          findFirst: {
            args: Prisma.InventoryItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          findMany: {
            args: Prisma.InventoryItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>[]
          }
          create: {
            args: Prisma.InventoryItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          createMany: {
            args: Prisma.InventoryItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>[]
          }
          delete: {
            args: Prisma.InventoryItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          update: {
            args: Prisma.InventoryItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          deleteMany: {
            args: Prisma.InventoryItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InventoryItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>[]
          }
          upsert: {
            args: Prisma.InventoryItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          aggregate: {
            args: Prisma.InventoryItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryItem>
          }
          groupBy: {
            args: Prisma.InventoryItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryItemCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryItemCountAggregateOutputType> | number
          }
        }
      }
      Webhook: {
        payload: Prisma.$WebhookPayload<ExtArgs>
        fields: Prisma.WebhookFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WebhookFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WebhookFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          findFirst: {
            args: Prisma.WebhookFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WebhookFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          findMany: {
            args: Prisma.WebhookFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>[]
          }
          create: {
            args: Prisma.WebhookCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          createMany: {
            args: Prisma.WebhookCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WebhookCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>[]
          }
          delete: {
            args: Prisma.WebhookDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          update: {
            args: Prisma.WebhookUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          deleteMany: {
            args: Prisma.WebhookDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WebhookUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WebhookUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>[]
          }
          upsert: {
            args: Prisma.WebhookUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WebhookPayload>
          }
          aggregate: {
            args: Prisma.WebhookAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWebhook>
          }
          groupBy: {
            args: Prisma.WebhookGroupByArgs<ExtArgs>
            result: $Utils.Optional<WebhookGroupByOutputType>[]
          }
          count: {
            args: Prisma.WebhookCountArgs<ExtArgs>
            result: $Utils.Optional<WebhookCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    phoneNumber?: PhoneNumberOmit
    portingRequest?: PortingRequestOmit
    provisioningJob?: ProvisioningJobOmit
    inventoryItem?: InventoryItemOmit
    webhook?: WebhookOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type PhoneNumberCountOutputType
   */

  export type PhoneNumberCountOutputType = {
    portingRequests: number
  }

  export type PhoneNumberCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portingRequests?: boolean | PhoneNumberCountOutputTypeCountPortingRequestsArgs
  }

  // Custom InputTypes
  /**
   * PhoneNumberCountOutputType without action
   */
  export type PhoneNumberCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumberCountOutputType
     */
    select?: PhoneNumberCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PhoneNumberCountOutputType without action
   */
  export type PhoneNumberCountOutputTypeCountPortingRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortingRequestWhereInput
  }


  /**
   * Models
   */

  /**
   * Model PhoneNumber
   */

  export type AggregatePhoneNumber = {
    _count: PhoneNumberCountAggregateOutputType | null
    _min: PhoneNumberMinAggregateOutputType | null
    _max: PhoneNumberMaxAggregateOutputType | null
  }

  export type PhoneNumberMinAggregateOutputType = {
    id: string | null
    number: string | null
    customerId: string | null
    voiceUrl: string | null
    smsUrl: string | null
    status: $Enums.PhoneNumberStatus | null
    purchasedAt: Date | null
    releasedAt: Date | null
    releaseReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PhoneNumberMaxAggregateOutputType = {
    id: string | null
    number: string | null
    customerId: string | null
    voiceUrl: string | null
    smsUrl: string | null
    status: $Enums.PhoneNumberStatus | null
    purchasedAt: Date | null
    releasedAt: Date | null
    releaseReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PhoneNumberCountAggregateOutputType = {
    id: number
    number: number
    customerId: number
    billingAddress: number
    voiceUrl: number
    smsUrl: number
    status: number
    purchasedAt: number
    releasedAt: number
    releaseReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PhoneNumberMinAggregateInputType = {
    id?: true
    number?: true
    customerId?: true
    voiceUrl?: true
    smsUrl?: true
    status?: true
    purchasedAt?: true
    releasedAt?: true
    releaseReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PhoneNumberMaxAggregateInputType = {
    id?: true
    number?: true
    customerId?: true
    voiceUrl?: true
    smsUrl?: true
    status?: true
    purchasedAt?: true
    releasedAt?: true
    releaseReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PhoneNumberCountAggregateInputType = {
    id?: true
    number?: true
    customerId?: true
    billingAddress?: true
    voiceUrl?: true
    smsUrl?: true
    status?: true
    purchasedAt?: true
    releasedAt?: true
    releaseReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PhoneNumberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PhoneNumber to aggregate.
     */
    where?: PhoneNumberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PhoneNumbers to fetch.
     */
    orderBy?: PhoneNumberOrderByWithRelationInput | PhoneNumberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PhoneNumberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PhoneNumbers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PhoneNumbers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PhoneNumbers
    **/
    _count?: true | PhoneNumberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PhoneNumberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PhoneNumberMaxAggregateInputType
  }

  export type GetPhoneNumberAggregateType<T extends PhoneNumberAggregateArgs> = {
        [P in keyof T & keyof AggregatePhoneNumber]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePhoneNumber[P]>
      : GetScalarType<T[P], AggregatePhoneNumber[P]>
  }




  export type PhoneNumberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PhoneNumberWhereInput
    orderBy?: PhoneNumberOrderByWithAggregationInput | PhoneNumberOrderByWithAggregationInput[]
    by: PhoneNumberScalarFieldEnum[] | PhoneNumberScalarFieldEnum
    having?: PhoneNumberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PhoneNumberCountAggregateInputType | true
    _min?: PhoneNumberMinAggregateInputType
    _max?: PhoneNumberMaxAggregateInputType
  }

  export type PhoneNumberGroupByOutputType = {
    id: string
    number: string
    customerId: string
    billingAddress: JsonValue | null
    voiceUrl: string | null
    smsUrl: string | null
    status: $Enums.PhoneNumberStatus
    purchasedAt: Date
    releasedAt: Date | null
    releaseReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: PhoneNumberCountAggregateOutputType | null
    _min: PhoneNumberMinAggregateOutputType | null
    _max: PhoneNumberMaxAggregateOutputType | null
  }

  type GetPhoneNumberGroupByPayload<T extends PhoneNumberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PhoneNumberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PhoneNumberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PhoneNumberGroupByOutputType[P]>
            : GetScalarType<T[P], PhoneNumberGroupByOutputType[P]>
        }
      >
    >


  export type PhoneNumberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    number?: boolean
    customerId?: boolean
    billingAddress?: boolean
    voiceUrl?: boolean
    smsUrl?: boolean
    status?: boolean
    purchasedAt?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    portingRequests?: boolean | PhoneNumber$portingRequestsArgs<ExtArgs>
    _count?: boolean | PhoneNumberCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["phoneNumber"]>

  export type PhoneNumberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    number?: boolean
    customerId?: boolean
    billingAddress?: boolean
    voiceUrl?: boolean
    smsUrl?: boolean
    status?: boolean
    purchasedAt?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["phoneNumber"]>

  export type PhoneNumberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    number?: boolean
    customerId?: boolean
    billingAddress?: boolean
    voiceUrl?: boolean
    smsUrl?: boolean
    status?: boolean
    purchasedAt?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["phoneNumber"]>

  export type PhoneNumberSelectScalar = {
    id?: boolean
    number?: boolean
    customerId?: boolean
    billingAddress?: boolean
    voiceUrl?: boolean
    smsUrl?: boolean
    status?: boolean
    purchasedAt?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PhoneNumberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "number" | "customerId" | "billingAddress" | "voiceUrl" | "smsUrl" | "status" | "purchasedAt" | "releasedAt" | "releaseReason" | "createdAt" | "updatedAt", ExtArgs["result"]["phoneNumber"]>
  export type PhoneNumberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    portingRequests?: boolean | PhoneNumber$portingRequestsArgs<ExtArgs>
    _count?: boolean | PhoneNumberCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PhoneNumberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PhoneNumberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PhoneNumberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PhoneNumber"
    objects: {
      portingRequests: Prisma.$PortingRequestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      number: string
      customerId: string
      billingAddress: Prisma.JsonValue | null
      voiceUrl: string | null
      smsUrl: string | null
      status: $Enums.PhoneNumberStatus
      purchasedAt: Date
      releasedAt: Date | null
      releaseReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["phoneNumber"]>
    composites: {}
  }

  type PhoneNumberGetPayload<S extends boolean | null | undefined | PhoneNumberDefaultArgs> = $Result.GetResult<Prisma.$PhoneNumberPayload, S>

  type PhoneNumberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PhoneNumberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PhoneNumberCountAggregateInputType | true
    }

  export interface PhoneNumberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PhoneNumber'], meta: { name: 'PhoneNumber' } }
    /**
     * Find zero or one PhoneNumber that matches the filter.
     * @param {PhoneNumberFindUniqueArgs} args - Arguments to find a PhoneNumber
     * @example
     * // Get one PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PhoneNumberFindUniqueArgs>(args: SelectSubset<T, PhoneNumberFindUniqueArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PhoneNumber that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PhoneNumberFindUniqueOrThrowArgs} args - Arguments to find a PhoneNumber
     * @example
     * // Get one PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PhoneNumberFindUniqueOrThrowArgs>(args: SelectSubset<T, PhoneNumberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PhoneNumber that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberFindFirstArgs} args - Arguments to find a PhoneNumber
     * @example
     * // Get one PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PhoneNumberFindFirstArgs>(args?: SelectSubset<T, PhoneNumberFindFirstArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PhoneNumber that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberFindFirstOrThrowArgs} args - Arguments to find a PhoneNumber
     * @example
     * // Get one PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PhoneNumberFindFirstOrThrowArgs>(args?: SelectSubset<T, PhoneNumberFindFirstOrThrowArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PhoneNumbers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PhoneNumbers
     * const phoneNumbers = await prisma.phoneNumber.findMany()
     * 
     * // Get first 10 PhoneNumbers
     * const phoneNumbers = await prisma.phoneNumber.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const phoneNumberWithIdOnly = await prisma.phoneNumber.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PhoneNumberFindManyArgs>(args?: SelectSubset<T, PhoneNumberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PhoneNumber.
     * @param {PhoneNumberCreateArgs} args - Arguments to create a PhoneNumber.
     * @example
     * // Create one PhoneNumber
     * const PhoneNumber = await prisma.phoneNumber.create({
     *   data: {
     *     // ... data to create a PhoneNumber
     *   }
     * })
     * 
     */
    create<T extends PhoneNumberCreateArgs>(args: SelectSubset<T, PhoneNumberCreateArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PhoneNumbers.
     * @param {PhoneNumberCreateManyArgs} args - Arguments to create many PhoneNumbers.
     * @example
     * // Create many PhoneNumbers
     * const phoneNumber = await prisma.phoneNumber.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PhoneNumberCreateManyArgs>(args?: SelectSubset<T, PhoneNumberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PhoneNumbers and returns the data saved in the database.
     * @param {PhoneNumberCreateManyAndReturnArgs} args - Arguments to create many PhoneNumbers.
     * @example
     * // Create many PhoneNumbers
     * const phoneNumber = await prisma.phoneNumber.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PhoneNumbers and only return the `id`
     * const phoneNumberWithIdOnly = await prisma.phoneNumber.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PhoneNumberCreateManyAndReturnArgs>(args?: SelectSubset<T, PhoneNumberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PhoneNumber.
     * @param {PhoneNumberDeleteArgs} args - Arguments to delete one PhoneNumber.
     * @example
     * // Delete one PhoneNumber
     * const PhoneNumber = await prisma.phoneNumber.delete({
     *   where: {
     *     // ... filter to delete one PhoneNumber
     *   }
     * })
     * 
     */
    delete<T extends PhoneNumberDeleteArgs>(args: SelectSubset<T, PhoneNumberDeleteArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PhoneNumber.
     * @param {PhoneNumberUpdateArgs} args - Arguments to update one PhoneNumber.
     * @example
     * // Update one PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PhoneNumberUpdateArgs>(args: SelectSubset<T, PhoneNumberUpdateArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PhoneNumbers.
     * @param {PhoneNumberDeleteManyArgs} args - Arguments to filter PhoneNumbers to delete.
     * @example
     * // Delete a few PhoneNumbers
     * const { count } = await prisma.phoneNumber.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PhoneNumberDeleteManyArgs>(args?: SelectSubset<T, PhoneNumberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PhoneNumbers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PhoneNumbers
     * const phoneNumber = await prisma.phoneNumber.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PhoneNumberUpdateManyArgs>(args: SelectSubset<T, PhoneNumberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PhoneNumbers and returns the data updated in the database.
     * @param {PhoneNumberUpdateManyAndReturnArgs} args - Arguments to update many PhoneNumbers.
     * @example
     * // Update many PhoneNumbers
     * const phoneNumber = await prisma.phoneNumber.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PhoneNumbers and only return the `id`
     * const phoneNumberWithIdOnly = await prisma.phoneNumber.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PhoneNumberUpdateManyAndReturnArgs>(args: SelectSubset<T, PhoneNumberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PhoneNumber.
     * @param {PhoneNumberUpsertArgs} args - Arguments to update or create a PhoneNumber.
     * @example
     * // Update or create a PhoneNumber
     * const phoneNumber = await prisma.phoneNumber.upsert({
     *   create: {
     *     // ... data to create a PhoneNumber
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PhoneNumber we want to update
     *   }
     * })
     */
    upsert<T extends PhoneNumberUpsertArgs>(args: SelectSubset<T, PhoneNumberUpsertArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PhoneNumbers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberCountArgs} args - Arguments to filter PhoneNumbers to count.
     * @example
     * // Count the number of PhoneNumbers
     * const count = await prisma.phoneNumber.count({
     *   where: {
     *     // ... the filter for the PhoneNumbers we want to count
     *   }
     * })
    **/
    count<T extends PhoneNumberCountArgs>(
      args?: Subset<T, PhoneNumberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PhoneNumberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PhoneNumber.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PhoneNumberAggregateArgs>(args: Subset<T, PhoneNumberAggregateArgs>): Prisma.PrismaPromise<GetPhoneNumberAggregateType<T>>

    /**
     * Group by PhoneNumber.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PhoneNumberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PhoneNumberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PhoneNumberGroupByArgs['orderBy'] }
        : { orderBy?: PhoneNumberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PhoneNumberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPhoneNumberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PhoneNumber model
   */
  readonly fields: PhoneNumberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PhoneNumber.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PhoneNumberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    portingRequests<T extends PhoneNumber$portingRequestsArgs<ExtArgs> = {}>(args?: Subset<T, PhoneNumber$portingRequestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PhoneNumber model
   */
  interface PhoneNumberFieldRefs {
    readonly id: FieldRef<"PhoneNumber", 'String'>
    readonly number: FieldRef<"PhoneNumber", 'String'>
    readonly customerId: FieldRef<"PhoneNumber", 'String'>
    readonly billingAddress: FieldRef<"PhoneNumber", 'Json'>
    readonly voiceUrl: FieldRef<"PhoneNumber", 'String'>
    readonly smsUrl: FieldRef<"PhoneNumber", 'String'>
    readonly status: FieldRef<"PhoneNumber", 'PhoneNumberStatus'>
    readonly purchasedAt: FieldRef<"PhoneNumber", 'DateTime'>
    readonly releasedAt: FieldRef<"PhoneNumber", 'DateTime'>
    readonly releaseReason: FieldRef<"PhoneNumber", 'String'>
    readonly createdAt: FieldRef<"PhoneNumber", 'DateTime'>
    readonly updatedAt: FieldRef<"PhoneNumber", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PhoneNumber findUnique
   */
  export type PhoneNumberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter, which PhoneNumber to fetch.
     */
    where: PhoneNumberWhereUniqueInput
  }

  /**
   * PhoneNumber findUniqueOrThrow
   */
  export type PhoneNumberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter, which PhoneNumber to fetch.
     */
    where: PhoneNumberWhereUniqueInput
  }

  /**
   * PhoneNumber findFirst
   */
  export type PhoneNumberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter, which PhoneNumber to fetch.
     */
    where?: PhoneNumberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PhoneNumbers to fetch.
     */
    orderBy?: PhoneNumberOrderByWithRelationInput | PhoneNumberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PhoneNumbers.
     */
    cursor?: PhoneNumberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PhoneNumbers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PhoneNumbers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PhoneNumbers.
     */
    distinct?: PhoneNumberScalarFieldEnum | PhoneNumberScalarFieldEnum[]
  }

  /**
   * PhoneNumber findFirstOrThrow
   */
  export type PhoneNumberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter, which PhoneNumber to fetch.
     */
    where?: PhoneNumberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PhoneNumbers to fetch.
     */
    orderBy?: PhoneNumberOrderByWithRelationInput | PhoneNumberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PhoneNumbers.
     */
    cursor?: PhoneNumberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PhoneNumbers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PhoneNumbers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PhoneNumbers.
     */
    distinct?: PhoneNumberScalarFieldEnum | PhoneNumberScalarFieldEnum[]
  }

  /**
   * PhoneNumber findMany
   */
  export type PhoneNumberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter, which PhoneNumbers to fetch.
     */
    where?: PhoneNumberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PhoneNumbers to fetch.
     */
    orderBy?: PhoneNumberOrderByWithRelationInput | PhoneNumberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PhoneNumbers.
     */
    cursor?: PhoneNumberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PhoneNumbers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PhoneNumbers.
     */
    skip?: number
    distinct?: PhoneNumberScalarFieldEnum | PhoneNumberScalarFieldEnum[]
  }

  /**
   * PhoneNumber create
   */
  export type PhoneNumberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * The data needed to create a PhoneNumber.
     */
    data: XOR<PhoneNumberCreateInput, PhoneNumberUncheckedCreateInput>
  }

  /**
   * PhoneNumber createMany
   */
  export type PhoneNumberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PhoneNumbers.
     */
    data: PhoneNumberCreateManyInput | PhoneNumberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PhoneNumber createManyAndReturn
   */
  export type PhoneNumberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * The data used to create many PhoneNumbers.
     */
    data: PhoneNumberCreateManyInput | PhoneNumberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PhoneNumber update
   */
  export type PhoneNumberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * The data needed to update a PhoneNumber.
     */
    data: XOR<PhoneNumberUpdateInput, PhoneNumberUncheckedUpdateInput>
    /**
     * Choose, which PhoneNumber to update.
     */
    where: PhoneNumberWhereUniqueInput
  }

  /**
   * PhoneNumber updateMany
   */
  export type PhoneNumberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PhoneNumbers.
     */
    data: XOR<PhoneNumberUpdateManyMutationInput, PhoneNumberUncheckedUpdateManyInput>
    /**
     * Filter which PhoneNumbers to update
     */
    where?: PhoneNumberWhereInput
    /**
     * Limit how many PhoneNumbers to update.
     */
    limit?: number
  }

  /**
   * PhoneNumber updateManyAndReturn
   */
  export type PhoneNumberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * The data used to update PhoneNumbers.
     */
    data: XOR<PhoneNumberUpdateManyMutationInput, PhoneNumberUncheckedUpdateManyInput>
    /**
     * Filter which PhoneNumbers to update
     */
    where?: PhoneNumberWhereInput
    /**
     * Limit how many PhoneNumbers to update.
     */
    limit?: number
  }

  /**
   * PhoneNumber upsert
   */
  export type PhoneNumberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * The filter to search for the PhoneNumber to update in case it exists.
     */
    where: PhoneNumberWhereUniqueInput
    /**
     * In case the PhoneNumber found by the `where` argument doesn't exist, create a new PhoneNumber with this data.
     */
    create: XOR<PhoneNumberCreateInput, PhoneNumberUncheckedCreateInput>
    /**
     * In case the PhoneNumber was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PhoneNumberUpdateInput, PhoneNumberUncheckedUpdateInput>
  }

  /**
   * PhoneNumber delete
   */
  export type PhoneNumberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    /**
     * Filter which PhoneNumber to delete.
     */
    where: PhoneNumberWhereUniqueInput
  }

  /**
   * PhoneNumber deleteMany
   */
  export type PhoneNumberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PhoneNumbers to delete
     */
    where?: PhoneNumberWhereInput
    /**
     * Limit how many PhoneNumbers to delete.
     */
    limit?: number
  }

  /**
   * PhoneNumber.portingRequests
   */
  export type PhoneNumber$portingRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    where?: PortingRequestWhereInput
    orderBy?: PortingRequestOrderByWithRelationInput | PortingRequestOrderByWithRelationInput[]
    cursor?: PortingRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PortingRequestScalarFieldEnum | PortingRequestScalarFieldEnum[]
  }

  /**
   * PhoneNumber without action
   */
  export type PhoneNumberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
  }


  /**
   * Model PortingRequest
   */

  export type AggregatePortingRequest = {
    _count: PortingRequestCountAggregateOutputType | null
    _min: PortingRequestMinAggregateOutputType | null
    _max: PortingRequestMaxAggregateOutputType | null
  }

  export type PortingRequestMinAggregateOutputType = {
    id: string | null
    currentNumber: string | null
    currentCarrier: string | null
    accountNumber: string | null
    pin: string | null
    customerId: string | null
    authorizedUser: string | null
    status: $Enums.PortingStatus | null
    estimatedCompletion: Date | null
    notes: string | null
    rejectionReason: string | null
    completedAt: Date | null
    rejectedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortingRequestMaxAggregateOutputType = {
    id: string | null
    currentNumber: string | null
    currentCarrier: string | null
    accountNumber: string | null
    pin: string | null
    customerId: string | null
    authorizedUser: string | null
    status: $Enums.PortingStatus | null
    estimatedCompletion: Date | null
    notes: string | null
    rejectionReason: string | null
    completedAt: Date | null
    rejectedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PortingRequestCountAggregateOutputType = {
    id: number
    currentNumber: number
    currentCarrier: number
    accountNumber: number
    pin: number
    customerId: number
    billingAddress: number
    authorizedUser: number
    serviceAddress: number
    status: number
    estimatedCompletion: number
    notes: number
    rejectionReason: number
    completedAt: number
    rejectedAt: number
    cancelledAt: number
    cancellationReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PortingRequestMinAggregateInputType = {
    id?: true
    currentNumber?: true
    currentCarrier?: true
    accountNumber?: true
    pin?: true
    customerId?: true
    authorizedUser?: true
    status?: true
    estimatedCompletion?: true
    notes?: true
    rejectionReason?: true
    completedAt?: true
    rejectedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortingRequestMaxAggregateInputType = {
    id?: true
    currentNumber?: true
    currentCarrier?: true
    accountNumber?: true
    pin?: true
    customerId?: true
    authorizedUser?: true
    status?: true
    estimatedCompletion?: true
    notes?: true
    rejectionReason?: true
    completedAt?: true
    rejectedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PortingRequestCountAggregateInputType = {
    id?: true
    currentNumber?: true
    currentCarrier?: true
    accountNumber?: true
    pin?: true
    customerId?: true
    billingAddress?: true
    authorizedUser?: true
    serviceAddress?: true
    status?: true
    estimatedCompletion?: true
    notes?: true
    rejectionReason?: true
    completedAt?: true
    rejectedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PortingRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortingRequest to aggregate.
     */
    where?: PortingRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortingRequests to fetch.
     */
    orderBy?: PortingRequestOrderByWithRelationInput | PortingRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortingRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortingRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortingRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PortingRequests
    **/
    _count?: true | PortingRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortingRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortingRequestMaxAggregateInputType
  }

  export type GetPortingRequestAggregateType<T extends PortingRequestAggregateArgs> = {
        [P in keyof T & keyof AggregatePortingRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortingRequest[P]>
      : GetScalarType<T[P], AggregatePortingRequest[P]>
  }




  export type PortingRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortingRequestWhereInput
    orderBy?: PortingRequestOrderByWithAggregationInput | PortingRequestOrderByWithAggregationInput[]
    by: PortingRequestScalarFieldEnum[] | PortingRequestScalarFieldEnum
    having?: PortingRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortingRequestCountAggregateInputType | true
    _min?: PortingRequestMinAggregateInputType
    _max?: PortingRequestMaxAggregateInputType
  }

  export type PortingRequestGroupByOutputType = {
    id: string
    currentNumber: string
    currentCarrier: string
    accountNumber: string
    pin: string | null
    customerId: string
    billingAddress: JsonValue | null
    authorizedUser: string | null
    serviceAddress: JsonValue | null
    status: $Enums.PortingStatus
    estimatedCompletion: Date | null
    notes: string | null
    rejectionReason: string | null
    completedAt: Date | null
    rejectedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: PortingRequestCountAggregateOutputType | null
    _min: PortingRequestMinAggregateOutputType | null
    _max: PortingRequestMaxAggregateOutputType | null
  }

  type GetPortingRequestGroupByPayload<T extends PortingRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortingRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortingRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortingRequestGroupByOutputType[P]>
            : GetScalarType<T[P], PortingRequestGroupByOutputType[P]>
        }
      >
    >


  export type PortingRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    currentNumber?: boolean
    currentCarrier?: boolean
    accountNumber?: boolean
    pin?: boolean
    customerId?: boolean
    billingAddress?: boolean
    authorizedUser?: boolean
    serviceAddress?: boolean
    status?: boolean
    estimatedCompletion?: boolean
    notes?: boolean
    rejectionReason?: boolean
    completedAt?: boolean
    rejectedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }, ExtArgs["result"]["portingRequest"]>

  export type PortingRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    currentNumber?: boolean
    currentCarrier?: boolean
    accountNumber?: boolean
    pin?: boolean
    customerId?: boolean
    billingAddress?: boolean
    authorizedUser?: boolean
    serviceAddress?: boolean
    status?: boolean
    estimatedCompletion?: boolean
    notes?: boolean
    rejectionReason?: boolean
    completedAt?: boolean
    rejectedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }, ExtArgs["result"]["portingRequest"]>

  export type PortingRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    currentNumber?: boolean
    currentCarrier?: boolean
    accountNumber?: boolean
    pin?: boolean
    customerId?: boolean
    billingAddress?: boolean
    authorizedUser?: boolean
    serviceAddress?: boolean
    status?: boolean
    estimatedCompletion?: boolean
    notes?: boolean
    rejectionReason?: boolean
    completedAt?: boolean
    rejectedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }, ExtArgs["result"]["portingRequest"]>

  export type PortingRequestSelectScalar = {
    id?: boolean
    currentNumber?: boolean
    currentCarrier?: boolean
    accountNumber?: boolean
    pin?: boolean
    customerId?: boolean
    billingAddress?: boolean
    authorizedUser?: boolean
    serviceAddress?: boolean
    status?: boolean
    estimatedCompletion?: boolean
    notes?: boolean
    rejectionReason?: boolean
    completedAt?: boolean
    rejectedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PortingRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "currentNumber" | "currentCarrier" | "accountNumber" | "pin" | "customerId" | "billingAddress" | "authorizedUser" | "serviceAddress" | "status" | "estimatedCompletion" | "notes" | "rejectionReason" | "completedAt" | "rejectedAt" | "cancelledAt" | "cancellationReason" | "createdAt" | "updatedAt", ExtArgs["result"]["portingRequest"]>
  export type PortingRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }
  export type PortingRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }
  export type PortingRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    phoneNumber?: boolean | PortingRequest$phoneNumberArgs<ExtArgs>
  }

  export type $PortingRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PortingRequest"
    objects: {
      phoneNumber: Prisma.$PhoneNumberPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      currentNumber: string
      currentCarrier: string
      accountNumber: string
      pin: string | null
      customerId: string
      billingAddress: Prisma.JsonValue | null
      authorizedUser: string | null
      serviceAddress: Prisma.JsonValue | null
      status: $Enums.PortingStatus
      estimatedCompletion: Date | null
      notes: string | null
      rejectionReason: string | null
      completedAt: Date | null
      rejectedAt: Date | null
      cancelledAt: Date | null
      cancellationReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["portingRequest"]>
    composites: {}
  }

  type PortingRequestGetPayload<S extends boolean | null | undefined | PortingRequestDefaultArgs> = $Result.GetResult<Prisma.$PortingRequestPayload, S>

  type PortingRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortingRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortingRequestCountAggregateInputType | true
    }

  export interface PortingRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PortingRequest'], meta: { name: 'PortingRequest' } }
    /**
     * Find zero or one PortingRequest that matches the filter.
     * @param {PortingRequestFindUniqueArgs} args - Arguments to find a PortingRequest
     * @example
     * // Get one PortingRequest
     * const portingRequest = await prisma.portingRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortingRequestFindUniqueArgs>(args: SelectSubset<T, PortingRequestFindUniqueArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PortingRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortingRequestFindUniqueOrThrowArgs} args - Arguments to find a PortingRequest
     * @example
     * // Get one PortingRequest
     * const portingRequest = await prisma.portingRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortingRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, PortingRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortingRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestFindFirstArgs} args - Arguments to find a PortingRequest
     * @example
     * // Get one PortingRequest
     * const portingRequest = await prisma.portingRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortingRequestFindFirstArgs>(args?: SelectSubset<T, PortingRequestFindFirstArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortingRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestFindFirstOrThrowArgs} args - Arguments to find a PortingRequest
     * @example
     * // Get one PortingRequest
     * const portingRequest = await prisma.portingRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortingRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, PortingRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PortingRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PortingRequests
     * const portingRequests = await prisma.portingRequest.findMany()
     * 
     * // Get first 10 PortingRequests
     * const portingRequests = await prisma.portingRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portingRequestWithIdOnly = await prisma.portingRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortingRequestFindManyArgs>(args?: SelectSubset<T, PortingRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PortingRequest.
     * @param {PortingRequestCreateArgs} args - Arguments to create a PortingRequest.
     * @example
     * // Create one PortingRequest
     * const PortingRequest = await prisma.portingRequest.create({
     *   data: {
     *     // ... data to create a PortingRequest
     *   }
     * })
     * 
     */
    create<T extends PortingRequestCreateArgs>(args: SelectSubset<T, PortingRequestCreateArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PortingRequests.
     * @param {PortingRequestCreateManyArgs} args - Arguments to create many PortingRequests.
     * @example
     * // Create many PortingRequests
     * const portingRequest = await prisma.portingRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortingRequestCreateManyArgs>(args?: SelectSubset<T, PortingRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PortingRequests and returns the data saved in the database.
     * @param {PortingRequestCreateManyAndReturnArgs} args - Arguments to create many PortingRequests.
     * @example
     * // Create many PortingRequests
     * const portingRequest = await prisma.portingRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PortingRequests and only return the `id`
     * const portingRequestWithIdOnly = await prisma.portingRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PortingRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, PortingRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PortingRequest.
     * @param {PortingRequestDeleteArgs} args - Arguments to delete one PortingRequest.
     * @example
     * // Delete one PortingRequest
     * const PortingRequest = await prisma.portingRequest.delete({
     *   where: {
     *     // ... filter to delete one PortingRequest
     *   }
     * })
     * 
     */
    delete<T extends PortingRequestDeleteArgs>(args: SelectSubset<T, PortingRequestDeleteArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PortingRequest.
     * @param {PortingRequestUpdateArgs} args - Arguments to update one PortingRequest.
     * @example
     * // Update one PortingRequest
     * const portingRequest = await prisma.portingRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortingRequestUpdateArgs>(args: SelectSubset<T, PortingRequestUpdateArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PortingRequests.
     * @param {PortingRequestDeleteManyArgs} args - Arguments to filter PortingRequests to delete.
     * @example
     * // Delete a few PortingRequests
     * const { count } = await prisma.portingRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortingRequestDeleteManyArgs>(args?: SelectSubset<T, PortingRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortingRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PortingRequests
     * const portingRequest = await prisma.portingRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortingRequestUpdateManyArgs>(args: SelectSubset<T, PortingRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortingRequests and returns the data updated in the database.
     * @param {PortingRequestUpdateManyAndReturnArgs} args - Arguments to update many PortingRequests.
     * @example
     * // Update many PortingRequests
     * const portingRequest = await prisma.portingRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PortingRequests and only return the `id`
     * const portingRequestWithIdOnly = await prisma.portingRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PortingRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, PortingRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PortingRequest.
     * @param {PortingRequestUpsertArgs} args - Arguments to update or create a PortingRequest.
     * @example
     * // Update or create a PortingRequest
     * const portingRequest = await prisma.portingRequest.upsert({
     *   create: {
     *     // ... data to create a PortingRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PortingRequest we want to update
     *   }
     * })
     */
    upsert<T extends PortingRequestUpsertArgs>(args: SelectSubset<T, PortingRequestUpsertArgs<ExtArgs>>): Prisma__PortingRequestClient<$Result.GetResult<Prisma.$PortingRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PortingRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestCountArgs} args - Arguments to filter PortingRequests to count.
     * @example
     * // Count the number of PortingRequests
     * const count = await prisma.portingRequest.count({
     *   where: {
     *     // ... the filter for the PortingRequests we want to count
     *   }
     * })
    **/
    count<T extends PortingRequestCountArgs>(
      args?: Subset<T, PortingRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortingRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PortingRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortingRequestAggregateArgs>(args: Subset<T, PortingRequestAggregateArgs>): Prisma.PrismaPromise<GetPortingRequestAggregateType<T>>

    /**
     * Group by PortingRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortingRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortingRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortingRequestGroupByArgs['orderBy'] }
        : { orderBy?: PortingRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortingRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortingRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PortingRequest model
   */
  readonly fields: PortingRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PortingRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortingRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    phoneNumber<T extends PortingRequest$phoneNumberArgs<ExtArgs> = {}>(args?: Subset<T, PortingRequest$phoneNumberArgs<ExtArgs>>): Prisma__PhoneNumberClient<$Result.GetResult<Prisma.$PhoneNumberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PortingRequest model
   */
  interface PortingRequestFieldRefs {
    readonly id: FieldRef<"PortingRequest", 'String'>
    readonly currentNumber: FieldRef<"PortingRequest", 'String'>
    readonly currentCarrier: FieldRef<"PortingRequest", 'String'>
    readonly accountNumber: FieldRef<"PortingRequest", 'String'>
    readonly pin: FieldRef<"PortingRequest", 'String'>
    readonly customerId: FieldRef<"PortingRequest", 'String'>
    readonly billingAddress: FieldRef<"PortingRequest", 'Json'>
    readonly authorizedUser: FieldRef<"PortingRequest", 'String'>
    readonly serviceAddress: FieldRef<"PortingRequest", 'Json'>
    readonly status: FieldRef<"PortingRequest", 'PortingStatus'>
    readonly estimatedCompletion: FieldRef<"PortingRequest", 'DateTime'>
    readonly notes: FieldRef<"PortingRequest", 'String'>
    readonly rejectionReason: FieldRef<"PortingRequest", 'String'>
    readonly completedAt: FieldRef<"PortingRequest", 'DateTime'>
    readonly rejectedAt: FieldRef<"PortingRequest", 'DateTime'>
    readonly cancelledAt: FieldRef<"PortingRequest", 'DateTime'>
    readonly cancellationReason: FieldRef<"PortingRequest", 'String'>
    readonly createdAt: FieldRef<"PortingRequest", 'DateTime'>
    readonly updatedAt: FieldRef<"PortingRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PortingRequest findUnique
   */
  export type PortingRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter, which PortingRequest to fetch.
     */
    where: PortingRequestWhereUniqueInput
  }

  /**
   * PortingRequest findUniqueOrThrow
   */
  export type PortingRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter, which PortingRequest to fetch.
     */
    where: PortingRequestWhereUniqueInput
  }

  /**
   * PortingRequest findFirst
   */
  export type PortingRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter, which PortingRequest to fetch.
     */
    where?: PortingRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortingRequests to fetch.
     */
    orderBy?: PortingRequestOrderByWithRelationInput | PortingRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortingRequests.
     */
    cursor?: PortingRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortingRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortingRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortingRequests.
     */
    distinct?: PortingRequestScalarFieldEnum | PortingRequestScalarFieldEnum[]
  }

  /**
   * PortingRequest findFirstOrThrow
   */
  export type PortingRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter, which PortingRequest to fetch.
     */
    where?: PortingRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortingRequests to fetch.
     */
    orderBy?: PortingRequestOrderByWithRelationInput | PortingRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortingRequests.
     */
    cursor?: PortingRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortingRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortingRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortingRequests.
     */
    distinct?: PortingRequestScalarFieldEnum | PortingRequestScalarFieldEnum[]
  }

  /**
   * PortingRequest findMany
   */
  export type PortingRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter, which PortingRequests to fetch.
     */
    where?: PortingRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortingRequests to fetch.
     */
    orderBy?: PortingRequestOrderByWithRelationInput | PortingRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PortingRequests.
     */
    cursor?: PortingRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortingRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortingRequests.
     */
    skip?: number
    distinct?: PortingRequestScalarFieldEnum | PortingRequestScalarFieldEnum[]
  }

  /**
   * PortingRequest create
   */
  export type PortingRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a PortingRequest.
     */
    data: XOR<PortingRequestCreateInput, PortingRequestUncheckedCreateInput>
  }

  /**
   * PortingRequest createMany
   */
  export type PortingRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PortingRequests.
     */
    data: PortingRequestCreateManyInput | PortingRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PortingRequest createManyAndReturn
   */
  export type PortingRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * The data used to create many PortingRequests.
     */
    data: PortingRequestCreateManyInput | PortingRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PortingRequest update
   */
  export type PortingRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a PortingRequest.
     */
    data: XOR<PortingRequestUpdateInput, PortingRequestUncheckedUpdateInput>
    /**
     * Choose, which PortingRequest to update.
     */
    where: PortingRequestWhereUniqueInput
  }

  /**
   * PortingRequest updateMany
   */
  export type PortingRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PortingRequests.
     */
    data: XOR<PortingRequestUpdateManyMutationInput, PortingRequestUncheckedUpdateManyInput>
    /**
     * Filter which PortingRequests to update
     */
    where?: PortingRequestWhereInput
    /**
     * Limit how many PortingRequests to update.
     */
    limit?: number
  }

  /**
   * PortingRequest updateManyAndReturn
   */
  export type PortingRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * The data used to update PortingRequests.
     */
    data: XOR<PortingRequestUpdateManyMutationInput, PortingRequestUncheckedUpdateManyInput>
    /**
     * Filter which PortingRequests to update
     */
    where?: PortingRequestWhereInput
    /**
     * Limit how many PortingRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PortingRequest upsert
   */
  export type PortingRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the PortingRequest to update in case it exists.
     */
    where: PortingRequestWhereUniqueInput
    /**
     * In case the PortingRequest found by the `where` argument doesn't exist, create a new PortingRequest with this data.
     */
    create: XOR<PortingRequestCreateInput, PortingRequestUncheckedCreateInput>
    /**
     * In case the PortingRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortingRequestUpdateInput, PortingRequestUncheckedUpdateInput>
  }

  /**
   * PortingRequest delete
   */
  export type PortingRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
    /**
     * Filter which PortingRequest to delete.
     */
    where: PortingRequestWhereUniqueInput
  }

  /**
   * PortingRequest deleteMany
   */
  export type PortingRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortingRequests to delete
     */
    where?: PortingRequestWhereInput
    /**
     * Limit how many PortingRequests to delete.
     */
    limit?: number
  }

  /**
   * PortingRequest.phoneNumber
   */
  export type PortingRequest$phoneNumberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PhoneNumber
     */
    select?: PhoneNumberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PhoneNumber
     */
    omit?: PhoneNumberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PhoneNumberInclude<ExtArgs> | null
    where?: PhoneNumberWhereInput
  }

  /**
   * PortingRequest without action
   */
  export type PortingRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortingRequest
     */
    select?: PortingRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortingRequest
     */
    omit?: PortingRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PortingRequestInclude<ExtArgs> | null
  }


  /**
   * Model ProvisioningJob
   */

  export type AggregateProvisioningJob = {
    _count: ProvisioningJobCountAggregateOutputType | null
    _avg: ProvisioningJobAvgAggregateOutputType | null
    _sum: ProvisioningJobSumAggregateOutputType | null
    _min: ProvisioningJobMinAggregateOutputType | null
    _max: ProvisioningJobMaxAggregateOutputType | null
  }

  export type ProvisioningJobAvgAggregateOutputType = {
    progress: number | null
  }

  export type ProvisioningJobSumAggregateOutputType = {
    progress: number | null
  }

  export type ProvisioningJobMinAggregateOutputType = {
    id: string | null
    customerId: string | null
    phoneNumber: string | null
    deviceType: string | null
    deviceId: string | null
    priority: $Enums.JobPriority | null
    status: $Enums.JobStatus | null
    progress: number | null
    notes: string | null
    errorMessage: string | null
    completedAt: Date | null
    failedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProvisioningJobMaxAggregateOutputType = {
    id: string | null
    customerId: string | null
    phoneNumber: string | null
    deviceType: string | null
    deviceId: string | null
    priority: $Enums.JobPriority | null
    status: $Enums.JobStatus | null
    progress: number | null
    notes: string | null
    errorMessage: string | null
    completedAt: Date | null
    failedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProvisioningJobCountAggregateOutputType = {
    id: number
    customerId: number
    phoneNumber: number
    deviceType: number
    deviceId: number
    configuration: number
    priority: number
    status: number
    progress: number
    notes: number
    errorMessage: number
    completedAt: number
    failedAt: number
    cancelledAt: number
    cancellationReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProvisioningJobAvgAggregateInputType = {
    progress?: true
  }

  export type ProvisioningJobSumAggregateInputType = {
    progress?: true
  }

  export type ProvisioningJobMinAggregateInputType = {
    id?: true
    customerId?: true
    phoneNumber?: true
    deviceType?: true
    deviceId?: true
    priority?: true
    status?: true
    progress?: true
    notes?: true
    errorMessage?: true
    completedAt?: true
    failedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProvisioningJobMaxAggregateInputType = {
    id?: true
    customerId?: true
    phoneNumber?: true
    deviceType?: true
    deviceId?: true
    priority?: true
    status?: true
    progress?: true
    notes?: true
    errorMessage?: true
    completedAt?: true
    failedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProvisioningJobCountAggregateInputType = {
    id?: true
    customerId?: true
    phoneNumber?: true
    deviceType?: true
    deviceId?: true
    configuration?: true
    priority?: true
    status?: true
    progress?: true
    notes?: true
    errorMessage?: true
    completedAt?: true
    failedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProvisioningJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProvisioningJob to aggregate.
     */
    where?: ProvisioningJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProvisioningJobs to fetch.
     */
    orderBy?: ProvisioningJobOrderByWithRelationInput | ProvisioningJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProvisioningJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProvisioningJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProvisioningJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProvisioningJobs
    **/
    _count?: true | ProvisioningJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProvisioningJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProvisioningJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProvisioningJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProvisioningJobMaxAggregateInputType
  }

  export type GetProvisioningJobAggregateType<T extends ProvisioningJobAggregateArgs> = {
        [P in keyof T & keyof AggregateProvisioningJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProvisioningJob[P]>
      : GetScalarType<T[P], AggregateProvisioningJob[P]>
  }




  export type ProvisioningJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProvisioningJobWhereInput
    orderBy?: ProvisioningJobOrderByWithAggregationInput | ProvisioningJobOrderByWithAggregationInput[]
    by: ProvisioningJobScalarFieldEnum[] | ProvisioningJobScalarFieldEnum
    having?: ProvisioningJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProvisioningJobCountAggregateInputType | true
    _avg?: ProvisioningJobAvgAggregateInputType
    _sum?: ProvisioningJobSumAggregateInputType
    _min?: ProvisioningJobMinAggregateInputType
    _max?: ProvisioningJobMaxAggregateInputType
  }

  export type ProvisioningJobGroupByOutputType = {
    id: string
    customerId: string
    phoneNumber: string
    deviceType: string
    deviceId: string | null
    configuration: JsonValue | null
    priority: $Enums.JobPriority
    status: $Enums.JobStatus
    progress: number
    notes: string | null
    errorMessage: string | null
    completedAt: Date | null
    failedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: ProvisioningJobCountAggregateOutputType | null
    _avg: ProvisioningJobAvgAggregateOutputType | null
    _sum: ProvisioningJobSumAggregateOutputType | null
    _min: ProvisioningJobMinAggregateOutputType | null
    _max: ProvisioningJobMaxAggregateOutputType | null
  }

  type GetProvisioningJobGroupByPayload<T extends ProvisioningJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProvisioningJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProvisioningJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProvisioningJobGroupByOutputType[P]>
            : GetScalarType<T[P], ProvisioningJobGroupByOutputType[P]>
        }
      >
    >


  export type ProvisioningJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    phoneNumber?: boolean
    deviceType?: boolean
    deviceId?: boolean
    configuration?: boolean
    priority?: boolean
    status?: boolean
    progress?: boolean
    notes?: boolean
    errorMessage?: boolean
    completedAt?: boolean
    failedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["provisioningJob"]>

  export type ProvisioningJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    phoneNumber?: boolean
    deviceType?: boolean
    deviceId?: boolean
    configuration?: boolean
    priority?: boolean
    status?: boolean
    progress?: boolean
    notes?: boolean
    errorMessage?: boolean
    completedAt?: boolean
    failedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["provisioningJob"]>

  export type ProvisioningJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    phoneNumber?: boolean
    deviceType?: boolean
    deviceId?: boolean
    configuration?: boolean
    priority?: boolean
    status?: boolean
    progress?: boolean
    notes?: boolean
    errorMessage?: boolean
    completedAt?: boolean
    failedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["provisioningJob"]>

  export type ProvisioningJobSelectScalar = {
    id?: boolean
    customerId?: boolean
    phoneNumber?: boolean
    deviceType?: boolean
    deviceId?: boolean
    configuration?: boolean
    priority?: boolean
    status?: boolean
    progress?: boolean
    notes?: boolean
    errorMessage?: boolean
    completedAt?: boolean
    failedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProvisioningJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customerId" | "phoneNumber" | "deviceType" | "deviceId" | "configuration" | "priority" | "status" | "progress" | "notes" | "errorMessage" | "completedAt" | "failedAt" | "cancelledAt" | "cancellationReason" | "createdAt" | "updatedAt", ExtArgs["result"]["provisioningJob"]>

  export type $ProvisioningJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProvisioningJob"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerId: string
      phoneNumber: string
      deviceType: string
      deviceId: string | null
      configuration: Prisma.JsonValue | null
      priority: $Enums.JobPriority
      status: $Enums.JobStatus
      progress: number
      notes: string | null
      errorMessage: string | null
      completedAt: Date | null
      failedAt: Date | null
      cancelledAt: Date | null
      cancellationReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["provisioningJob"]>
    composites: {}
  }

  type ProvisioningJobGetPayload<S extends boolean | null | undefined | ProvisioningJobDefaultArgs> = $Result.GetResult<Prisma.$ProvisioningJobPayload, S>

  type ProvisioningJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProvisioningJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProvisioningJobCountAggregateInputType | true
    }

  export interface ProvisioningJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProvisioningJob'], meta: { name: 'ProvisioningJob' } }
    /**
     * Find zero or one ProvisioningJob that matches the filter.
     * @param {ProvisioningJobFindUniqueArgs} args - Arguments to find a ProvisioningJob
     * @example
     * // Get one ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProvisioningJobFindUniqueArgs>(args: SelectSubset<T, ProvisioningJobFindUniqueArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProvisioningJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProvisioningJobFindUniqueOrThrowArgs} args - Arguments to find a ProvisioningJob
     * @example
     * // Get one ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProvisioningJobFindUniqueOrThrowArgs>(args: SelectSubset<T, ProvisioningJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProvisioningJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobFindFirstArgs} args - Arguments to find a ProvisioningJob
     * @example
     * // Get one ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProvisioningJobFindFirstArgs>(args?: SelectSubset<T, ProvisioningJobFindFirstArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProvisioningJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobFindFirstOrThrowArgs} args - Arguments to find a ProvisioningJob
     * @example
     * // Get one ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProvisioningJobFindFirstOrThrowArgs>(args?: SelectSubset<T, ProvisioningJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProvisioningJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProvisioningJobs
     * const provisioningJobs = await prisma.provisioningJob.findMany()
     * 
     * // Get first 10 ProvisioningJobs
     * const provisioningJobs = await prisma.provisioningJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const provisioningJobWithIdOnly = await prisma.provisioningJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProvisioningJobFindManyArgs>(args?: SelectSubset<T, ProvisioningJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProvisioningJob.
     * @param {ProvisioningJobCreateArgs} args - Arguments to create a ProvisioningJob.
     * @example
     * // Create one ProvisioningJob
     * const ProvisioningJob = await prisma.provisioningJob.create({
     *   data: {
     *     // ... data to create a ProvisioningJob
     *   }
     * })
     * 
     */
    create<T extends ProvisioningJobCreateArgs>(args: SelectSubset<T, ProvisioningJobCreateArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProvisioningJobs.
     * @param {ProvisioningJobCreateManyArgs} args - Arguments to create many ProvisioningJobs.
     * @example
     * // Create many ProvisioningJobs
     * const provisioningJob = await prisma.provisioningJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProvisioningJobCreateManyArgs>(args?: SelectSubset<T, ProvisioningJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProvisioningJobs and returns the data saved in the database.
     * @param {ProvisioningJobCreateManyAndReturnArgs} args - Arguments to create many ProvisioningJobs.
     * @example
     * // Create many ProvisioningJobs
     * const provisioningJob = await prisma.provisioningJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProvisioningJobs and only return the `id`
     * const provisioningJobWithIdOnly = await prisma.provisioningJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProvisioningJobCreateManyAndReturnArgs>(args?: SelectSubset<T, ProvisioningJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProvisioningJob.
     * @param {ProvisioningJobDeleteArgs} args - Arguments to delete one ProvisioningJob.
     * @example
     * // Delete one ProvisioningJob
     * const ProvisioningJob = await prisma.provisioningJob.delete({
     *   where: {
     *     // ... filter to delete one ProvisioningJob
     *   }
     * })
     * 
     */
    delete<T extends ProvisioningJobDeleteArgs>(args: SelectSubset<T, ProvisioningJobDeleteArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProvisioningJob.
     * @param {ProvisioningJobUpdateArgs} args - Arguments to update one ProvisioningJob.
     * @example
     * // Update one ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProvisioningJobUpdateArgs>(args: SelectSubset<T, ProvisioningJobUpdateArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProvisioningJobs.
     * @param {ProvisioningJobDeleteManyArgs} args - Arguments to filter ProvisioningJobs to delete.
     * @example
     * // Delete a few ProvisioningJobs
     * const { count } = await prisma.provisioningJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProvisioningJobDeleteManyArgs>(args?: SelectSubset<T, ProvisioningJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProvisioningJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProvisioningJobs
     * const provisioningJob = await prisma.provisioningJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProvisioningJobUpdateManyArgs>(args: SelectSubset<T, ProvisioningJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProvisioningJobs and returns the data updated in the database.
     * @param {ProvisioningJobUpdateManyAndReturnArgs} args - Arguments to update many ProvisioningJobs.
     * @example
     * // Update many ProvisioningJobs
     * const provisioningJob = await prisma.provisioningJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProvisioningJobs and only return the `id`
     * const provisioningJobWithIdOnly = await prisma.provisioningJob.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProvisioningJobUpdateManyAndReturnArgs>(args: SelectSubset<T, ProvisioningJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProvisioningJob.
     * @param {ProvisioningJobUpsertArgs} args - Arguments to update or create a ProvisioningJob.
     * @example
     * // Update or create a ProvisioningJob
     * const provisioningJob = await prisma.provisioningJob.upsert({
     *   create: {
     *     // ... data to create a ProvisioningJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProvisioningJob we want to update
     *   }
     * })
     */
    upsert<T extends ProvisioningJobUpsertArgs>(args: SelectSubset<T, ProvisioningJobUpsertArgs<ExtArgs>>): Prisma__ProvisioningJobClient<$Result.GetResult<Prisma.$ProvisioningJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProvisioningJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobCountArgs} args - Arguments to filter ProvisioningJobs to count.
     * @example
     * // Count the number of ProvisioningJobs
     * const count = await prisma.provisioningJob.count({
     *   where: {
     *     // ... the filter for the ProvisioningJobs we want to count
     *   }
     * })
    **/
    count<T extends ProvisioningJobCountArgs>(
      args?: Subset<T, ProvisioningJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProvisioningJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProvisioningJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProvisioningJobAggregateArgs>(args: Subset<T, ProvisioningJobAggregateArgs>): Prisma.PrismaPromise<GetProvisioningJobAggregateType<T>>

    /**
     * Group by ProvisioningJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvisioningJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProvisioningJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProvisioningJobGroupByArgs['orderBy'] }
        : { orderBy?: ProvisioningJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProvisioningJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProvisioningJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProvisioningJob model
   */
  readonly fields: ProvisioningJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProvisioningJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProvisioningJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProvisioningJob model
   */
  interface ProvisioningJobFieldRefs {
    readonly id: FieldRef<"ProvisioningJob", 'String'>
    readonly customerId: FieldRef<"ProvisioningJob", 'String'>
    readonly phoneNumber: FieldRef<"ProvisioningJob", 'String'>
    readonly deviceType: FieldRef<"ProvisioningJob", 'String'>
    readonly deviceId: FieldRef<"ProvisioningJob", 'String'>
    readonly configuration: FieldRef<"ProvisioningJob", 'Json'>
    readonly priority: FieldRef<"ProvisioningJob", 'JobPriority'>
    readonly status: FieldRef<"ProvisioningJob", 'JobStatus'>
    readonly progress: FieldRef<"ProvisioningJob", 'Int'>
    readonly notes: FieldRef<"ProvisioningJob", 'String'>
    readonly errorMessage: FieldRef<"ProvisioningJob", 'String'>
    readonly completedAt: FieldRef<"ProvisioningJob", 'DateTime'>
    readonly failedAt: FieldRef<"ProvisioningJob", 'DateTime'>
    readonly cancelledAt: FieldRef<"ProvisioningJob", 'DateTime'>
    readonly cancellationReason: FieldRef<"ProvisioningJob", 'String'>
    readonly createdAt: FieldRef<"ProvisioningJob", 'DateTime'>
    readonly updatedAt: FieldRef<"ProvisioningJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProvisioningJob findUnique
   */
  export type ProvisioningJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter, which ProvisioningJob to fetch.
     */
    where: ProvisioningJobWhereUniqueInput
  }

  /**
   * ProvisioningJob findUniqueOrThrow
   */
  export type ProvisioningJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter, which ProvisioningJob to fetch.
     */
    where: ProvisioningJobWhereUniqueInput
  }

  /**
   * ProvisioningJob findFirst
   */
  export type ProvisioningJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter, which ProvisioningJob to fetch.
     */
    where?: ProvisioningJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProvisioningJobs to fetch.
     */
    orderBy?: ProvisioningJobOrderByWithRelationInput | ProvisioningJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProvisioningJobs.
     */
    cursor?: ProvisioningJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProvisioningJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProvisioningJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProvisioningJobs.
     */
    distinct?: ProvisioningJobScalarFieldEnum | ProvisioningJobScalarFieldEnum[]
  }

  /**
   * ProvisioningJob findFirstOrThrow
   */
  export type ProvisioningJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter, which ProvisioningJob to fetch.
     */
    where?: ProvisioningJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProvisioningJobs to fetch.
     */
    orderBy?: ProvisioningJobOrderByWithRelationInput | ProvisioningJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProvisioningJobs.
     */
    cursor?: ProvisioningJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProvisioningJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProvisioningJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProvisioningJobs.
     */
    distinct?: ProvisioningJobScalarFieldEnum | ProvisioningJobScalarFieldEnum[]
  }

  /**
   * ProvisioningJob findMany
   */
  export type ProvisioningJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter, which ProvisioningJobs to fetch.
     */
    where?: ProvisioningJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProvisioningJobs to fetch.
     */
    orderBy?: ProvisioningJobOrderByWithRelationInput | ProvisioningJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProvisioningJobs.
     */
    cursor?: ProvisioningJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProvisioningJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProvisioningJobs.
     */
    skip?: number
    distinct?: ProvisioningJobScalarFieldEnum | ProvisioningJobScalarFieldEnum[]
  }

  /**
   * ProvisioningJob create
   */
  export type ProvisioningJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * The data needed to create a ProvisioningJob.
     */
    data: XOR<ProvisioningJobCreateInput, ProvisioningJobUncheckedCreateInput>
  }

  /**
   * ProvisioningJob createMany
   */
  export type ProvisioningJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProvisioningJobs.
     */
    data: ProvisioningJobCreateManyInput | ProvisioningJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProvisioningJob createManyAndReturn
   */
  export type ProvisioningJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * The data used to create many ProvisioningJobs.
     */
    data: ProvisioningJobCreateManyInput | ProvisioningJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProvisioningJob update
   */
  export type ProvisioningJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * The data needed to update a ProvisioningJob.
     */
    data: XOR<ProvisioningJobUpdateInput, ProvisioningJobUncheckedUpdateInput>
    /**
     * Choose, which ProvisioningJob to update.
     */
    where: ProvisioningJobWhereUniqueInput
  }

  /**
   * ProvisioningJob updateMany
   */
  export type ProvisioningJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProvisioningJobs.
     */
    data: XOR<ProvisioningJobUpdateManyMutationInput, ProvisioningJobUncheckedUpdateManyInput>
    /**
     * Filter which ProvisioningJobs to update
     */
    where?: ProvisioningJobWhereInput
    /**
     * Limit how many ProvisioningJobs to update.
     */
    limit?: number
  }

  /**
   * ProvisioningJob updateManyAndReturn
   */
  export type ProvisioningJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * The data used to update ProvisioningJobs.
     */
    data: XOR<ProvisioningJobUpdateManyMutationInput, ProvisioningJobUncheckedUpdateManyInput>
    /**
     * Filter which ProvisioningJobs to update
     */
    where?: ProvisioningJobWhereInput
    /**
     * Limit how many ProvisioningJobs to update.
     */
    limit?: number
  }

  /**
   * ProvisioningJob upsert
   */
  export type ProvisioningJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * The filter to search for the ProvisioningJob to update in case it exists.
     */
    where: ProvisioningJobWhereUniqueInput
    /**
     * In case the ProvisioningJob found by the `where` argument doesn't exist, create a new ProvisioningJob with this data.
     */
    create: XOR<ProvisioningJobCreateInput, ProvisioningJobUncheckedCreateInput>
    /**
     * In case the ProvisioningJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProvisioningJobUpdateInput, ProvisioningJobUncheckedUpdateInput>
  }

  /**
   * ProvisioningJob delete
   */
  export type ProvisioningJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
    /**
     * Filter which ProvisioningJob to delete.
     */
    where: ProvisioningJobWhereUniqueInput
  }

  /**
   * ProvisioningJob deleteMany
   */
  export type ProvisioningJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProvisioningJobs to delete
     */
    where?: ProvisioningJobWhereInput
    /**
     * Limit how many ProvisioningJobs to delete.
     */
    limit?: number
  }

  /**
   * ProvisioningJob without action
   */
  export type ProvisioningJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProvisioningJob
     */
    select?: ProvisioningJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProvisioningJob
     */
    omit?: ProvisioningJobOmit<ExtArgs> | null
  }


  /**
   * Model InventoryItem
   */

  export type AggregateInventoryItem = {
    _count: InventoryItemCountAggregateOutputType | null
    _avg: InventoryItemAvgAggregateOutputType | null
    _sum: InventoryItemSumAggregateOutputType | null
    _min: InventoryItemMinAggregateOutputType | null
    _max: InventoryItemMaxAggregateOutputType | null
  }

  export type InventoryItemAvgAggregateOutputType = {
    monthlyCost: number | null
  }

  export type InventoryItemSumAggregateOutputType = {
    monthlyCost: number | null
  }

  export type InventoryItemMinAggregateOutputType = {
    id: string | null
    type: $Enums.InventoryType | null
    value: string | null
    model: string | null
    region: string | null
    monthlyCost: number | null
    status: $Enums.InventoryStatus | null
    reservedBy: string | null
    reservedAt: Date | null
    reservationExpires: Date | null
    releasedAt: Date | null
    releaseReason: string | null
    addedAt: Date | null
  }

  export type InventoryItemMaxAggregateOutputType = {
    id: string | null
    type: $Enums.InventoryType | null
    value: string | null
    model: string | null
    region: string | null
    monthlyCost: number | null
    status: $Enums.InventoryStatus | null
    reservedBy: string | null
    reservedAt: Date | null
    reservationExpires: Date | null
    releasedAt: Date | null
    releaseReason: string | null
    addedAt: Date | null
  }

  export type InventoryItemCountAggregateOutputType = {
    id: number
    type: number
    value: number
    model: number
    region: number
    capabilities: number
    monthlyCost: number
    status: number
    reservedBy: number
    reservedAt: number
    reservationExpires: number
    releasedAt: number
    releaseReason: number
    addedAt: number
    _all: number
  }


  export type InventoryItemAvgAggregateInputType = {
    monthlyCost?: true
  }

  export type InventoryItemSumAggregateInputType = {
    monthlyCost?: true
  }

  export type InventoryItemMinAggregateInputType = {
    id?: true
    type?: true
    value?: true
    model?: true
    region?: true
    monthlyCost?: true
    status?: true
    reservedBy?: true
    reservedAt?: true
    reservationExpires?: true
    releasedAt?: true
    releaseReason?: true
    addedAt?: true
  }

  export type InventoryItemMaxAggregateInputType = {
    id?: true
    type?: true
    value?: true
    model?: true
    region?: true
    monthlyCost?: true
    status?: true
    reservedBy?: true
    reservedAt?: true
    reservationExpires?: true
    releasedAt?: true
    releaseReason?: true
    addedAt?: true
  }

  export type InventoryItemCountAggregateInputType = {
    id?: true
    type?: true
    value?: true
    model?: true
    region?: true
    capabilities?: true
    monthlyCost?: true
    status?: true
    reservedBy?: true
    reservedAt?: true
    reservationExpires?: true
    releasedAt?: true
    releaseReason?: true
    addedAt?: true
    _all?: true
  }

  export type InventoryItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryItem to aggregate.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryItems
    **/
    _count?: true | InventoryItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryItemMaxAggregateInputType
  }

  export type GetInventoryItemAggregateType<T extends InventoryItemAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryItem[P]>
      : GetScalarType<T[P], AggregateInventoryItem[P]>
  }




  export type InventoryItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryItemWhereInput
    orderBy?: InventoryItemOrderByWithAggregationInput | InventoryItemOrderByWithAggregationInput[]
    by: InventoryItemScalarFieldEnum[] | InventoryItemScalarFieldEnum
    having?: InventoryItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryItemCountAggregateInputType | true
    _avg?: InventoryItemAvgAggregateInputType
    _sum?: InventoryItemSumAggregateInputType
    _min?: InventoryItemMinAggregateInputType
    _max?: InventoryItemMaxAggregateInputType
  }

  export type InventoryItemGroupByOutputType = {
    id: string
    type: $Enums.InventoryType
    value: string | null
    model: string | null
    region: string
    capabilities: string[]
    monthlyCost: number
    status: $Enums.InventoryStatus
    reservedBy: string | null
    reservedAt: Date | null
    reservationExpires: Date | null
    releasedAt: Date | null
    releaseReason: string | null
    addedAt: Date
    _count: InventoryItemCountAggregateOutputType | null
    _avg: InventoryItemAvgAggregateOutputType | null
    _sum: InventoryItemSumAggregateOutputType | null
    _min: InventoryItemMinAggregateOutputType | null
    _max: InventoryItemMaxAggregateOutputType | null
  }

  type GetInventoryItemGroupByPayload<T extends InventoryItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryItemGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryItemGroupByOutputType[P]>
        }
      >
    >


  export type InventoryItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    value?: boolean
    model?: boolean
    region?: boolean
    capabilities?: boolean
    monthlyCost?: boolean
    status?: boolean
    reservedBy?: boolean
    reservedAt?: boolean
    reservationExpires?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    addedAt?: boolean
  }, ExtArgs["result"]["inventoryItem"]>

  export type InventoryItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    value?: boolean
    model?: boolean
    region?: boolean
    capabilities?: boolean
    monthlyCost?: boolean
    status?: boolean
    reservedBy?: boolean
    reservedAt?: boolean
    reservationExpires?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    addedAt?: boolean
  }, ExtArgs["result"]["inventoryItem"]>

  export type InventoryItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    value?: boolean
    model?: boolean
    region?: boolean
    capabilities?: boolean
    monthlyCost?: boolean
    status?: boolean
    reservedBy?: boolean
    reservedAt?: boolean
    reservationExpires?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    addedAt?: boolean
  }, ExtArgs["result"]["inventoryItem"]>

  export type InventoryItemSelectScalar = {
    id?: boolean
    type?: boolean
    value?: boolean
    model?: boolean
    region?: boolean
    capabilities?: boolean
    monthlyCost?: boolean
    status?: boolean
    reservedBy?: boolean
    reservedAt?: boolean
    reservationExpires?: boolean
    releasedAt?: boolean
    releaseReason?: boolean
    addedAt?: boolean
  }

  export type InventoryItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "value" | "model" | "region" | "capabilities" | "monthlyCost" | "status" | "reservedBy" | "reservedAt" | "reservationExpires" | "releasedAt" | "releaseReason" | "addedAt", ExtArgs["result"]["inventoryItem"]>

  export type $InventoryItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryItem"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.InventoryType
      value: string | null
      model: string | null
      region: string
      capabilities: string[]
      monthlyCost: number
      status: $Enums.InventoryStatus
      reservedBy: string | null
      reservedAt: Date | null
      reservationExpires: Date | null
      releasedAt: Date | null
      releaseReason: string | null
      addedAt: Date
    }, ExtArgs["result"]["inventoryItem"]>
    composites: {}
  }

  type InventoryItemGetPayload<S extends boolean | null | undefined | InventoryItemDefaultArgs> = $Result.GetResult<Prisma.$InventoryItemPayload, S>

  type InventoryItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InventoryItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InventoryItemCountAggregateInputType | true
    }

  export interface InventoryItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryItem'], meta: { name: 'InventoryItem' } }
    /**
     * Find zero or one InventoryItem that matches the filter.
     * @param {InventoryItemFindUniqueArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryItemFindUniqueArgs>(args: SelectSubset<T, InventoryItemFindUniqueArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InventoryItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InventoryItemFindUniqueOrThrowArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryItemFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InventoryItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindFirstArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryItemFindFirstArgs>(args?: SelectSubset<T, InventoryItemFindFirstArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InventoryItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindFirstOrThrowArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryItemFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InventoryItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryItems
     * const inventoryItems = await prisma.inventoryItem.findMany()
     * 
     * // Get first 10 InventoryItems
     * const inventoryItems = await prisma.inventoryItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryItemWithIdOnly = await prisma.inventoryItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryItemFindManyArgs>(args?: SelectSubset<T, InventoryItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InventoryItem.
     * @param {InventoryItemCreateArgs} args - Arguments to create a InventoryItem.
     * @example
     * // Create one InventoryItem
     * const InventoryItem = await prisma.inventoryItem.create({
     *   data: {
     *     // ... data to create a InventoryItem
     *   }
     * })
     * 
     */
    create<T extends InventoryItemCreateArgs>(args: SelectSubset<T, InventoryItemCreateArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InventoryItems.
     * @param {InventoryItemCreateManyArgs} args - Arguments to create many InventoryItems.
     * @example
     * // Create many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryItemCreateManyArgs>(args?: SelectSubset<T, InventoryItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryItems and returns the data saved in the database.
     * @param {InventoryItemCreateManyAndReturnArgs} args - Arguments to create many InventoryItems.
     * @example
     * // Create many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryItems and only return the `id`
     * const inventoryItemWithIdOnly = await prisma.inventoryItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryItemCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InventoryItem.
     * @param {InventoryItemDeleteArgs} args - Arguments to delete one InventoryItem.
     * @example
     * // Delete one InventoryItem
     * const InventoryItem = await prisma.inventoryItem.delete({
     *   where: {
     *     // ... filter to delete one InventoryItem
     *   }
     * })
     * 
     */
    delete<T extends InventoryItemDeleteArgs>(args: SelectSubset<T, InventoryItemDeleteArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InventoryItem.
     * @param {InventoryItemUpdateArgs} args - Arguments to update one InventoryItem.
     * @example
     * // Update one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryItemUpdateArgs>(args: SelectSubset<T, InventoryItemUpdateArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InventoryItems.
     * @param {InventoryItemDeleteManyArgs} args - Arguments to filter InventoryItems to delete.
     * @example
     * // Delete a few InventoryItems
     * const { count } = await prisma.inventoryItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryItemDeleteManyArgs>(args?: SelectSubset<T, InventoryItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryItemUpdateManyArgs>(args: SelectSubset<T, InventoryItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryItems and returns the data updated in the database.
     * @param {InventoryItemUpdateManyAndReturnArgs} args - Arguments to update many InventoryItems.
     * @example
     * // Update many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InventoryItems and only return the `id`
     * const inventoryItemWithIdOnly = await prisma.inventoryItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InventoryItemUpdateManyAndReturnArgs>(args: SelectSubset<T, InventoryItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InventoryItem.
     * @param {InventoryItemUpsertArgs} args - Arguments to update or create a InventoryItem.
     * @example
     * // Update or create a InventoryItem
     * const inventoryItem = await prisma.inventoryItem.upsert({
     *   create: {
     *     // ... data to create a InventoryItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryItem we want to update
     *   }
     * })
     */
    upsert<T extends InventoryItemUpsertArgs>(args: SelectSubset<T, InventoryItemUpsertArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InventoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemCountArgs} args - Arguments to filter InventoryItems to count.
     * @example
     * // Count the number of InventoryItems
     * const count = await prisma.inventoryItem.count({
     *   where: {
     *     // ... the filter for the InventoryItems we want to count
     *   }
     * })
    **/
    count<T extends InventoryItemCountArgs>(
      args?: Subset<T, InventoryItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryItemAggregateArgs>(args: Subset<T, InventoryItemAggregateArgs>): Prisma.PrismaPromise<GetInventoryItemAggregateType<T>>

    /**
     * Group by InventoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryItemGroupByArgs['orderBy'] }
        : { orderBy?: InventoryItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryItem model
   */
  readonly fields: InventoryItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryItem model
   */
  interface InventoryItemFieldRefs {
    readonly id: FieldRef<"InventoryItem", 'String'>
    readonly type: FieldRef<"InventoryItem", 'InventoryType'>
    readonly value: FieldRef<"InventoryItem", 'String'>
    readonly model: FieldRef<"InventoryItem", 'String'>
    readonly region: FieldRef<"InventoryItem", 'String'>
    readonly capabilities: FieldRef<"InventoryItem", 'String[]'>
    readonly monthlyCost: FieldRef<"InventoryItem", 'Float'>
    readonly status: FieldRef<"InventoryItem", 'InventoryStatus'>
    readonly reservedBy: FieldRef<"InventoryItem", 'String'>
    readonly reservedAt: FieldRef<"InventoryItem", 'DateTime'>
    readonly reservationExpires: FieldRef<"InventoryItem", 'DateTime'>
    readonly releasedAt: FieldRef<"InventoryItem", 'DateTime'>
    readonly releaseReason: FieldRef<"InventoryItem", 'String'>
    readonly addedAt: FieldRef<"InventoryItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryItem findUnique
   */
  export type InventoryItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem findUniqueOrThrow
   */
  export type InventoryItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem findFirst
   */
  export type InventoryItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryItems.
     */
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem findFirstOrThrow
   */
  export type InventoryItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryItems.
     */
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem findMany
   */
  export type InventoryItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter, which InventoryItems to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem create
   */
  export type InventoryItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * The data needed to create a InventoryItem.
     */
    data: XOR<InventoryItemCreateInput, InventoryItemUncheckedCreateInput>
  }

  /**
   * InventoryItem createMany
   */
  export type InventoryItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryItems.
     */
    data: InventoryItemCreateManyInput | InventoryItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryItem createManyAndReturn
   */
  export type InventoryItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * The data used to create many InventoryItems.
     */
    data: InventoryItemCreateManyInput | InventoryItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryItem update
   */
  export type InventoryItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * The data needed to update a InventoryItem.
     */
    data: XOR<InventoryItemUpdateInput, InventoryItemUncheckedUpdateInput>
    /**
     * Choose, which InventoryItem to update.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem updateMany
   */
  export type InventoryItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryItems.
     */
    data: XOR<InventoryItemUpdateManyMutationInput, InventoryItemUncheckedUpdateManyInput>
    /**
     * Filter which InventoryItems to update
     */
    where?: InventoryItemWhereInput
    /**
     * Limit how many InventoryItems to update.
     */
    limit?: number
  }

  /**
   * InventoryItem updateManyAndReturn
   */
  export type InventoryItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * The data used to update InventoryItems.
     */
    data: XOR<InventoryItemUpdateManyMutationInput, InventoryItemUncheckedUpdateManyInput>
    /**
     * Filter which InventoryItems to update
     */
    where?: InventoryItemWhereInput
    /**
     * Limit how many InventoryItems to update.
     */
    limit?: number
  }

  /**
   * InventoryItem upsert
   */
  export type InventoryItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * The filter to search for the InventoryItem to update in case it exists.
     */
    where: InventoryItemWhereUniqueInput
    /**
     * In case the InventoryItem found by the `where` argument doesn't exist, create a new InventoryItem with this data.
     */
    create: XOR<InventoryItemCreateInput, InventoryItemUncheckedCreateInput>
    /**
     * In case the InventoryItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryItemUpdateInput, InventoryItemUncheckedUpdateInput>
  }

  /**
   * InventoryItem delete
   */
  export type InventoryItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
    /**
     * Filter which InventoryItem to delete.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem deleteMany
   */
  export type InventoryItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryItems to delete
     */
    where?: InventoryItemWhereInput
    /**
     * Limit how many InventoryItems to delete.
     */
    limit?: number
  }

  /**
   * InventoryItem without action
   */
  export type InventoryItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryItem
     */
    omit?: InventoryItemOmit<ExtArgs> | null
  }


  /**
   * Model Webhook
   */

  export type AggregateWebhook = {
    _count: WebhookCountAggregateOutputType | null
    _min: WebhookMinAggregateOutputType | null
    _max: WebhookMaxAggregateOutputType | null
  }

  export type WebhookMinAggregateOutputType = {
    id: string | null
    url: string | null
    secret: string | null
    customerId: string | null
    description: string | null
    status: $Enums.WebhookStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WebhookMaxAggregateOutputType = {
    id: string | null
    url: string | null
    secret: string | null
    customerId: string | null
    description: string | null
    status: $Enums.WebhookStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WebhookCountAggregateOutputType = {
    id: number
    url: number
    events: number
    secret: number
    customerId: number
    description: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WebhookMinAggregateInputType = {
    id?: true
    url?: true
    secret?: true
    customerId?: true
    description?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WebhookMaxAggregateInputType = {
    id?: true
    url?: true
    secret?: true
    customerId?: true
    description?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WebhookCountAggregateInputType = {
    id?: true
    url?: true
    events?: true
    secret?: true
    customerId?: true
    description?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WebhookAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Webhook to aggregate.
     */
    where?: WebhookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Webhooks to fetch.
     */
    orderBy?: WebhookOrderByWithRelationInput | WebhookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WebhookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Webhooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Webhooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Webhooks
    **/
    _count?: true | WebhookCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WebhookMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WebhookMaxAggregateInputType
  }

  export type GetWebhookAggregateType<T extends WebhookAggregateArgs> = {
        [P in keyof T & keyof AggregateWebhook]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWebhook[P]>
      : GetScalarType<T[P], AggregateWebhook[P]>
  }




  export type WebhookGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WebhookWhereInput
    orderBy?: WebhookOrderByWithAggregationInput | WebhookOrderByWithAggregationInput[]
    by: WebhookScalarFieldEnum[] | WebhookScalarFieldEnum
    having?: WebhookScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WebhookCountAggregateInputType | true
    _min?: WebhookMinAggregateInputType
    _max?: WebhookMaxAggregateInputType
  }

  export type WebhookGroupByOutputType = {
    id: string
    url: string
    events: string[]
    secret: string
    customerId: string
    description: string | null
    status: $Enums.WebhookStatus
    createdAt: Date
    updatedAt: Date
    _count: WebhookCountAggregateOutputType | null
    _min: WebhookMinAggregateOutputType | null
    _max: WebhookMaxAggregateOutputType | null
  }

  type GetWebhookGroupByPayload<T extends WebhookGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WebhookGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WebhookGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WebhookGroupByOutputType[P]>
            : GetScalarType<T[P], WebhookGroupByOutputType[P]>
        }
      >
    >


  export type WebhookSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    events?: boolean
    secret?: boolean
    customerId?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["webhook"]>

  export type WebhookSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    events?: boolean
    secret?: boolean
    customerId?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["webhook"]>

  export type WebhookSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    events?: boolean
    secret?: boolean
    customerId?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["webhook"]>

  export type WebhookSelectScalar = {
    id?: boolean
    url?: boolean
    events?: boolean
    secret?: boolean
    customerId?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WebhookOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "url" | "events" | "secret" | "customerId" | "description" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["webhook"]>

  export type $WebhookPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Webhook"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      url: string
      events: string[]
      secret: string
      customerId: string
      description: string | null
      status: $Enums.WebhookStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["webhook"]>
    composites: {}
  }

  type WebhookGetPayload<S extends boolean | null | undefined | WebhookDefaultArgs> = $Result.GetResult<Prisma.$WebhookPayload, S>

  type WebhookCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WebhookFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WebhookCountAggregateInputType | true
    }

  export interface WebhookDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Webhook'], meta: { name: 'Webhook' } }
    /**
     * Find zero or one Webhook that matches the filter.
     * @param {WebhookFindUniqueArgs} args - Arguments to find a Webhook
     * @example
     * // Get one Webhook
     * const webhook = await prisma.webhook.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WebhookFindUniqueArgs>(args: SelectSubset<T, WebhookFindUniqueArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Webhook that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WebhookFindUniqueOrThrowArgs} args - Arguments to find a Webhook
     * @example
     * // Get one Webhook
     * const webhook = await prisma.webhook.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WebhookFindUniqueOrThrowArgs>(args: SelectSubset<T, WebhookFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Webhook that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookFindFirstArgs} args - Arguments to find a Webhook
     * @example
     * // Get one Webhook
     * const webhook = await prisma.webhook.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WebhookFindFirstArgs>(args?: SelectSubset<T, WebhookFindFirstArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Webhook that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookFindFirstOrThrowArgs} args - Arguments to find a Webhook
     * @example
     * // Get one Webhook
     * const webhook = await prisma.webhook.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WebhookFindFirstOrThrowArgs>(args?: SelectSubset<T, WebhookFindFirstOrThrowArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Webhooks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Webhooks
     * const webhooks = await prisma.webhook.findMany()
     * 
     * // Get first 10 Webhooks
     * const webhooks = await prisma.webhook.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const webhookWithIdOnly = await prisma.webhook.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WebhookFindManyArgs>(args?: SelectSubset<T, WebhookFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Webhook.
     * @param {WebhookCreateArgs} args - Arguments to create a Webhook.
     * @example
     * // Create one Webhook
     * const Webhook = await prisma.webhook.create({
     *   data: {
     *     // ... data to create a Webhook
     *   }
     * })
     * 
     */
    create<T extends WebhookCreateArgs>(args: SelectSubset<T, WebhookCreateArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Webhooks.
     * @param {WebhookCreateManyArgs} args - Arguments to create many Webhooks.
     * @example
     * // Create many Webhooks
     * const webhook = await prisma.webhook.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WebhookCreateManyArgs>(args?: SelectSubset<T, WebhookCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Webhooks and returns the data saved in the database.
     * @param {WebhookCreateManyAndReturnArgs} args - Arguments to create many Webhooks.
     * @example
     * // Create many Webhooks
     * const webhook = await prisma.webhook.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Webhooks and only return the `id`
     * const webhookWithIdOnly = await prisma.webhook.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WebhookCreateManyAndReturnArgs>(args?: SelectSubset<T, WebhookCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Webhook.
     * @param {WebhookDeleteArgs} args - Arguments to delete one Webhook.
     * @example
     * // Delete one Webhook
     * const Webhook = await prisma.webhook.delete({
     *   where: {
     *     // ... filter to delete one Webhook
     *   }
     * })
     * 
     */
    delete<T extends WebhookDeleteArgs>(args: SelectSubset<T, WebhookDeleteArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Webhook.
     * @param {WebhookUpdateArgs} args - Arguments to update one Webhook.
     * @example
     * // Update one Webhook
     * const webhook = await prisma.webhook.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WebhookUpdateArgs>(args: SelectSubset<T, WebhookUpdateArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Webhooks.
     * @param {WebhookDeleteManyArgs} args - Arguments to filter Webhooks to delete.
     * @example
     * // Delete a few Webhooks
     * const { count } = await prisma.webhook.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WebhookDeleteManyArgs>(args?: SelectSubset<T, WebhookDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Webhooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Webhooks
     * const webhook = await prisma.webhook.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WebhookUpdateManyArgs>(args: SelectSubset<T, WebhookUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Webhooks and returns the data updated in the database.
     * @param {WebhookUpdateManyAndReturnArgs} args - Arguments to update many Webhooks.
     * @example
     * // Update many Webhooks
     * const webhook = await prisma.webhook.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Webhooks and only return the `id`
     * const webhookWithIdOnly = await prisma.webhook.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WebhookUpdateManyAndReturnArgs>(args: SelectSubset<T, WebhookUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Webhook.
     * @param {WebhookUpsertArgs} args - Arguments to update or create a Webhook.
     * @example
     * // Update or create a Webhook
     * const webhook = await prisma.webhook.upsert({
     *   create: {
     *     // ... data to create a Webhook
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Webhook we want to update
     *   }
     * })
     */
    upsert<T extends WebhookUpsertArgs>(args: SelectSubset<T, WebhookUpsertArgs<ExtArgs>>): Prisma__WebhookClient<$Result.GetResult<Prisma.$WebhookPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Webhooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookCountArgs} args - Arguments to filter Webhooks to count.
     * @example
     * // Count the number of Webhooks
     * const count = await prisma.webhook.count({
     *   where: {
     *     // ... the filter for the Webhooks we want to count
     *   }
     * })
    **/
    count<T extends WebhookCountArgs>(
      args?: Subset<T, WebhookCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WebhookCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Webhook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WebhookAggregateArgs>(args: Subset<T, WebhookAggregateArgs>): Prisma.PrismaPromise<GetWebhookAggregateType<T>>

    /**
     * Group by Webhook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WebhookGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WebhookGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WebhookGroupByArgs['orderBy'] }
        : { orderBy?: WebhookGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WebhookGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWebhookGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Webhook model
   */
  readonly fields: WebhookFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Webhook.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WebhookClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Webhook model
   */
  interface WebhookFieldRefs {
    readonly id: FieldRef<"Webhook", 'String'>
    readonly url: FieldRef<"Webhook", 'String'>
    readonly events: FieldRef<"Webhook", 'String[]'>
    readonly secret: FieldRef<"Webhook", 'String'>
    readonly customerId: FieldRef<"Webhook", 'String'>
    readonly description: FieldRef<"Webhook", 'String'>
    readonly status: FieldRef<"Webhook", 'WebhookStatus'>
    readonly createdAt: FieldRef<"Webhook", 'DateTime'>
    readonly updatedAt: FieldRef<"Webhook", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Webhook findUnique
   */
  export type WebhookFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter, which Webhook to fetch.
     */
    where: WebhookWhereUniqueInput
  }

  /**
   * Webhook findUniqueOrThrow
   */
  export type WebhookFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter, which Webhook to fetch.
     */
    where: WebhookWhereUniqueInput
  }

  /**
   * Webhook findFirst
   */
  export type WebhookFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter, which Webhook to fetch.
     */
    where?: WebhookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Webhooks to fetch.
     */
    orderBy?: WebhookOrderByWithRelationInput | WebhookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Webhooks.
     */
    cursor?: WebhookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Webhooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Webhooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Webhooks.
     */
    distinct?: WebhookScalarFieldEnum | WebhookScalarFieldEnum[]
  }

  /**
   * Webhook findFirstOrThrow
   */
  export type WebhookFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter, which Webhook to fetch.
     */
    where?: WebhookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Webhooks to fetch.
     */
    orderBy?: WebhookOrderByWithRelationInput | WebhookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Webhooks.
     */
    cursor?: WebhookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Webhooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Webhooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Webhooks.
     */
    distinct?: WebhookScalarFieldEnum | WebhookScalarFieldEnum[]
  }

  /**
   * Webhook findMany
   */
  export type WebhookFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter, which Webhooks to fetch.
     */
    where?: WebhookWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Webhooks to fetch.
     */
    orderBy?: WebhookOrderByWithRelationInput | WebhookOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Webhooks.
     */
    cursor?: WebhookWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Webhooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Webhooks.
     */
    skip?: number
    distinct?: WebhookScalarFieldEnum | WebhookScalarFieldEnum[]
  }

  /**
   * Webhook create
   */
  export type WebhookCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * The data needed to create a Webhook.
     */
    data: XOR<WebhookCreateInput, WebhookUncheckedCreateInput>
  }

  /**
   * Webhook createMany
   */
  export type WebhookCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Webhooks.
     */
    data: WebhookCreateManyInput | WebhookCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Webhook createManyAndReturn
   */
  export type WebhookCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * The data used to create many Webhooks.
     */
    data: WebhookCreateManyInput | WebhookCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Webhook update
   */
  export type WebhookUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * The data needed to update a Webhook.
     */
    data: XOR<WebhookUpdateInput, WebhookUncheckedUpdateInput>
    /**
     * Choose, which Webhook to update.
     */
    where: WebhookWhereUniqueInput
  }

  /**
   * Webhook updateMany
   */
  export type WebhookUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Webhooks.
     */
    data: XOR<WebhookUpdateManyMutationInput, WebhookUncheckedUpdateManyInput>
    /**
     * Filter which Webhooks to update
     */
    where?: WebhookWhereInput
    /**
     * Limit how many Webhooks to update.
     */
    limit?: number
  }

  /**
   * Webhook updateManyAndReturn
   */
  export type WebhookUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * The data used to update Webhooks.
     */
    data: XOR<WebhookUpdateManyMutationInput, WebhookUncheckedUpdateManyInput>
    /**
     * Filter which Webhooks to update
     */
    where?: WebhookWhereInput
    /**
     * Limit how many Webhooks to update.
     */
    limit?: number
  }

  /**
   * Webhook upsert
   */
  export type WebhookUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * The filter to search for the Webhook to update in case it exists.
     */
    where: WebhookWhereUniqueInput
    /**
     * In case the Webhook found by the `where` argument doesn't exist, create a new Webhook with this data.
     */
    create: XOR<WebhookCreateInput, WebhookUncheckedCreateInput>
    /**
     * In case the Webhook was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WebhookUpdateInput, WebhookUncheckedUpdateInput>
  }

  /**
   * Webhook delete
   */
  export type WebhookDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
    /**
     * Filter which Webhook to delete.
     */
    where: WebhookWhereUniqueInput
  }

  /**
   * Webhook deleteMany
   */
  export type WebhookDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Webhooks to delete
     */
    where?: WebhookWhereInput
    /**
     * Limit how many Webhooks to delete.
     */
    limit?: number
  }

  /**
   * Webhook without action
   */
  export type WebhookDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Webhook
     */
    select?: WebhookSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Webhook
     */
    omit?: WebhookOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const PhoneNumberScalarFieldEnum: {
    id: 'id',
    number: 'number',
    customerId: 'customerId',
    billingAddress: 'billingAddress',
    voiceUrl: 'voiceUrl',
    smsUrl: 'smsUrl',
    status: 'status',
    purchasedAt: 'purchasedAt',
    releasedAt: 'releasedAt',
    releaseReason: 'releaseReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PhoneNumberScalarFieldEnum = (typeof PhoneNumberScalarFieldEnum)[keyof typeof PhoneNumberScalarFieldEnum]


  export const PortingRequestScalarFieldEnum: {
    id: 'id',
    currentNumber: 'currentNumber',
    currentCarrier: 'currentCarrier',
    accountNumber: 'accountNumber',
    pin: 'pin',
    customerId: 'customerId',
    billingAddress: 'billingAddress',
    authorizedUser: 'authorizedUser',
    serviceAddress: 'serviceAddress',
    status: 'status',
    estimatedCompletion: 'estimatedCompletion',
    notes: 'notes',
    rejectionReason: 'rejectionReason',
    completedAt: 'completedAt',
    rejectedAt: 'rejectedAt',
    cancelledAt: 'cancelledAt',
    cancellationReason: 'cancellationReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PortingRequestScalarFieldEnum = (typeof PortingRequestScalarFieldEnum)[keyof typeof PortingRequestScalarFieldEnum]


  export const ProvisioningJobScalarFieldEnum: {
    id: 'id',
    customerId: 'customerId',
    phoneNumber: 'phoneNumber',
    deviceType: 'deviceType',
    deviceId: 'deviceId',
    configuration: 'configuration',
    priority: 'priority',
    status: 'status',
    progress: 'progress',
    notes: 'notes',
    errorMessage: 'errorMessage',
    completedAt: 'completedAt',
    failedAt: 'failedAt',
    cancelledAt: 'cancelledAt',
    cancellationReason: 'cancellationReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProvisioningJobScalarFieldEnum = (typeof ProvisioningJobScalarFieldEnum)[keyof typeof ProvisioningJobScalarFieldEnum]


  export const InventoryItemScalarFieldEnum: {
    id: 'id',
    type: 'type',
    value: 'value',
    model: 'model',
    region: 'region',
    capabilities: 'capabilities',
    monthlyCost: 'monthlyCost',
    status: 'status',
    reservedBy: 'reservedBy',
    reservedAt: 'reservedAt',
    reservationExpires: 'reservationExpires',
    releasedAt: 'releasedAt',
    releaseReason: 'releaseReason',
    addedAt: 'addedAt'
  };

  export type InventoryItemScalarFieldEnum = (typeof InventoryItemScalarFieldEnum)[keyof typeof InventoryItemScalarFieldEnum]


  export const WebhookScalarFieldEnum: {
    id: 'id',
    url: 'url',
    events: 'events',
    secret: 'secret',
    customerId: 'customerId',
    description: 'description',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WebhookScalarFieldEnum = (typeof WebhookScalarFieldEnum)[keyof typeof WebhookScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'PhoneNumberStatus'
   */
  export type EnumPhoneNumberStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PhoneNumberStatus'>
    


  /**
   * Reference to a field of type 'PhoneNumberStatus[]'
   */
  export type ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PhoneNumberStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'PortingStatus'
   */
  export type EnumPortingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PortingStatus'>
    


  /**
   * Reference to a field of type 'PortingStatus[]'
   */
  export type ListEnumPortingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PortingStatus[]'>
    


  /**
   * Reference to a field of type 'JobPriority'
   */
  export type EnumJobPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobPriority'>
    


  /**
   * Reference to a field of type 'JobPriority[]'
   */
  export type ListEnumJobPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobPriority[]'>
    


  /**
   * Reference to a field of type 'JobStatus'
   */
  export type EnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus'>
    


  /**
   * Reference to a field of type 'JobStatus[]'
   */
  export type ListEnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'InventoryType'
   */
  export type EnumInventoryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryType'>
    


  /**
   * Reference to a field of type 'InventoryType[]'
   */
  export type ListEnumInventoryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'InventoryStatus'
   */
  export type EnumInventoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryStatus'>
    


  /**
   * Reference to a field of type 'InventoryStatus[]'
   */
  export type ListEnumInventoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryStatus[]'>
    


  /**
   * Reference to a field of type 'WebhookStatus'
   */
  export type EnumWebhookStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WebhookStatus'>
    


  /**
   * Reference to a field of type 'WebhookStatus[]'
   */
  export type ListEnumWebhookStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WebhookStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type PhoneNumberWhereInput = {
    AND?: PhoneNumberWhereInput | PhoneNumberWhereInput[]
    OR?: PhoneNumberWhereInput[]
    NOT?: PhoneNumberWhereInput | PhoneNumberWhereInput[]
    id?: StringFilter<"PhoneNumber"> | string
    number?: StringFilter<"PhoneNumber"> | string
    customerId?: StringFilter<"PhoneNumber"> | string
    billingAddress?: JsonNullableFilter<"PhoneNumber">
    voiceUrl?: StringNullableFilter<"PhoneNumber"> | string | null
    smsUrl?: StringNullableFilter<"PhoneNumber"> | string | null
    status?: EnumPhoneNumberStatusFilter<"PhoneNumber"> | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    releasedAt?: DateTimeNullableFilter<"PhoneNumber"> | Date | string | null
    releaseReason?: StringNullableFilter<"PhoneNumber"> | string | null
    createdAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    updatedAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    portingRequests?: PortingRequestListRelationFilter
  }

  export type PhoneNumberOrderByWithRelationInput = {
    id?: SortOrder
    number?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    voiceUrl?: SortOrderInput | SortOrder
    smsUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    purchasedAt?: SortOrder
    releasedAt?: SortOrderInput | SortOrder
    releaseReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    portingRequests?: PortingRequestOrderByRelationAggregateInput
  }

  export type PhoneNumberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    number?: string
    AND?: PhoneNumberWhereInput | PhoneNumberWhereInput[]
    OR?: PhoneNumberWhereInput[]
    NOT?: PhoneNumberWhereInput | PhoneNumberWhereInput[]
    customerId?: StringFilter<"PhoneNumber"> | string
    billingAddress?: JsonNullableFilter<"PhoneNumber">
    voiceUrl?: StringNullableFilter<"PhoneNumber"> | string | null
    smsUrl?: StringNullableFilter<"PhoneNumber"> | string | null
    status?: EnumPhoneNumberStatusFilter<"PhoneNumber"> | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    releasedAt?: DateTimeNullableFilter<"PhoneNumber"> | Date | string | null
    releaseReason?: StringNullableFilter<"PhoneNumber"> | string | null
    createdAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    updatedAt?: DateTimeFilter<"PhoneNumber"> | Date | string
    portingRequests?: PortingRequestListRelationFilter
  }, "id" | "number">

  export type PhoneNumberOrderByWithAggregationInput = {
    id?: SortOrder
    number?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    voiceUrl?: SortOrderInput | SortOrder
    smsUrl?: SortOrderInput | SortOrder
    status?: SortOrder
    purchasedAt?: SortOrder
    releasedAt?: SortOrderInput | SortOrder
    releaseReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PhoneNumberCountOrderByAggregateInput
    _max?: PhoneNumberMaxOrderByAggregateInput
    _min?: PhoneNumberMinOrderByAggregateInput
  }

  export type PhoneNumberScalarWhereWithAggregatesInput = {
    AND?: PhoneNumberScalarWhereWithAggregatesInput | PhoneNumberScalarWhereWithAggregatesInput[]
    OR?: PhoneNumberScalarWhereWithAggregatesInput[]
    NOT?: PhoneNumberScalarWhereWithAggregatesInput | PhoneNumberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PhoneNumber"> | string
    number?: StringWithAggregatesFilter<"PhoneNumber"> | string
    customerId?: StringWithAggregatesFilter<"PhoneNumber"> | string
    billingAddress?: JsonNullableWithAggregatesFilter<"PhoneNumber">
    voiceUrl?: StringNullableWithAggregatesFilter<"PhoneNumber"> | string | null
    smsUrl?: StringNullableWithAggregatesFilter<"PhoneNumber"> | string | null
    status?: EnumPhoneNumberStatusWithAggregatesFilter<"PhoneNumber"> | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeWithAggregatesFilter<"PhoneNumber"> | Date | string
    releasedAt?: DateTimeNullableWithAggregatesFilter<"PhoneNumber"> | Date | string | null
    releaseReason?: StringNullableWithAggregatesFilter<"PhoneNumber"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PhoneNumber"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PhoneNumber"> | Date | string
  }

  export type PortingRequestWhereInput = {
    AND?: PortingRequestWhereInput | PortingRequestWhereInput[]
    OR?: PortingRequestWhereInput[]
    NOT?: PortingRequestWhereInput | PortingRequestWhereInput[]
    id?: StringFilter<"PortingRequest"> | string
    currentNumber?: StringFilter<"PortingRequest"> | string
    currentCarrier?: StringFilter<"PortingRequest"> | string
    accountNumber?: StringFilter<"PortingRequest"> | string
    pin?: StringNullableFilter<"PortingRequest"> | string | null
    customerId?: StringFilter<"PortingRequest"> | string
    billingAddress?: JsonNullableFilter<"PortingRequest">
    authorizedUser?: StringNullableFilter<"PortingRequest"> | string | null
    serviceAddress?: JsonNullableFilter<"PortingRequest">
    status?: EnumPortingStatusFilter<"PortingRequest"> | $Enums.PortingStatus
    estimatedCompletion?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    notes?: StringNullableFilter<"PortingRequest"> | string | null
    rejectionReason?: StringNullableFilter<"PortingRequest"> | string | null
    completedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    rejectedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancellationReason?: StringNullableFilter<"PortingRequest"> | string | null
    createdAt?: DateTimeFilter<"PortingRequest"> | Date | string
    updatedAt?: DateTimeFilter<"PortingRequest"> | Date | string
    phoneNumber?: XOR<PhoneNumberNullableScalarRelationFilter, PhoneNumberWhereInput> | null
  }

  export type PortingRequestOrderByWithRelationInput = {
    id?: SortOrder
    currentNumber?: SortOrder
    currentCarrier?: SortOrder
    accountNumber?: SortOrder
    pin?: SortOrderInput | SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    authorizedUser?: SortOrderInput | SortOrder
    serviceAddress?: SortOrderInput | SortOrder
    status?: SortOrder
    estimatedCompletion?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phoneNumber?: PhoneNumberOrderByWithRelationInput
  }

  export type PortingRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PortingRequestWhereInput | PortingRequestWhereInput[]
    OR?: PortingRequestWhereInput[]
    NOT?: PortingRequestWhereInput | PortingRequestWhereInput[]
    currentNumber?: StringFilter<"PortingRequest"> | string
    currentCarrier?: StringFilter<"PortingRequest"> | string
    accountNumber?: StringFilter<"PortingRequest"> | string
    pin?: StringNullableFilter<"PortingRequest"> | string | null
    customerId?: StringFilter<"PortingRequest"> | string
    billingAddress?: JsonNullableFilter<"PortingRequest">
    authorizedUser?: StringNullableFilter<"PortingRequest"> | string | null
    serviceAddress?: JsonNullableFilter<"PortingRequest">
    status?: EnumPortingStatusFilter<"PortingRequest"> | $Enums.PortingStatus
    estimatedCompletion?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    notes?: StringNullableFilter<"PortingRequest"> | string | null
    rejectionReason?: StringNullableFilter<"PortingRequest"> | string | null
    completedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    rejectedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancellationReason?: StringNullableFilter<"PortingRequest"> | string | null
    createdAt?: DateTimeFilter<"PortingRequest"> | Date | string
    updatedAt?: DateTimeFilter<"PortingRequest"> | Date | string
    phoneNumber?: XOR<PhoneNumberNullableScalarRelationFilter, PhoneNumberWhereInput> | null
  }, "id">

  export type PortingRequestOrderByWithAggregationInput = {
    id?: SortOrder
    currentNumber?: SortOrder
    currentCarrier?: SortOrder
    accountNumber?: SortOrder
    pin?: SortOrderInput | SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    authorizedUser?: SortOrderInput | SortOrder
    serviceAddress?: SortOrderInput | SortOrder
    status?: SortOrder
    estimatedCompletion?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PortingRequestCountOrderByAggregateInput
    _max?: PortingRequestMaxOrderByAggregateInput
    _min?: PortingRequestMinOrderByAggregateInput
  }

  export type PortingRequestScalarWhereWithAggregatesInput = {
    AND?: PortingRequestScalarWhereWithAggregatesInput | PortingRequestScalarWhereWithAggregatesInput[]
    OR?: PortingRequestScalarWhereWithAggregatesInput[]
    NOT?: PortingRequestScalarWhereWithAggregatesInput | PortingRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PortingRequest"> | string
    currentNumber?: StringWithAggregatesFilter<"PortingRequest"> | string
    currentCarrier?: StringWithAggregatesFilter<"PortingRequest"> | string
    accountNumber?: StringWithAggregatesFilter<"PortingRequest"> | string
    pin?: StringNullableWithAggregatesFilter<"PortingRequest"> | string | null
    customerId?: StringWithAggregatesFilter<"PortingRequest"> | string
    billingAddress?: JsonNullableWithAggregatesFilter<"PortingRequest">
    authorizedUser?: StringNullableWithAggregatesFilter<"PortingRequest"> | string | null
    serviceAddress?: JsonNullableWithAggregatesFilter<"PortingRequest">
    status?: EnumPortingStatusWithAggregatesFilter<"PortingRequest"> | $Enums.PortingStatus
    estimatedCompletion?: DateTimeNullableWithAggregatesFilter<"PortingRequest"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"PortingRequest"> | string | null
    rejectionReason?: StringNullableWithAggregatesFilter<"PortingRequest"> | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"PortingRequest"> | Date | string | null
    rejectedAt?: DateTimeNullableWithAggregatesFilter<"PortingRequest"> | Date | string | null
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"PortingRequest"> | Date | string | null
    cancellationReason?: StringNullableWithAggregatesFilter<"PortingRequest"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PortingRequest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PortingRequest"> | Date | string
  }

  export type ProvisioningJobWhereInput = {
    AND?: ProvisioningJobWhereInput | ProvisioningJobWhereInput[]
    OR?: ProvisioningJobWhereInput[]
    NOT?: ProvisioningJobWhereInput | ProvisioningJobWhereInput[]
    id?: StringFilter<"ProvisioningJob"> | string
    customerId?: StringFilter<"ProvisioningJob"> | string
    phoneNumber?: StringFilter<"ProvisioningJob"> | string
    deviceType?: StringFilter<"ProvisioningJob"> | string
    deviceId?: StringNullableFilter<"ProvisioningJob"> | string | null
    configuration?: JsonNullableFilter<"ProvisioningJob">
    priority?: EnumJobPriorityFilter<"ProvisioningJob"> | $Enums.JobPriority
    status?: EnumJobStatusFilter<"ProvisioningJob"> | $Enums.JobStatus
    progress?: IntFilter<"ProvisioningJob"> | number
    notes?: StringNullableFilter<"ProvisioningJob"> | string | null
    errorMessage?: StringNullableFilter<"ProvisioningJob"> | string | null
    completedAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    failedAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    cancellationReason?: StringNullableFilter<"ProvisioningJob"> | string | null
    createdAt?: DateTimeFilter<"ProvisioningJob"> | Date | string
    updatedAt?: DateTimeFilter<"ProvisioningJob"> | Date | string
  }

  export type ProvisioningJobOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    phoneNumber?: SortOrder
    deviceType?: SortOrder
    deviceId?: SortOrderInput | SortOrder
    configuration?: SortOrderInput | SortOrder
    priority?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    notes?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    failedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProvisioningJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProvisioningJobWhereInput | ProvisioningJobWhereInput[]
    OR?: ProvisioningJobWhereInput[]
    NOT?: ProvisioningJobWhereInput | ProvisioningJobWhereInput[]
    customerId?: StringFilter<"ProvisioningJob"> | string
    phoneNumber?: StringFilter<"ProvisioningJob"> | string
    deviceType?: StringFilter<"ProvisioningJob"> | string
    deviceId?: StringNullableFilter<"ProvisioningJob"> | string | null
    configuration?: JsonNullableFilter<"ProvisioningJob">
    priority?: EnumJobPriorityFilter<"ProvisioningJob"> | $Enums.JobPriority
    status?: EnumJobStatusFilter<"ProvisioningJob"> | $Enums.JobStatus
    progress?: IntFilter<"ProvisioningJob"> | number
    notes?: StringNullableFilter<"ProvisioningJob"> | string | null
    errorMessage?: StringNullableFilter<"ProvisioningJob"> | string | null
    completedAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    failedAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"ProvisioningJob"> | Date | string | null
    cancellationReason?: StringNullableFilter<"ProvisioningJob"> | string | null
    createdAt?: DateTimeFilter<"ProvisioningJob"> | Date | string
    updatedAt?: DateTimeFilter<"ProvisioningJob"> | Date | string
  }, "id">

  export type ProvisioningJobOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    phoneNumber?: SortOrder
    deviceType?: SortOrder
    deviceId?: SortOrderInput | SortOrder
    configuration?: SortOrderInput | SortOrder
    priority?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    notes?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    failedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProvisioningJobCountOrderByAggregateInput
    _avg?: ProvisioningJobAvgOrderByAggregateInput
    _max?: ProvisioningJobMaxOrderByAggregateInput
    _min?: ProvisioningJobMinOrderByAggregateInput
    _sum?: ProvisioningJobSumOrderByAggregateInput
  }

  export type ProvisioningJobScalarWhereWithAggregatesInput = {
    AND?: ProvisioningJobScalarWhereWithAggregatesInput | ProvisioningJobScalarWhereWithAggregatesInput[]
    OR?: ProvisioningJobScalarWhereWithAggregatesInput[]
    NOT?: ProvisioningJobScalarWhereWithAggregatesInput | ProvisioningJobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProvisioningJob"> | string
    customerId?: StringWithAggregatesFilter<"ProvisioningJob"> | string
    phoneNumber?: StringWithAggregatesFilter<"ProvisioningJob"> | string
    deviceType?: StringWithAggregatesFilter<"ProvisioningJob"> | string
    deviceId?: StringNullableWithAggregatesFilter<"ProvisioningJob"> | string | null
    configuration?: JsonNullableWithAggregatesFilter<"ProvisioningJob">
    priority?: EnumJobPriorityWithAggregatesFilter<"ProvisioningJob"> | $Enums.JobPriority
    status?: EnumJobStatusWithAggregatesFilter<"ProvisioningJob"> | $Enums.JobStatus
    progress?: IntWithAggregatesFilter<"ProvisioningJob"> | number
    notes?: StringNullableWithAggregatesFilter<"ProvisioningJob"> | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"ProvisioningJob"> | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"ProvisioningJob"> | Date | string | null
    failedAt?: DateTimeNullableWithAggregatesFilter<"ProvisioningJob"> | Date | string | null
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"ProvisioningJob"> | Date | string | null
    cancellationReason?: StringNullableWithAggregatesFilter<"ProvisioningJob"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ProvisioningJob"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ProvisioningJob"> | Date | string
  }

  export type InventoryItemWhereInput = {
    AND?: InventoryItemWhereInput | InventoryItemWhereInput[]
    OR?: InventoryItemWhereInput[]
    NOT?: InventoryItemWhereInput | InventoryItemWhereInput[]
    id?: StringFilter<"InventoryItem"> | string
    type?: EnumInventoryTypeFilter<"InventoryItem"> | $Enums.InventoryType
    value?: StringNullableFilter<"InventoryItem"> | string | null
    model?: StringNullableFilter<"InventoryItem"> | string | null
    region?: StringFilter<"InventoryItem"> | string
    capabilities?: StringNullableListFilter<"InventoryItem">
    monthlyCost?: FloatFilter<"InventoryItem"> | number
    status?: EnumInventoryStatusFilter<"InventoryItem"> | $Enums.InventoryStatus
    reservedBy?: StringNullableFilter<"InventoryItem"> | string | null
    reservedAt?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    reservationExpires?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    releasedAt?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    releaseReason?: StringNullableFilter<"InventoryItem"> | string | null
    addedAt?: DateTimeFilter<"InventoryItem"> | Date | string
  }

  export type InventoryItemOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrderInput | SortOrder
    model?: SortOrderInput | SortOrder
    region?: SortOrder
    capabilities?: SortOrder
    monthlyCost?: SortOrder
    status?: SortOrder
    reservedBy?: SortOrderInput | SortOrder
    reservedAt?: SortOrderInput | SortOrder
    reservationExpires?: SortOrderInput | SortOrder
    releasedAt?: SortOrderInput | SortOrder
    releaseReason?: SortOrderInput | SortOrder
    addedAt?: SortOrder
  }

  export type InventoryItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InventoryItemWhereInput | InventoryItemWhereInput[]
    OR?: InventoryItemWhereInput[]
    NOT?: InventoryItemWhereInput | InventoryItemWhereInput[]
    type?: EnumInventoryTypeFilter<"InventoryItem"> | $Enums.InventoryType
    value?: StringNullableFilter<"InventoryItem"> | string | null
    model?: StringNullableFilter<"InventoryItem"> | string | null
    region?: StringFilter<"InventoryItem"> | string
    capabilities?: StringNullableListFilter<"InventoryItem">
    monthlyCost?: FloatFilter<"InventoryItem"> | number
    status?: EnumInventoryStatusFilter<"InventoryItem"> | $Enums.InventoryStatus
    reservedBy?: StringNullableFilter<"InventoryItem"> | string | null
    reservedAt?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    reservationExpires?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    releasedAt?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    releaseReason?: StringNullableFilter<"InventoryItem"> | string | null
    addedAt?: DateTimeFilter<"InventoryItem"> | Date | string
  }, "id">

  export type InventoryItemOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrderInput | SortOrder
    model?: SortOrderInput | SortOrder
    region?: SortOrder
    capabilities?: SortOrder
    monthlyCost?: SortOrder
    status?: SortOrder
    reservedBy?: SortOrderInput | SortOrder
    reservedAt?: SortOrderInput | SortOrder
    reservationExpires?: SortOrderInput | SortOrder
    releasedAt?: SortOrderInput | SortOrder
    releaseReason?: SortOrderInput | SortOrder
    addedAt?: SortOrder
    _count?: InventoryItemCountOrderByAggregateInput
    _avg?: InventoryItemAvgOrderByAggregateInput
    _max?: InventoryItemMaxOrderByAggregateInput
    _min?: InventoryItemMinOrderByAggregateInput
    _sum?: InventoryItemSumOrderByAggregateInput
  }

  export type InventoryItemScalarWhereWithAggregatesInput = {
    AND?: InventoryItemScalarWhereWithAggregatesInput | InventoryItemScalarWhereWithAggregatesInput[]
    OR?: InventoryItemScalarWhereWithAggregatesInput[]
    NOT?: InventoryItemScalarWhereWithAggregatesInput | InventoryItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InventoryItem"> | string
    type?: EnumInventoryTypeWithAggregatesFilter<"InventoryItem"> | $Enums.InventoryType
    value?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    model?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    region?: StringWithAggregatesFilter<"InventoryItem"> | string
    capabilities?: StringNullableListFilter<"InventoryItem">
    monthlyCost?: FloatWithAggregatesFilter<"InventoryItem"> | number
    status?: EnumInventoryStatusWithAggregatesFilter<"InventoryItem"> | $Enums.InventoryStatus
    reservedBy?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    reservedAt?: DateTimeNullableWithAggregatesFilter<"InventoryItem"> | Date | string | null
    reservationExpires?: DateTimeNullableWithAggregatesFilter<"InventoryItem"> | Date | string | null
    releasedAt?: DateTimeNullableWithAggregatesFilter<"InventoryItem"> | Date | string | null
    releaseReason?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    addedAt?: DateTimeWithAggregatesFilter<"InventoryItem"> | Date | string
  }

  export type WebhookWhereInput = {
    AND?: WebhookWhereInput | WebhookWhereInput[]
    OR?: WebhookWhereInput[]
    NOT?: WebhookWhereInput | WebhookWhereInput[]
    id?: StringFilter<"Webhook"> | string
    url?: StringFilter<"Webhook"> | string
    events?: StringNullableListFilter<"Webhook">
    secret?: StringFilter<"Webhook"> | string
    customerId?: StringFilter<"Webhook"> | string
    description?: StringNullableFilter<"Webhook"> | string | null
    status?: EnumWebhookStatusFilter<"Webhook"> | $Enums.WebhookStatus
    createdAt?: DateTimeFilter<"Webhook"> | Date | string
    updatedAt?: DateTimeFilter<"Webhook"> | Date | string
  }

  export type WebhookOrderByWithRelationInput = {
    id?: SortOrder
    url?: SortOrder
    events?: SortOrder
    secret?: SortOrder
    customerId?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WebhookWhereInput | WebhookWhereInput[]
    OR?: WebhookWhereInput[]
    NOT?: WebhookWhereInput | WebhookWhereInput[]
    url?: StringFilter<"Webhook"> | string
    events?: StringNullableListFilter<"Webhook">
    secret?: StringFilter<"Webhook"> | string
    customerId?: StringFilter<"Webhook"> | string
    description?: StringNullableFilter<"Webhook"> | string | null
    status?: EnumWebhookStatusFilter<"Webhook"> | $Enums.WebhookStatus
    createdAt?: DateTimeFilter<"Webhook"> | Date | string
    updatedAt?: DateTimeFilter<"Webhook"> | Date | string
  }, "id">

  export type WebhookOrderByWithAggregationInput = {
    id?: SortOrder
    url?: SortOrder
    events?: SortOrder
    secret?: SortOrder
    customerId?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WebhookCountOrderByAggregateInput
    _max?: WebhookMaxOrderByAggregateInput
    _min?: WebhookMinOrderByAggregateInput
  }

  export type WebhookScalarWhereWithAggregatesInput = {
    AND?: WebhookScalarWhereWithAggregatesInput | WebhookScalarWhereWithAggregatesInput[]
    OR?: WebhookScalarWhereWithAggregatesInput[]
    NOT?: WebhookScalarWhereWithAggregatesInput | WebhookScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Webhook"> | string
    url?: StringWithAggregatesFilter<"Webhook"> | string
    events?: StringNullableListFilter<"Webhook">
    secret?: StringWithAggregatesFilter<"Webhook"> | string
    customerId?: StringWithAggregatesFilter<"Webhook"> | string
    description?: StringNullableWithAggregatesFilter<"Webhook"> | string | null
    status?: EnumWebhookStatusWithAggregatesFilter<"Webhook"> | $Enums.WebhookStatus
    createdAt?: DateTimeWithAggregatesFilter<"Webhook"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Webhook"> | Date | string
  }

  export type PhoneNumberCreateInput = {
    id?: string
    number: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: string | null
    smsUrl?: string | null
    status?: $Enums.PhoneNumberStatus
    purchasedAt?: Date | string
    releasedAt?: Date | string | null
    releaseReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portingRequests?: PortingRequestCreateNestedManyWithoutPhoneNumberInput
  }

  export type PhoneNumberUncheckedCreateInput = {
    id?: string
    number: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: string | null
    smsUrl?: string | null
    status?: $Enums.PhoneNumberStatus
    purchasedAt?: Date | string
    releasedAt?: Date | string | null
    releaseReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    portingRequests?: PortingRequestUncheckedCreateNestedManyWithoutPhoneNumberInput
  }

  export type PhoneNumberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portingRequests?: PortingRequestUpdateManyWithoutPhoneNumberNestedInput
  }

  export type PhoneNumberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    portingRequests?: PortingRequestUncheckedUpdateManyWithoutPhoneNumberNestedInput
  }

  export type PhoneNumberCreateManyInput = {
    id?: string
    number: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: string | null
    smsUrl?: string | null
    status?: $Enums.PhoneNumberStatus
    purchasedAt?: Date | string
    releasedAt?: Date | string | null
    releaseReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PhoneNumberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PhoneNumberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestCreateInput = {
    id?: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phoneNumber?: PhoneNumberCreateNestedOneWithoutPortingRequestsInput
  }

  export type PortingRequestUncheckedCreateInput = {
    id?: string
    currentNumber: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortingRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phoneNumber?: PhoneNumberUpdateOneWithoutPortingRequestsNestedInput
  }

  export type PortingRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentNumber?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestCreateManyInput = {
    id?: string
    currentNumber: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortingRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentNumber?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProvisioningJobCreateInput = {
    id?: string
    customerId: string
    phoneNumber: string
    deviceType: string
    deviceId?: string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: $Enums.JobPriority
    status?: $Enums.JobStatus
    progress?: number
    notes?: string | null
    errorMessage?: string | null
    completedAt?: Date | string | null
    failedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProvisioningJobUncheckedCreateInput = {
    id?: string
    customerId: string
    phoneNumber: string
    deviceType: string
    deviceId?: string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: $Enums.JobPriority
    status?: $Enums.JobStatus
    progress?: number
    notes?: string | null
    errorMessage?: string | null
    completedAt?: Date | string | null
    failedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProvisioningJobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    deviceType?: StringFieldUpdateOperationsInput | string
    deviceId?: NullableStringFieldUpdateOperationsInput | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: EnumJobPriorityFieldUpdateOperationsInput | $Enums.JobPriority
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    progress?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProvisioningJobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    deviceType?: StringFieldUpdateOperationsInput | string
    deviceId?: NullableStringFieldUpdateOperationsInput | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: EnumJobPriorityFieldUpdateOperationsInput | $Enums.JobPriority
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    progress?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProvisioningJobCreateManyInput = {
    id?: string
    customerId: string
    phoneNumber: string
    deviceType: string
    deviceId?: string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: $Enums.JobPriority
    status?: $Enums.JobStatus
    progress?: number
    notes?: string | null
    errorMessage?: string | null
    completedAt?: Date | string | null
    failedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProvisioningJobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    deviceType?: StringFieldUpdateOperationsInput | string
    deviceId?: NullableStringFieldUpdateOperationsInput | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: EnumJobPriorityFieldUpdateOperationsInput | $Enums.JobPriority
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    progress?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProvisioningJobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    phoneNumber?: StringFieldUpdateOperationsInput | string
    deviceType?: StringFieldUpdateOperationsInput | string
    deviceId?: NullableStringFieldUpdateOperationsInput | string | null
    configuration?: NullableJsonNullValueInput | InputJsonValue
    priority?: EnumJobPriorityFieldUpdateOperationsInput | $Enums.JobPriority
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    progress?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemCreateInput = {
    id?: string
    type: $Enums.InventoryType
    value?: string | null
    model?: string | null
    region: string
    capabilities?: InventoryItemCreatecapabilitiesInput | string[]
    monthlyCost?: number
    status?: $Enums.InventoryStatus
    reservedBy?: string | null
    reservedAt?: Date | string | null
    reservationExpires?: Date | string | null
    releasedAt?: Date | string | null
    releaseReason?: string | null
    addedAt?: Date | string
  }

  export type InventoryItemUncheckedCreateInput = {
    id?: string
    type: $Enums.InventoryType
    value?: string | null
    model?: string | null
    region: string
    capabilities?: InventoryItemCreatecapabilitiesInput | string[]
    monthlyCost?: number
    status?: $Enums.InventoryStatus
    reservedBy?: string | null
    reservedAt?: Date | string | null
    reservationExpires?: Date | string | null
    releasedAt?: Date | string | null
    releaseReason?: string | null
    addedAt?: Date | string
  }

  export type InventoryItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumInventoryTypeFieldUpdateOperationsInput | $Enums.InventoryType
    value?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    region?: StringFieldUpdateOperationsInput | string
    capabilities?: InventoryItemUpdatecapabilitiesInput | string[]
    monthlyCost?: FloatFieldUpdateOperationsInput | number
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    reservedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reservationExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumInventoryTypeFieldUpdateOperationsInput | $Enums.InventoryType
    value?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    region?: StringFieldUpdateOperationsInput | string
    capabilities?: InventoryItemUpdatecapabilitiesInput | string[]
    monthlyCost?: FloatFieldUpdateOperationsInput | number
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    reservedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reservationExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemCreateManyInput = {
    id?: string
    type: $Enums.InventoryType
    value?: string | null
    model?: string | null
    region: string
    capabilities?: InventoryItemCreatecapabilitiesInput | string[]
    monthlyCost?: number
    status?: $Enums.InventoryStatus
    reservedBy?: string | null
    reservedAt?: Date | string | null
    reservationExpires?: Date | string | null
    releasedAt?: Date | string | null
    releaseReason?: string | null
    addedAt?: Date | string
  }

  export type InventoryItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumInventoryTypeFieldUpdateOperationsInput | $Enums.InventoryType
    value?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    region?: StringFieldUpdateOperationsInput | string
    capabilities?: InventoryItemUpdatecapabilitiesInput | string[]
    monthlyCost?: FloatFieldUpdateOperationsInput | number
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    reservedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reservationExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumInventoryTypeFieldUpdateOperationsInput | $Enums.InventoryType
    value?: NullableStringFieldUpdateOperationsInput | string | null
    model?: NullableStringFieldUpdateOperationsInput | string | null
    region?: StringFieldUpdateOperationsInput | string
    capabilities?: InventoryItemUpdatecapabilitiesInput | string[]
    monthlyCost?: FloatFieldUpdateOperationsInput | number
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    reservedBy?: NullableStringFieldUpdateOperationsInput | string | null
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    reservationExpires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookCreateInput = {
    id?: string
    url: string
    events?: WebhookCreateeventsInput | string[]
    secret: string
    customerId: string
    description?: string | null
    status?: $Enums.WebhookStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookUncheckedCreateInput = {
    id?: string
    url: string
    events?: WebhookCreateeventsInput | string[]
    secret: string
    customerId: string
    description?: string | null
    status?: $Enums.WebhookStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    events?: WebhookUpdateeventsInput | string[]
    secret?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumWebhookStatusFieldUpdateOperationsInput | $Enums.WebhookStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    events?: WebhookUpdateeventsInput | string[]
    secret?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumWebhookStatusFieldUpdateOperationsInput | $Enums.WebhookStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookCreateManyInput = {
    id?: string
    url: string
    events?: WebhookCreateeventsInput | string[]
    secret: string
    customerId: string
    description?: string | null
    status?: $Enums.WebhookStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WebhookUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    events?: WebhookUpdateeventsInput | string[]
    secret?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumWebhookStatusFieldUpdateOperationsInput | $Enums.WebhookStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WebhookUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    events?: WebhookUpdateeventsInput | string[]
    secret?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumWebhookStatusFieldUpdateOperationsInput | $Enums.WebhookStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumPhoneNumberStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberStatus | EnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPhoneNumberStatusFilter<$PrismaModel> | $Enums.PhoneNumberStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PortingRequestListRelationFilter = {
    every?: PortingRequestWhereInput
    some?: PortingRequestWhereInput
    none?: PortingRequestWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PortingRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PhoneNumberCountOrderByAggregateInput = {
    id?: SortOrder
    number?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrder
    voiceUrl?: SortOrder
    smsUrl?: SortOrder
    status?: SortOrder
    purchasedAt?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PhoneNumberMaxOrderByAggregateInput = {
    id?: SortOrder
    number?: SortOrder
    customerId?: SortOrder
    voiceUrl?: SortOrder
    smsUrl?: SortOrder
    status?: SortOrder
    purchasedAt?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PhoneNumberMinOrderByAggregateInput = {
    id?: SortOrder
    number?: SortOrder
    customerId?: SortOrder
    voiceUrl?: SortOrder
    smsUrl?: SortOrder
    status?: SortOrder
    purchasedAt?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumPhoneNumberStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberStatus | EnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPhoneNumberStatusWithAggregatesFilter<$PrismaModel> | $Enums.PhoneNumberStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPhoneNumberStatusFilter<$PrismaModel>
    _max?: NestedEnumPhoneNumberStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumPortingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PortingStatus | EnumPortingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPortingStatusFilter<$PrismaModel> | $Enums.PortingStatus
  }

  export type PhoneNumberNullableScalarRelationFilter = {
    is?: PhoneNumberWhereInput | null
    isNot?: PhoneNumberWhereInput | null
  }

  export type PortingRequestCountOrderByAggregateInput = {
    id?: SortOrder
    currentNumber?: SortOrder
    currentCarrier?: SortOrder
    accountNumber?: SortOrder
    pin?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrder
    authorizedUser?: SortOrder
    serviceAddress?: SortOrder
    status?: SortOrder
    estimatedCompletion?: SortOrder
    notes?: SortOrder
    rejectionReason?: SortOrder
    completedAt?: SortOrder
    rejectedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortingRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    currentNumber?: SortOrder
    currentCarrier?: SortOrder
    accountNumber?: SortOrder
    pin?: SortOrder
    customerId?: SortOrder
    authorizedUser?: SortOrder
    status?: SortOrder
    estimatedCompletion?: SortOrder
    notes?: SortOrder
    rejectionReason?: SortOrder
    completedAt?: SortOrder
    rejectedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortingRequestMinOrderByAggregateInput = {
    id?: SortOrder
    currentNumber?: SortOrder
    currentCarrier?: SortOrder
    accountNumber?: SortOrder
    pin?: SortOrder
    customerId?: SortOrder
    authorizedUser?: SortOrder
    status?: SortOrder
    estimatedCompletion?: SortOrder
    notes?: SortOrder
    rejectionReason?: SortOrder
    completedAt?: SortOrder
    rejectedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumPortingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PortingStatus | EnumPortingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPortingStatusWithAggregatesFilter<$PrismaModel> | $Enums.PortingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPortingStatusFilter<$PrismaModel>
    _max?: NestedEnumPortingStatusFilter<$PrismaModel>
  }

  export type EnumJobPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.JobPriority | EnumJobPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumJobPriorityFilter<$PrismaModel> | $Enums.JobPriority
  }

  export type EnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ProvisioningJobCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    phoneNumber?: SortOrder
    deviceType?: SortOrder
    deviceId?: SortOrder
    configuration?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    notes?: SortOrder
    errorMessage?: SortOrder
    completedAt?: SortOrder
    failedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProvisioningJobAvgOrderByAggregateInput = {
    progress?: SortOrder
  }

  export type ProvisioningJobMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    phoneNumber?: SortOrder
    deviceType?: SortOrder
    deviceId?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    notes?: SortOrder
    errorMessage?: SortOrder
    completedAt?: SortOrder
    failedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProvisioningJobMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    phoneNumber?: SortOrder
    deviceType?: SortOrder
    deviceId?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    progress?: SortOrder
    notes?: SortOrder
    errorMessage?: SortOrder
    completedAt?: SortOrder
    failedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProvisioningJobSumOrderByAggregateInput = {
    progress?: SortOrder
  }

  export type EnumJobPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobPriority | EnumJobPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumJobPriorityWithAggregatesFilter<$PrismaModel> | $Enums.JobPriority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobPriorityFilter<$PrismaModel>
    _max?: NestedEnumJobPriorityFilter<$PrismaModel>
  }

  export type EnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumInventoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryType | EnumInventoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryTypeFilter<$PrismaModel> | $Enums.InventoryType
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumInventoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusFilter<$PrismaModel> | $Enums.InventoryStatus
  }

  export type InventoryItemCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    model?: SortOrder
    region?: SortOrder
    capabilities?: SortOrder
    monthlyCost?: SortOrder
    status?: SortOrder
    reservedBy?: SortOrder
    reservedAt?: SortOrder
    reservationExpires?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    addedAt?: SortOrder
  }

  export type InventoryItemAvgOrderByAggregateInput = {
    monthlyCost?: SortOrder
  }

  export type InventoryItemMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    model?: SortOrder
    region?: SortOrder
    monthlyCost?: SortOrder
    status?: SortOrder
    reservedBy?: SortOrder
    reservedAt?: SortOrder
    reservationExpires?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    addedAt?: SortOrder
  }

  export type InventoryItemMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    model?: SortOrder
    region?: SortOrder
    monthlyCost?: SortOrder
    status?: SortOrder
    reservedBy?: SortOrder
    reservedAt?: SortOrder
    reservationExpires?: SortOrder
    releasedAt?: SortOrder
    releaseReason?: SortOrder
    addedAt?: SortOrder
  }

  export type InventoryItemSumOrderByAggregateInput = {
    monthlyCost?: SortOrder
  }

  export type EnumInventoryTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryType | EnumInventoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryTypeWithAggregatesFilter<$PrismaModel> | $Enums.InventoryType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryTypeFilter<$PrismaModel>
    _max?: NestedEnumInventoryTypeFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumInventoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.InventoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryStatusFilter<$PrismaModel>
    _max?: NestedEnumInventoryStatusFilter<$PrismaModel>
  }

  export type EnumWebhookStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WebhookStatus | EnumWebhookStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWebhookStatusFilter<$PrismaModel> | $Enums.WebhookStatus
  }

  export type WebhookCountOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    events?: SortOrder
    secret?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookMaxOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    secret?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WebhookMinOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    secret?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumWebhookStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WebhookStatus | EnumWebhookStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWebhookStatusWithAggregatesFilter<$PrismaModel> | $Enums.WebhookStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWebhookStatusFilter<$PrismaModel>
    _max?: NestedEnumWebhookStatusFilter<$PrismaModel>
  }

  export type PortingRequestCreateNestedManyWithoutPhoneNumberInput = {
    create?: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput> | PortingRequestCreateWithoutPhoneNumberInput[] | PortingRequestUncheckedCreateWithoutPhoneNumberInput[]
    connectOrCreate?: PortingRequestCreateOrConnectWithoutPhoneNumberInput | PortingRequestCreateOrConnectWithoutPhoneNumberInput[]
    createMany?: PortingRequestCreateManyPhoneNumberInputEnvelope
    connect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
  }

  export type PortingRequestUncheckedCreateNestedManyWithoutPhoneNumberInput = {
    create?: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput> | PortingRequestCreateWithoutPhoneNumberInput[] | PortingRequestUncheckedCreateWithoutPhoneNumberInput[]
    connectOrCreate?: PortingRequestCreateOrConnectWithoutPhoneNumberInput | PortingRequestCreateOrConnectWithoutPhoneNumberInput[]
    createMany?: PortingRequestCreateManyPhoneNumberInputEnvelope
    connect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumPhoneNumberStatusFieldUpdateOperationsInput = {
    set?: $Enums.PhoneNumberStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type PortingRequestUpdateManyWithoutPhoneNumberNestedInput = {
    create?: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput> | PortingRequestCreateWithoutPhoneNumberInput[] | PortingRequestUncheckedCreateWithoutPhoneNumberInput[]
    connectOrCreate?: PortingRequestCreateOrConnectWithoutPhoneNumberInput | PortingRequestCreateOrConnectWithoutPhoneNumberInput[]
    upsert?: PortingRequestUpsertWithWhereUniqueWithoutPhoneNumberInput | PortingRequestUpsertWithWhereUniqueWithoutPhoneNumberInput[]
    createMany?: PortingRequestCreateManyPhoneNumberInputEnvelope
    set?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    disconnect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    delete?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    connect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    update?: PortingRequestUpdateWithWhereUniqueWithoutPhoneNumberInput | PortingRequestUpdateWithWhereUniqueWithoutPhoneNumberInput[]
    updateMany?: PortingRequestUpdateManyWithWhereWithoutPhoneNumberInput | PortingRequestUpdateManyWithWhereWithoutPhoneNumberInput[]
    deleteMany?: PortingRequestScalarWhereInput | PortingRequestScalarWhereInput[]
  }

  export type PortingRequestUncheckedUpdateManyWithoutPhoneNumberNestedInput = {
    create?: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput> | PortingRequestCreateWithoutPhoneNumberInput[] | PortingRequestUncheckedCreateWithoutPhoneNumberInput[]
    connectOrCreate?: PortingRequestCreateOrConnectWithoutPhoneNumberInput | PortingRequestCreateOrConnectWithoutPhoneNumberInput[]
    upsert?: PortingRequestUpsertWithWhereUniqueWithoutPhoneNumberInput | PortingRequestUpsertWithWhereUniqueWithoutPhoneNumberInput[]
    createMany?: PortingRequestCreateManyPhoneNumberInputEnvelope
    set?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    disconnect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    delete?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    connect?: PortingRequestWhereUniqueInput | PortingRequestWhereUniqueInput[]
    update?: PortingRequestUpdateWithWhereUniqueWithoutPhoneNumberInput | PortingRequestUpdateWithWhereUniqueWithoutPhoneNumberInput[]
    updateMany?: PortingRequestUpdateManyWithWhereWithoutPhoneNumberInput | PortingRequestUpdateManyWithWhereWithoutPhoneNumberInput[]
    deleteMany?: PortingRequestScalarWhereInput | PortingRequestScalarWhereInput[]
  }

  export type PhoneNumberCreateNestedOneWithoutPortingRequestsInput = {
    create?: XOR<PhoneNumberCreateWithoutPortingRequestsInput, PhoneNumberUncheckedCreateWithoutPortingRequestsInput>
    connectOrCreate?: PhoneNumberCreateOrConnectWithoutPortingRequestsInput
    connect?: PhoneNumberWhereUniqueInput
  }

  export type EnumPortingStatusFieldUpdateOperationsInput = {
    set?: $Enums.PortingStatus
  }

  export type PhoneNumberUpdateOneWithoutPortingRequestsNestedInput = {
    create?: XOR<PhoneNumberCreateWithoutPortingRequestsInput, PhoneNumberUncheckedCreateWithoutPortingRequestsInput>
    connectOrCreate?: PhoneNumberCreateOrConnectWithoutPortingRequestsInput
    upsert?: PhoneNumberUpsertWithoutPortingRequestsInput
    disconnect?: PhoneNumberWhereInput | boolean
    delete?: PhoneNumberWhereInput | boolean
    connect?: PhoneNumberWhereUniqueInput
    update?: XOR<XOR<PhoneNumberUpdateToOneWithWhereWithoutPortingRequestsInput, PhoneNumberUpdateWithoutPortingRequestsInput>, PhoneNumberUncheckedUpdateWithoutPortingRequestsInput>
  }

  export type EnumJobPriorityFieldUpdateOperationsInput = {
    set?: $Enums.JobPriority
  }

  export type EnumJobStatusFieldUpdateOperationsInput = {
    set?: $Enums.JobStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type InventoryItemCreatecapabilitiesInput = {
    set: string[]
  }

  export type EnumInventoryTypeFieldUpdateOperationsInput = {
    set?: $Enums.InventoryType
  }

  export type InventoryItemUpdatecapabilitiesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumInventoryStatusFieldUpdateOperationsInput = {
    set?: $Enums.InventoryStatus
  }

  export type WebhookCreateeventsInput = {
    set: string[]
  }

  export type WebhookUpdateeventsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumWebhookStatusFieldUpdateOperationsInput = {
    set?: $Enums.WebhookStatus
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumPhoneNumberStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberStatus | EnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPhoneNumberStatusFilter<$PrismaModel> | $Enums.PhoneNumberStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumPhoneNumberStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PhoneNumberStatus | EnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PhoneNumberStatus[] | ListEnumPhoneNumberStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPhoneNumberStatusWithAggregatesFilter<$PrismaModel> | $Enums.PhoneNumberStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPhoneNumberStatusFilter<$PrismaModel>
    _max?: NestedEnumPhoneNumberStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumPortingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PortingStatus | EnumPortingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPortingStatusFilter<$PrismaModel> | $Enums.PortingStatus
  }

  export type NestedEnumPortingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PortingStatus | EnumPortingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PortingStatus[] | ListEnumPortingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPortingStatusWithAggregatesFilter<$PrismaModel> | $Enums.PortingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPortingStatusFilter<$PrismaModel>
    _max?: NestedEnumPortingStatusFilter<$PrismaModel>
  }

  export type NestedEnumJobPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.JobPriority | EnumJobPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumJobPriorityFilter<$PrismaModel> | $Enums.JobPriority
  }

  export type NestedEnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
  }

  export type NestedEnumJobPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobPriority | EnumJobPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobPriority[] | ListEnumJobPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumJobPriorityWithAggregatesFilter<$PrismaModel> | $Enums.JobPriority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobPriorityFilter<$PrismaModel>
    _max?: NestedEnumJobPriorityFilter<$PrismaModel>
  }

  export type NestedEnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumInventoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryType | EnumInventoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryTypeFilter<$PrismaModel> | $Enums.InventoryType
  }

  export type NestedEnumInventoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusFilter<$PrismaModel> | $Enums.InventoryStatus
  }

  export type NestedEnumInventoryTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryType | EnumInventoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryType[] | ListEnumInventoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryTypeWithAggregatesFilter<$PrismaModel> | $Enums.InventoryType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryTypeFilter<$PrismaModel>
    _max?: NestedEnumInventoryTypeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.InventoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryStatusFilter<$PrismaModel>
    _max?: NestedEnumInventoryStatusFilter<$PrismaModel>
  }

  export type NestedEnumWebhookStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WebhookStatus | EnumWebhookStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWebhookStatusFilter<$PrismaModel> | $Enums.WebhookStatus
  }

  export type NestedEnumWebhookStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WebhookStatus | EnumWebhookStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WebhookStatus[] | ListEnumWebhookStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWebhookStatusWithAggregatesFilter<$PrismaModel> | $Enums.WebhookStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWebhookStatusFilter<$PrismaModel>
    _max?: NestedEnumWebhookStatusFilter<$PrismaModel>
  }

  export type PortingRequestCreateWithoutPhoneNumberInput = {
    id?: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortingRequestUncheckedCreateWithoutPhoneNumberInput = {
    id?: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortingRequestCreateOrConnectWithoutPhoneNumberInput = {
    where: PortingRequestWhereUniqueInput
    create: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput>
  }

  export type PortingRequestCreateManyPhoneNumberInputEnvelope = {
    data: PortingRequestCreateManyPhoneNumberInput | PortingRequestCreateManyPhoneNumberInput[]
    skipDuplicates?: boolean
  }

  export type PortingRequestUpsertWithWhereUniqueWithoutPhoneNumberInput = {
    where: PortingRequestWhereUniqueInput
    update: XOR<PortingRequestUpdateWithoutPhoneNumberInput, PortingRequestUncheckedUpdateWithoutPhoneNumberInput>
    create: XOR<PortingRequestCreateWithoutPhoneNumberInput, PortingRequestUncheckedCreateWithoutPhoneNumberInput>
  }

  export type PortingRequestUpdateWithWhereUniqueWithoutPhoneNumberInput = {
    where: PortingRequestWhereUniqueInput
    data: XOR<PortingRequestUpdateWithoutPhoneNumberInput, PortingRequestUncheckedUpdateWithoutPhoneNumberInput>
  }

  export type PortingRequestUpdateManyWithWhereWithoutPhoneNumberInput = {
    where: PortingRequestScalarWhereInput
    data: XOR<PortingRequestUpdateManyMutationInput, PortingRequestUncheckedUpdateManyWithoutPhoneNumberInput>
  }

  export type PortingRequestScalarWhereInput = {
    AND?: PortingRequestScalarWhereInput | PortingRequestScalarWhereInput[]
    OR?: PortingRequestScalarWhereInput[]
    NOT?: PortingRequestScalarWhereInput | PortingRequestScalarWhereInput[]
    id?: StringFilter<"PortingRequest"> | string
    currentNumber?: StringFilter<"PortingRequest"> | string
    currentCarrier?: StringFilter<"PortingRequest"> | string
    accountNumber?: StringFilter<"PortingRequest"> | string
    pin?: StringNullableFilter<"PortingRequest"> | string | null
    customerId?: StringFilter<"PortingRequest"> | string
    billingAddress?: JsonNullableFilter<"PortingRequest">
    authorizedUser?: StringNullableFilter<"PortingRequest"> | string | null
    serviceAddress?: JsonNullableFilter<"PortingRequest">
    status?: EnumPortingStatusFilter<"PortingRequest"> | $Enums.PortingStatus
    estimatedCompletion?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    notes?: StringNullableFilter<"PortingRequest"> | string | null
    rejectionReason?: StringNullableFilter<"PortingRequest"> | string | null
    completedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    rejectedAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"PortingRequest"> | Date | string | null
    cancellationReason?: StringNullableFilter<"PortingRequest"> | string | null
    createdAt?: DateTimeFilter<"PortingRequest"> | Date | string
    updatedAt?: DateTimeFilter<"PortingRequest"> | Date | string
  }

  export type PhoneNumberCreateWithoutPortingRequestsInput = {
    id?: string
    number: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: string | null
    smsUrl?: string | null
    status?: $Enums.PhoneNumberStatus
    purchasedAt?: Date | string
    releasedAt?: Date | string | null
    releaseReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PhoneNumberUncheckedCreateWithoutPortingRequestsInput = {
    id?: string
    number: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: string | null
    smsUrl?: string | null
    status?: $Enums.PhoneNumberStatus
    purchasedAt?: Date | string
    releasedAt?: Date | string | null
    releaseReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PhoneNumberCreateOrConnectWithoutPortingRequestsInput = {
    where: PhoneNumberWhereUniqueInput
    create: XOR<PhoneNumberCreateWithoutPortingRequestsInput, PhoneNumberUncheckedCreateWithoutPortingRequestsInput>
  }

  export type PhoneNumberUpsertWithoutPortingRequestsInput = {
    update: XOR<PhoneNumberUpdateWithoutPortingRequestsInput, PhoneNumberUncheckedUpdateWithoutPortingRequestsInput>
    create: XOR<PhoneNumberCreateWithoutPortingRequestsInput, PhoneNumberUncheckedCreateWithoutPortingRequestsInput>
    where?: PhoneNumberWhereInput
  }

  export type PhoneNumberUpdateToOneWithWhereWithoutPortingRequestsInput = {
    where?: PhoneNumberWhereInput
    data: XOR<PhoneNumberUpdateWithoutPortingRequestsInput, PhoneNumberUncheckedUpdateWithoutPortingRequestsInput>
  }

  export type PhoneNumberUpdateWithoutPortingRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PhoneNumberUncheckedUpdateWithoutPortingRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    voiceUrl?: NullableStringFieldUpdateOperationsInput | string | null
    smsUrl?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPhoneNumberStatusFieldUpdateOperationsInput | $Enums.PhoneNumberStatus
    purchasedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    releasedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    releaseReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestCreateManyPhoneNumberInput = {
    id?: string
    currentCarrier: string
    accountNumber: string
    pin?: string | null
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PortingStatus
    estimatedCompletion?: Date | string | null
    notes?: string | null
    rejectionReason?: string | null
    completedAt?: Date | string | null
    rejectedAt?: Date | string | null
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PortingRequestUpdateWithoutPhoneNumberInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestUncheckedUpdateWithoutPhoneNumberInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortingRequestUncheckedUpdateManyWithoutPhoneNumberInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentCarrier?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    pin?: NullableStringFieldUpdateOperationsInput | string | null
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    authorizedUser?: NullableStringFieldUpdateOperationsInput | string | null
    serviceAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPortingStatusFieldUpdateOperationsInput | $Enums.PortingStatus
    estimatedCompletion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}