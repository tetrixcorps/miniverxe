
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
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model ESIM
 * 
 */
export type ESIM = $Result.DefaultSelection<Prisma.$ESIMPayload>
/**
 * Model ESIMProfile
 * 
 */
export type ESIMProfile = $Result.DefaultSelection<Prisma.$ESIMProfilePayload>
/**
 * Model DataPlan
 * 
 */
export type DataPlan = $Result.DefaultSelection<Prisma.$DataPlanPayload>
/**
 * Model Payment
 * 
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>
/**
 * Model Webhook
 * 
 */
export type Webhook = $Result.DefaultSelection<Prisma.$WebhookPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OrderStatus: {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const ESIMStatus: {
  PENDING: 'PENDING',
  ACTIVATED: 'ACTIVATED',
  DEACTIVATED: 'DEACTIVATED',
  EXPIRED: 'EXPIRED'
};

export type ESIMStatus = (typeof ESIMStatus)[keyof typeof ESIMStatus]


export const PaymentStatus: {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
};

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]


export const WebhookStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export type WebhookStatus = (typeof WebhookStatus)[keyof typeof WebhookStatus]

}

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type ESIMStatus = $Enums.ESIMStatus

export const ESIMStatus: typeof $Enums.ESIMStatus

export type PaymentStatus = $Enums.PaymentStatus

export const PaymentStatus: typeof $Enums.PaymentStatus

export type WebhookStatus = $Enums.WebhookStatus

export const WebhookStatus: typeof $Enums.WebhookStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Orders
 * const orders = await prisma.order.findMany()
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
   * // Fetch zero or more Orders
   * const orders = await prisma.order.findMany()
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
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.eSIM`: Exposes CRUD operations for the **ESIM** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ESIMS
    * const eSIMS = await prisma.eSIM.findMany()
    * ```
    */
  get eSIM(): Prisma.ESIMDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.eSIMProfile`: Exposes CRUD operations for the **ESIMProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ESIMProfiles
    * const eSIMProfiles = await prisma.eSIMProfile.findMany()
    * ```
    */
  get eSIMProfile(): Prisma.ESIMProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dataPlan`: Exposes CRUD operations for the **DataPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DataPlans
    * const dataPlans = await prisma.dataPlan.findMany()
    * ```
    */
  get dataPlan(): Prisma.DataPlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Payments
    * const payments = await prisma.payment.findMany()
    * ```
    */
  get payment(): Prisma.PaymentDelegate<ExtArgs, ClientOptions>;

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
    Order: 'Order',
    ESIM: 'ESIM',
    ESIMProfile: 'ESIMProfile',
    DataPlan: 'DataPlan',
    Payment: 'Payment',
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
      modelProps: "order" | "eSIM" | "eSIMProfile" | "dataPlan" | "payment" | "webhook"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      ESIM: {
        payload: Prisma.$ESIMPayload<ExtArgs>
        fields: Prisma.ESIMFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ESIMFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ESIMFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          findFirst: {
            args: Prisma.ESIMFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ESIMFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          findMany: {
            args: Prisma.ESIMFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>[]
          }
          create: {
            args: Prisma.ESIMCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          createMany: {
            args: Prisma.ESIMCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ESIMCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>[]
          }
          delete: {
            args: Prisma.ESIMDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          update: {
            args: Prisma.ESIMUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          deleteMany: {
            args: Prisma.ESIMDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ESIMUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ESIMUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>[]
          }
          upsert: {
            args: Prisma.ESIMUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMPayload>
          }
          aggregate: {
            args: Prisma.ESIMAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateESIM>
          }
          groupBy: {
            args: Prisma.ESIMGroupByArgs<ExtArgs>
            result: $Utils.Optional<ESIMGroupByOutputType>[]
          }
          count: {
            args: Prisma.ESIMCountArgs<ExtArgs>
            result: $Utils.Optional<ESIMCountAggregateOutputType> | number
          }
        }
      }
      ESIMProfile: {
        payload: Prisma.$ESIMProfilePayload<ExtArgs>
        fields: Prisma.ESIMProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ESIMProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ESIMProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          findFirst: {
            args: Prisma.ESIMProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ESIMProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          findMany: {
            args: Prisma.ESIMProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>[]
          }
          create: {
            args: Prisma.ESIMProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          createMany: {
            args: Prisma.ESIMProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ESIMProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>[]
          }
          delete: {
            args: Prisma.ESIMProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          update: {
            args: Prisma.ESIMProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          deleteMany: {
            args: Prisma.ESIMProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ESIMProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ESIMProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>[]
          }
          upsert: {
            args: Prisma.ESIMProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ESIMProfilePayload>
          }
          aggregate: {
            args: Prisma.ESIMProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateESIMProfile>
          }
          groupBy: {
            args: Prisma.ESIMProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<ESIMProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.ESIMProfileCountArgs<ExtArgs>
            result: $Utils.Optional<ESIMProfileCountAggregateOutputType> | number
          }
        }
      }
      DataPlan: {
        payload: Prisma.$DataPlanPayload<ExtArgs>
        fields: Prisma.DataPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DataPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DataPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          findFirst: {
            args: Prisma.DataPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DataPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          findMany: {
            args: Prisma.DataPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>[]
          }
          create: {
            args: Prisma.DataPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          createMany: {
            args: Prisma.DataPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DataPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>[]
          }
          delete: {
            args: Prisma.DataPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          update: {
            args: Prisma.DataPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          deleteMany: {
            args: Prisma.DataPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DataPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DataPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>[]
          }
          upsert: {
            args: Prisma.DataPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataPlanPayload>
          }
          aggregate: {
            args: Prisma.DataPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDataPlan>
          }
          groupBy: {
            args: Prisma.DataPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<DataPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.DataPlanCountArgs<ExtArgs>
            result: $Utils.Optional<DataPlanCountAggregateOutputType> | number
          }
        }
      }
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>
        fields: Prisma.PaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePayment>
          }
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number
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
    order?: OrderOmit
    eSIM?: ESIMOmit
    eSIMProfile?: ESIMProfileOmit
    dataPlan?: DataPlanOmit
    payment?: PaymentOmit
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
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    esims: number
    payments: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    esims?: boolean | OrderCountOutputTypeCountEsimsArgs
    payments?: boolean | OrderCountOutputTypeCountPaymentsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountEsimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ESIMWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
  }


  /**
   * Count Type ESIMCountOutputType
   */

  export type ESIMCountOutputType = {
    profiles: number
  }

  export type ESIMCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profiles?: boolean | ESIMCountOutputTypeCountProfilesArgs
  }

  // Custom InputTypes
  /**
   * ESIMCountOutputType without action
   */
  export type ESIMCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMCountOutputType
     */
    select?: ESIMCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ESIMCountOutputType without action
   */
  export type ESIMCountOutputTypeCountProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ESIMProfileWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    quantity: number | null
    refundAmount: number | null
  }

  export type OrderSumAggregateOutputType = {
    quantity: number | null
    refundAmount: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    customerId: string | null
    esimType: string | null
    dataPlan: string | null
    duration: string | null
    region: string | null
    quantity: number | null
    status: $Enums.OrderStatus | null
    trackingId: string | null
    estimatedDelivery: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    refundAmount: number | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    customerId: string | null
    esimType: string | null
    dataPlan: string | null
    duration: string | null
    region: string | null
    quantity: number | null
    status: $Enums.OrderStatus | null
    trackingId: string | null
    estimatedDelivery: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    cancelledAt: Date | null
    cancellationReason: string | null
    refundAmount: number | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    customerId: number
    esimType: number
    dataPlan: number
    duration: number
    region: number
    quantity: number
    status: number
    trackingId: number
    estimatedDelivery: number
    createdAt: number
    updatedAt: number
    cancelledAt: number
    cancellationReason: number
    refundAmount: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    quantity?: true
    refundAmount?: true
  }

  export type OrderSumAggregateInputType = {
    quantity?: true
    refundAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    customerId?: true
    esimType?: true
    dataPlan?: true
    duration?: true
    region?: true
    quantity?: true
    status?: true
    trackingId?: true
    estimatedDelivery?: true
    createdAt?: true
    updatedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    refundAmount?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    customerId?: true
    esimType?: true
    dataPlan?: true
    duration?: true
    region?: true
    quantity?: true
    status?: true
    trackingId?: true
    estimatedDelivery?: true
    createdAt?: true
    updatedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    refundAmount?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    customerId?: true
    esimType?: true
    dataPlan?: true
    duration?: true
    region?: true
    quantity?: true
    status?: true
    trackingId?: true
    estimatedDelivery?: true
    createdAt?: true
    updatedAt?: true
    cancelledAt?: true
    cancellationReason?: true
    refundAmount?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity: number
    status: $Enums.OrderStatus
    trackingId: string | null
    estimatedDelivery: Date | null
    createdAt: Date
    updatedAt: Date
    cancelledAt: Date | null
    cancellationReason: string | null
    refundAmount: number | null
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    esimType?: boolean
    dataPlan?: boolean
    duration?: boolean
    region?: boolean
    quantity?: boolean
    status?: boolean
    trackingId?: boolean
    estimatedDelivery?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    refundAmount?: boolean
    esims?: boolean | Order$esimsArgs<ExtArgs>
    payments?: boolean | Order$paymentsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    esimType?: boolean
    dataPlan?: boolean
    duration?: boolean
    region?: boolean
    quantity?: boolean
    status?: boolean
    trackingId?: boolean
    estimatedDelivery?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    refundAmount?: boolean
  }, ExtArgs["result"]["order"]>

  export type OrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    esimType?: boolean
    dataPlan?: boolean
    duration?: boolean
    region?: boolean
    quantity?: boolean
    status?: boolean
    trackingId?: boolean
    estimatedDelivery?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    refundAmount?: boolean
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    customerId?: boolean
    esimType?: boolean
    dataPlan?: boolean
    duration?: boolean
    region?: boolean
    quantity?: boolean
    status?: boolean
    trackingId?: boolean
    estimatedDelivery?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cancelledAt?: boolean
    cancellationReason?: boolean
    refundAmount?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customerId" | "esimType" | "dataPlan" | "duration" | "region" | "quantity" | "status" | "trackingId" | "estimatedDelivery" | "createdAt" | "updatedAt" | "cancelledAt" | "cancellationReason" | "refundAmount", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    esims?: boolean | Order$esimsArgs<ExtArgs>
    payments?: boolean | Order$paymentsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      esims: Prisma.$ESIMPayload<ExtArgs>[]
      payments: Prisma.$PaymentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerId: string
      esimType: string
      dataPlan: string
      duration: string
      region: string
      quantity: number
      status: $Enums.OrderStatus
      trackingId: string | null
      estimatedDelivery: Date | null
      createdAt: Date
      updatedAt: Date
      cancelledAt: Date | null
      cancellationReason: string | null
      refundAmount: number | null
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
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
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
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
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    esims<T extends Order$esimsArgs<ExtArgs> = {}>(args?: Subset<T, Order$esimsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    payments<T extends Order$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, Order$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly customerId: FieldRef<"Order", 'String'>
    readonly esimType: FieldRef<"Order", 'String'>
    readonly dataPlan: FieldRef<"Order", 'String'>
    readonly duration: FieldRef<"Order", 'String'>
    readonly region: FieldRef<"Order", 'String'>
    readonly quantity: FieldRef<"Order", 'Int'>
    readonly status: FieldRef<"Order", 'OrderStatus'>
    readonly trackingId: FieldRef<"Order", 'String'>
    readonly estimatedDelivery: FieldRef<"Order", 'DateTime'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
    readonly cancelledAt: FieldRef<"Order", 'DateTime'>
    readonly cancellationReason: FieldRef<"Order", 'String'>
    readonly refundAmount: FieldRef<"Order", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order.esims
   */
  export type Order$esimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    where?: ESIMWhereInput
    orderBy?: ESIMOrderByWithRelationInput | ESIMOrderByWithRelationInput[]
    cursor?: ESIMWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ESIMScalarFieldEnum | ESIMScalarFieldEnum[]
  }

  /**
   * Order.payments
   */
  export type Order$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    cursor?: PaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model ESIM
   */

  export type AggregateESIM = {
    _count: ESIMCountAggregateOutputType | null
    _min: ESIMMinAggregateOutputType | null
    _max: ESIMMaxAggregateOutputType | null
  }

  export type ESIMMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    activationCode: string | null
    status: $Enums.ESIMStatus | null
    activatedAt: Date | null
    deactivatedAt: Date | null
    deactivationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ESIMMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    activationCode: string | null
    status: $Enums.ESIMStatus | null
    activatedAt: Date | null
    deactivatedAt: Date | null
    deactivationReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ESIMCountAggregateOutputType = {
    id: number
    orderId: number
    activationCode: number
    deviceInfo: number
    status: number
    activatedAt: number
    deactivatedAt: number
    deactivationReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ESIMMinAggregateInputType = {
    id?: true
    orderId?: true
    activationCode?: true
    status?: true
    activatedAt?: true
    deactivatedAt?: true
    deactivationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ESIMMaxAggregateInputType = {
    id?: true
    orderId?: true
    activationCode?: true
    status?: true
    activatedAt?: true
    deactivatedAt?: true
    deactivationReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ESIMCountAggregateInputType = {
    id?: true
    orderId?: true
    activationCode?: true
    deviceInfo?: true
    status?: true
    activatedAt?: true
    deactivatedAt?: true
    deactivationReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ESIMAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ESIM to aggregate.
     */
    where?: ESIMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMS to fetch.
     */
    orderBy?: ESIMOrderByWithRelationInput | ESIMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ESIMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ESIMS
    **/
    _count?: true | ESIMCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ESIMMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ESIMMaxAggregateInputType
  }

  export type GetESIMAggregateType<T extends ESIMAggregateArgs> = {
        [P in keyof T & keyof AggregateESIM]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateESIM[P]>
      : GetScalarType<T[P], AggregateESIM[P]>
  }




  export type ESIMGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ESIMWhereInput
    orderBy?: ESIMOrderByWithAggregationInput | ESIMOrderByWithAggregationInput[]
    by: ESIMScalarFieldEnum[] | ESIMScalarFieldEnum
    having?: ESIMScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ESIMCountAggregateInputType | true
    _min?: ESIMMinAggregateInputType
    _max?: ESIMMaxAggregateInputType
  }

  export type ESIMGroupByOutputType = {
    id: string
    orderId: string
    activationCode: string
    deviceInfo: JsonValue | null
    status: $Enums.ESIMStatus
    activatedAt: Date | null
    deactivatedAt: Date | null
    deactivationReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: ESIMCountAggregateOutputType | null
    _min: ESIMMinAggregateOutputType | null
    _max: ESIMMaxAggregateOutputType | null
  }

  type GetESIMGroupByPayload<T extends ESIMGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ESIMGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ESIMGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ESIMGroupByOutputType[P]>
            : GetScalarType<T[P], ESIMGroupByOutputType[P]>
        }
      >
    >


  export type ESIMSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    activationCode?: boolean
    deviceInfo?: boolean
    status?: boolean
    activatedAt?: boolean
    deactivatedAt?: boolean
    deactivationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    profiles?: boolean | ESIM$profilesArgs<ExtArgs>
    _count?: boolean | ESIMCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIM"]>

  export type ESIMSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    activationCode?: boolean
    deviceInfo?: boolean
    status?: boolean
    activatedAt?: boolean
    deactivatedAt?: boolean
    deactivationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIM"]>

  export type ESIMSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    activationCode?: boolean
    deviceInfo?: boolean
    status?: boolean
    activatedAt?: boolean
    deactivatedAt?: boolean
    deactivationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIM"]>

  export type ESIMSelectScalar = {
    id?: boolean
    orderId?: boolean
    activationCode?: boolean
    deviceInfo?: boolean
    status?: boolean
    activatedAt?: boolean
    deactivatedAt?: boolean
    deactivationReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ESIMOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderId" | "activationCode" | "deviceInfo" | "status" | "activatedAt" | "deactivatedAt" | "deactivationReason" | "createdAt" | "updatedAt", ExtArgs["result"]["eSIM"]>
  export type ESIMInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    profiles?: boolean | ESIM$profilesArgs<ExtArgs>
    _count?: boolean | ESIMCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ESIMIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type ESIMIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $ESIMPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ESIM"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      profiles: Prisma.$ESIMProfilePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      activationCode: string
      deviceInfo: Prisma.JsonValue | null
      status: $Enums.ESIMStatus
      activatedAt: Date | null
      deactivatedAt: Date | null
      deactivationReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["eSIM"]>
    composites: {}
  }

  type ESIMGetPayload<S extends boolean | null | undefined | ESIMDefaultArgs> = $Result.GetResult<Prisma.$ESIMPayload, S>

  type ESIMCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ESIMFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ESIMCountAggregateInputType | true
    }

  export interface ESIMDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ESIM'], meta: { name: 'ESIM' } }
    /**
     * Find zero or one ESIM that matches the filter.
     * @param {ESIMFindUniqueArgs} args - Arguments to find a ESIM
     * @example
     * // Get one ESIM
     * const eSIM = await prisma.eSIM.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ESIMFindUniqueArgs>(args: SelectSubset<T, ESIMFindUniqueArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ESIM that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ESIMFindUniqueOrThrowArgs} args - Arguments to find a ESIM
     * @example
     * // Get one ESIM
     * const eSIM = await prisma.eSIM.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ESIMFindUniqueOrThrowArgs>(args: SelectSubset<T, ESIMFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ESIM that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMFindFirstArgs} args - Arguments to find a ESIM
     * @example
     * // Get one ESIM
     * const eSIM = await prisma.eSIM.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ESIMFindFirstArgs>(args?: SelectSubset<T, ESIMFindFirstArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ESIM that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMFindFirstOrThrowArgs} args - Arguments to find a ESIM
     * @example
     * // Get one ESIM
     * const eSIM = await prisma.eSIM.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ESIMFindFirstOrThrowArgs>(args?: SelectSubset<T, ESIMFindFirstOrThrowArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ESIMS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ESIMS
     * const eSIMS = await prisma.eSIM.findMany()
     * 
     * // Get first 10 ESIMS
     * const eSIMS = await prisma.eSIM.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const eSIMWithIdOnly = await prisma.eSIM.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ESIMFindManyArgs>(args?: SelectSubset<T, ESIMFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ESIM.
     * @param {ESIMCreateArgs} args - Arguments to create a ESIM.
     * @example
     * // Create one ESIM
     * const ESIM = await prisma.eSIM.create({
     *   data: {
     *     // ... data to create a ESIM
     *   }
     * })
     * 
     */
    create<T extends ESIMCreateArgs>(args: SelectSubset<T, ESIMCreateArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ESIMS.
     * @param {ESIMCreateManyArgs} args - Arguments to create many ESIMS.
     * @example
     * // Create many ESIMS
     * const eSIM = await prisma.eSIM.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ESIMCreateManyArgs>(args?: SelectSubset<T, ESIMCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ESIMS and returns the data saved in the database.
     * @param {ESIMCreateManyAndReturnArgs} args - Arguments to create many ESIMS.
     * @example
     * // Create many ESIMS
     * const eSIM = await prisma.eSIM.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ESIMS and only return the `id`
     * const eSIMWithIdOnly = await prisma.eSIM.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ESIMCreateManyAndReturnArgs>(args?: SelectSubset<T, ESIMCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ESIM.
     * @param {ESIMDeleteArgs} args - Arguments to delete one ESIM.
     * @example
     * // Delete one ESIM
     * const ESIM = await prisma.eSIM.delete({
     *   where: {
     *     // ... filter to delete one ESIM
     *   }
     * })
     * 
     */
    delete<T extends ESIMDeleteArgs>(args: SelectSubset<T, ESIMDeleteArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ESIM.
     * @param {ESIMUpdateArgs} args - Arguments to update one ESIM.
     * @example
     * // Update one ESIM
     * const eSIM = await prisma.eSIM.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ESIMUpdateArgs>(args: SelectSubset<T, ESIMUpdateArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ESIMS.
     * @param {ESIMDeleteManyArgs} args - Arguments to filter ESIMS to delete.
     * @example
     * // Delete a few ESIMS
     * const { count } = await prisma.eSIM.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ESIMDeleteManyArgs>(args?: SelectSubset<T, ESIMDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ESIMS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ESIMS
     * const eSIM = await prisma.eSIM.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ESIMUpdateManyArgs>(args: SelectSubset<T, ESIMUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ESIMS and returns the data updated in the database.
     * @param {ESIMUpdateManyAndReturnArgs} args - Arguments to update many ESIMS.
     * @example
     * // Update many ESIMS
     * const eSIM = await prisma.eSIM.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ESIMS and only return the `id`
     * const eSIMWithIdOnly = await prisma.eSIM.updateManyAndReturn({
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
    updateManyAndReturn<T extends ESIMUpdateManyAndReturnArgs>(args: SelectSubset<T, ESIMUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ESIM.
     * @param {ESIMUpsertArgs} args - Arguments to update or create a ESIM.
     * @example
     * // Update or create a ESIM
     * const eSIM = await prisma.eSIM.upsert({
     *   create: {
     *     // ... data to create a ESIM
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ESIM we want to update
     *   }
     * })
     */
    upsert<T extends ESIMUpsertArgs>(args: SelectSubset<T, ESIMUpsertArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ESIMS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMCountArgs} args - Arguments to filter ESIMS to count.
     * @example
     * // Count the number of ESIMS
     * const count = await prisma.eSIM.count({
     *   where: {
     *     // ... the filter for the ESIMS we want to count
     *   }
     * })
    **/
    count<T extends ESIMCountArgs>(
      args?: Subset<T, ESIMCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ESIMCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ESIM.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ESIMAggregateArgs>(args: Subset<T, ESIMAggregateArgs>): Prisma.PrismaPromise<GetESIMAggregateType<T>>

    /**
     * Group by ESIM.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMGroupByArgs} args - Group by arguments.
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
      T extends ESIMGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ESIMGroupByArgs['orderBy'] }
        : { orderBy?: ESIMGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ESIMGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetESIMGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ESIM model
   */
  readonly fields: ESIMFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ESIM.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ESIMClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    profiles<T extends ESIM$profilesArgs<ExtArgs> = {}>(args?: Subset<T, ESIM$profilesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the ESIM model
   */
  interface ESIMFieldRefs {
    readonly id: FieldRef<"ESIM", 'String'>
    readonly orderId: FieldRef<"ESIM", 'String'>
    readonly activationCode: FieldRef<"ESIM", 'String'>
    readonly deviceInfo: FieldRef<"ESIM", 'Json'>
    readonly status: FieldRef<"ESIM", 'ESIMStatus'>
    readonly activatedAt: FieldRef<"ESIM", 'DateTime'>
    readonly deactivatedAt: FieldRef<"ESIM", 'DateTime'>
    readonly deactivationReason: FieldRef<"ESIM", 'String'>
    readonly createdAt: FieldRef<"ESIM", 'DateTime'>
    readonly updatedAt: FieldRef<"ESIM", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ESIM findUnique
   */
  export type ESIMFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter, which ESIM to fetch.
     */
    where: ESIMWhereUniqueInput
  }

  /**
   * ESIM findUniqueOrThrow
   */
  export type ESIMFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter, which ESIM to fetch.
     */
    where: ESIMWhereUniqueInput
  }

  /**
   * ESIM findFirst
   */
  export type ESIMFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter, which ESIM to fetch.
     */
    where?: ESIMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMS to fetch.
     */
    orderBy?: ESIMOrderByWithRelationInput | ESIMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ESIMS.
     */
    cursor?: ESIMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ESIMS.
     */
    distinct?: ESIMScalarFieldEnum | ESIMScalarFieldEnum[]
  }

  /**
   * ESIM findFirstOrThrow
   */
  export type ESIMFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter, which ESIM to fetch.
     */
    where?: ESIMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMS to fetch.
     */
    orderBy?: ESIMOrderByWithRelationInput | ESIMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ESIMS.
     */
    cursor?: ESIMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ESIMS.
     */
    distinct?: ESIMScalarFieldEnum | ESIMScalarFieldEnum[]
  }

  /**
   * ESIM findMany
   */
  export type ESIMFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter, which ESIMS to fetch.
     */
    where?: ESIMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMS to fetch.
     */
    orderBy?: ESIMOrderByWithRelationInput | ESIMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ESIMS.
     */
    cursor?: ESIMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMS.
     */
    skip?: number
    distinct?: ESIMScalarFieldEnum | ESIMScalarFieldEnum[]
  }

  /**
   * ESIM create
   */
  export type ESIMCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * The data needed to create a ESIM.
     */
    data: XOR<ESIMCreateInput, ESIMUncheckedCreateInput>
  }

  /**
   * ESIM createMany
   */
  export type ESIMCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ESIMS.
     */
    data: ESIMCreateManyInput | ESIMCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ESIM createManyAndReturn
   */
  export type ESIMCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * The data used to create many ESIMS.
     */
    data: ESIMCreateManyInput | ESIMCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ESIM update
   */
  export type ESIMUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * The data needed to update a ESIM.
     */
    data: XOR<ESIMUpdateInput, ESIMUncheckedUpdateInput>
    /**
     * Choose, which ESIM to update.
     */
    where: ESIMWhereUniqueInput
  }

  /**
   * ESIM updateMany
   */
  export type ESIMUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ESIMS.
     */
    data: XOR<ESIMUpdateManyMutationInput, ESIMUncheckedUpdateManyInput>
    /**
     * Filter which ESIMS to update
     */
    where?: ESIMWhereInput
    /**
     * Limit how many ESIMS to update.
     */
    limit?: number
  }

  /**
   * ESIM updateManyAndReturn
   */
  export type ESIMUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * The data used to update ESIMS.
     */
    data: XOR<ESIMUpdateManyMutationInput, ESIMUncheckedUpdateManyInput>
    /**
     * Filter which ESIMS to update
     */
    where?: ESIMWhereInput
    /**
     * Limit how many ESIMS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ESIM upsert
   */
  export type ESIMUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * The filter to search for the ESIM to update in case it exists.
     */
    where: ESIMWhereUniqueInput
    /**
     * In case the ESIM found by the `where` argument doesn't exist, create a new ESIM with this data.
     */
    create: XOR<ESIMCreateInput, ESIMUncheckedCreateInput>
    /**
     * In case the ESIM was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ESIMUpdateInput, ESIMUncheckedUpdateInput>
  }

  /**
   * ESIM delete
   */
  export type ESIMDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
    /**
     * Filter which ESIM to delete.
     */
    where: ESIMWhereUniqueInput
  }

  /**
   * ESIM deleteMany
   */
  export type ESIMDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ESIMS to delete
     */
    where?: ESIMWhereInput
    /**
     * Limit how many ESIMS to delete.
     */
    limit?: number
  }

  /**
   * ESIM.profiles
   */
  export type ESIM$profilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    where?: ESIMProfileWhereInput
    orderBy?: ESIMProfileOrderByWithRelationInput | ESIMProfileOrderByWithRelationInput[]
    cursor?: ESIMProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ESIMProfileScalarFieldEnum | ESIMProfileScalarFieldEnum[]
  }

  /**
   * ESIM without action
   */
  export type ESIMDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIM
     */
    select?: ESIMSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIM
     */
    omit?: ESIMOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMInclude<ExtArgs> | null
  }


  /**
   * Model ESIMProfile
   */

  export type AggregateESIMProfile = {
    _count: ESIMProfileCountAggregateOutputType | null
    _min: ESIMProfileMinAggregateOutputType | null
    _max: ESIMProfileMaxAggregateOutputType | null
  }

  export type ESIMProfileMinAggregateOutputType = {
    id: string | null
    esimId: string | null
    profileId: string | null
    iccid: string | null
    downloadUrl: string | null
    qrCode: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type ESIMProfileMaxAggregateOutputType = {
    id: string | null
    esimId: string | null
    profileId: string | null
    iccid: string | null
    downloadUrl: string | null
    qrCode: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type ESIMProfileCountAggregateOutputType = {
    id: number
    esimId: number
    profileId: number
    iccid: number
    downloadUrl: number
    qrCode: number
    expiresAt: number
    deviceInfo: number
    createdAt: number
    _all: number
  }


  export type ESIMProfileMinAggregateInputType = {
    id?: true
    esimId?: true
    profileId?: true
    iccid?: true
    downloadUrl?: true
    qrCode?: true
    expiresAt?: true
    createdAt?: true
  }

  export type ESIMProfileMaxAggregateInputType = {
    id?: true
    esimId?: true
    profileId?: true
    iccid?: true
    downloadUrl?: true
    qrCode?: true
    expiresAt?: true
    createdAt?: true
  }

  export type ESIMProfileCountAggregateInputType = {
    id?: true
    esimId?: true
    profileId?: true
    iccid?: true
    downloadUrl?: true
    qrCode?: true
    expiresAt?: true
    deviceInfo?: true
    createdAt?: true
    _all?: true
  }

  export type ESIMProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ESIMProfile to aggregate.
     */
    where?: ESIMProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMProfiles to fetch.
     */
    orderBy?: ESIMProfileOrderByWithRelationInput | ESIMProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ESIMProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ESIMProfiles
    **/
    _count?: true | ESIMProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ESIMProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ESIMProfileMaxAggregateInputType
  }

  export type GetESIMProfileAggregateType<T extends ESIMProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateESIMProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateESIMProfile[P]>
      : GetScalarType<T[P], AggregateESIMProfile[P]>
  }




  export type ESIMProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ESIMProfileWhereInput
    orderBy?: ESIMProfileOrderByWithAggregationInput | ESIMProfileOrderByWithAggregationInput[]
    by: ESIMProfileScalarFieldEnum[] | ESIMProfileScalarFieldEnum
    having?: ESIMProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ESIMProfileCountAggregateInputType | true
    _min?: ESIMProfileMinAggregateInputType
    _max?: ESIMProfileMaxAggregateInputType
  }

  export type ESIMProfileGroupByOutputType = {
    id: string
    esimId: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date
    deviceInfo: JsonValue | null
    createdAt: Date
    _count: ESIMProfileCountAggregateOutputType | null
    _min: ESIMProfileMinAggregateOutputType | null
    _max: ESIMProfileMaxAggregateOutputType | null
  }

  type GetESIMProfileGroupByPayload<T extends ESIMProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ESIMProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ESIMProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ESIMProfileGroupByOutputType[P]>
            : GetScalarType<T[P], ESIMProfileGroupByOutputType[P]>
        }
      >
    >


  export type ESIMProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    esimId?: boolean
    profileId?: boolean
    iccid?: boolean
    downloadUrl?: boolean
    qrCode?: boolean
    expiresAt?: boolean
    deviceInfo?: boolean
    createdAt?: boolean
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIMProfile"]>

  export type ESIMProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    esimId?: boolean
    profileId?: boolean
    iccid?: boolean
    downloadUrl?: boolean
    qrCode?: boolean
    expiresAt?: boolean
    deviceInfo?: boolean
    createdAt?: boolean
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIMProfile"]>

  export type ESIMProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    esimId?: boolean
    profileId?: boolean
    iccid?: boolean
    downloadUrl?: boolean
    qrCode?: boolean
    expiresAt?: boolean
    deviceInfo?: boolean
    createdAt?: boolean
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["eSIMProfile"]>

  export type ESIMProfileSelectScalar = {
    id?: boolean
    esimId?: boolean
    profileId?: boolean
    iccid?: boolean
    downloadUrl?: boolean
    qrCode?: boolean
    expiresAt?: boolean
    deviceInfo?: boolean
    createdAt?: boolean
  }

  export type ESIMProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "esimId" | "profileId" | "iccid" | "downloadUrl" | "qrCode" | "expiresAt" | "deviceInfo" | "createdAt", ExtArgs["result"]["eSIMProfile"]>
  export type ESIMProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }
  export type ESIMProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }
  export type ESIMProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    esim?: boolean | ESIMDefaultArgs<ExtArgs>
  }

  export type $ESIMProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ESIMProfile"
    objects: {
      esim: Prisma.$ESIMPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      esimId: string
      profileId: string
      iccid: string
      downloadUrl: string
      qrCode: string
      expiresAt: Date
      deviceInfo: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["eSIMProfile"]>
    composites: {}
  }

  type ESIMProfileGetPayload<S extends boolean | null | undefined | ESIMProfileDefaultArgs> = $Result.GetResult<Prisma.$ESIMProfilePayload, S>

  type ESIMProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ESIMProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ESIMProfileCountAggregateInputType | true
    }

  export interface ESIMProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ESIMProfile'], meta: { name: 'ESIMProfile' } }
    /**
     * Find zero or one ESIMProfile that matches the filter.
     * @param {ESIMProfileFindUniqueArgs} args - Arguments to find a ESIMProfile
     * @example
     * // Get one ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ESIMProfileFindUniqueArgs>(args: SelectSubset<T, ESIMProfileFindUniqueArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ESIMProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ESIMProfileFindUniqueOrThrowArgs} args - Arguments to find a ESIMProfile
     * @example
     * // Get one ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ESIMProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, ESIMProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ESIMProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileFindFirstArgs} args - Arguments to find a ESIMProfile
     * @example
     * // Get one ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ESIMProfileFindFirstArgs>(args?: SelectSubset<T, ESIMProfileFindFirstArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ESIMProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileFindFirstOrThrowArgs} args - Arguments to find a ESIMProfile
     * @example
     * // Get one ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ESIMProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, ESIMProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ESIMProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ESIMProfiles
     * const eSIMProfiles = await prisma.eSIMProfile.findMany()
     * 
     * // Get first 10 ESIMProfiles
     * const eSIMProfiles = await prisma.eSIMProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const eSIMProfileWithIdOnly = await prisma.eSIMProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ESIMProfileFindManyArgs>(args?: SelectSubset<T, ESIMProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ESIMProfile.
     * @param {ESIMProfileCreateArgs} args - Arguments to create a ESIMProfile.
     * @example
     * // Create one ESIMProfile
     * const ESIMProfile = await prisma.eSIMProfile.create({
     *   data: {
     *     // ... data to create a ESIMProfile
     *   }
     * })
     * 
     */
    create<T extends ESIMProfileCreateArgs>(args: SelectSubset<T, ESIMProfileCreateArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ESIMProfiles.
     * @param {ESIMProfileCreateManyArgs} args - Arguments to create many ESIMProfiles.
     * @example
     * // Create many ESIMProfiles
     * const eSIMProfile = await prisma.eSIMProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ESIMProfileCreateManyArgs>(args?: SelectSubset<T, ESIMProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ESIMProfiles and returns the data saved in the database.
     * @param {ESIMProfileCreateManyAndReturnArgs} args - Arguments to create many ESIMProfiles.
     * @example
     * // Create many ESIMProfiles
     * const eSIMProfile = await prisma.eSIMProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ESIMProfiles and only return the `id`
     * const eSIMProfileWithIdOnly = await prisma.eSIMProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ESIMProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, ESIMProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ESIMProfile.
     * @param {ESIMProfileDeleteArgs} args - Arguments to delete one ESIMProfile.
     * @example
     * // Delete one ESIMProfile
     * const ESIMProfile = await prisma.eSIMProfile.delete({
     *   where: {
     *     // ... filter to delete one ESIMProfile
     *   }
     * })
     * 
     */
    delete<T extends ESIMProfileDeleteArgs>(args: SelectSubset<T, ESIMProfileDeleteArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ESIMProfile.
     * @param {ESIMProfileUpdateArgs} args - Arguments to update one ESIMProfile.
     * @example
     * // Update one ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ESIMProfileUpdateArgs>(args: SelectSubset<T, ESIMProfileUpdateArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ESIMProfiles.
     * @param {ESIMProfileDeleteManyArgs} args - Arguments to filter ESIMProfiles to delete.
     * @example
     * // Delete a few ESIMProfiles
     * const { count } = await prisma.eSIMProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ESIMProfileDeleteManyArgs>(args?: SelectSubset<T, ESIMProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ESIMProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ESIMProfiles
     * const eSIMProfile = await prisma.eSIMProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ESIMProfileUpdateManyArgs>(args: SelectSubset<T, ESIMProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ESIMProfiles and returns the data updated in the database.
     * @param {ESIMProfileUpdateManyAndReturnArgs} args - Arguments to update many ESIMProfiles.
     * @example
     * // Update many ESIMProfiles
     * const eSIMProfile = await prisma.eSIMProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ESIMProfiles and only return the `id`
     * const eSIMProfileWithIdOnly = await prisma.eSIMProfile.updateManyAndReturn({
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
    updateManyAndReturn<T extends ESIMProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, ESIMProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ESIMProfile.
     * @param {ESIMProfileUpsertArgs} args - Arguments to update or create a ESIMProfile.
     * @example
     * // Update or create a ESIMProfile
     * const eSIMProfile = await prisma.eSIMProfile.upsert({
     *   create: {
     *     // ... data to create a ESIMProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ESIMProfile we want to update
     *   }
     * })
     */
    upsert<T extends ESIMProfileUpsertArgs>(args: SelectSubset<T, ESIMProfileUpsertArgs<ExtArgs>>): Prisma__ESIMProfileClient<$Result.GetResult<Prisma.$ESIMProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ESIMProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileCountArgs} args - Arguments to filter ESIMProfiles to count.
     * @example
     * // Count the number of ESIMProfiles
     * const count = await prisma.eSIMProfile.count({
     *   where: {
     *     // ... the filter for the ESIMProfiles we want to count
     *   }
     * })
    **/
    count<T extends ESIMProfileCountArgs>(
      args?: Subset<T, ESIMProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ESIMProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ESIMProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ESIMProfileAggregateArgs>(args: Subset<T, ESIMProfileAggregateArgs>): Prisma.PrismaPromise<GetESIMProfileAggregateType<T>>

    /**
     * Group by ESIMProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ESIMProfileGroupByArgs} args - Group by arguments.
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
      T extends ESIMProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ESIMProfileGroupByArgs['orderBy'] }
        : { orderBy?: ESIMProfileGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ESIMProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetESIMProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ESIMProfile model
   */
  readonly fields: ESIMProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ESIMProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ESIMProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    esim<T extends ESIMDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ESIMDefaultArgs<ExtArgs>>): Prisma__ESIMClient<$Result.GetResult<Prisma.$ESIMPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ESIMProfile model
   */
  interface ESIMProfileFieldRefs {
    readonly id: FieldRef<"ESIMProfile", 'String'>
    readonly esimId: FieldRef<"ESIMProfile", 'String'>
    readonly profileId: FieldRef<"ESIMProfile", 'String'>
    readonly iccid: FieldRef<"ESIMProfile", 'String'>
    readonly downloadUrl: FieldRef<"ESIMProfile", 'String'>
    readonly qrCode: FieldRef<"ESIMProfile", 'String'>
    readonly expiresAt: FieldRef<"ESIMProfile", 'DateTime'>
    readonly deviceInfo: FieldRef<"ESIMProfile", 'Json'>
    readonly createdAt: FieldRef<"ESIMProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ESIMProfile findUnique
   */
  export type ESIMProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter, which ESIMProfile to fetch.
     */
    where: ESIMProfileWhereUniqueInput
  }

  /**
   * ESIMProfile findUniqueOrThrow
   */
  export type ESIMProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter, which ESIMProfile to fetch.
     */
    where: ESIMProfileWhereUniqueInput
  }

  /**
   * ESIMProfile findFirst
   */
  export type ESIMProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter, which ESIMProfile to fetch.
     */
    where?: ESIMProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMProfiles to fetch.
     */
    orderBy?: ESIMProfileOrderByWithRelationInput | ESIMProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ESIMProfiles.
     */
    cursor?: ESIMProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ESIMProfiles.
     */
    distinct?: ESIMProfileScalarFieldEnum | ESIMProfileScalarFieldEnum[]
  }

  /**
   * ESIMProfile findFirstOrThrow
   */
  export type ESIMProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter, which ESIMProfile to fetch.
     */
    where?: ESIMProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMProfiles to fetch.
     */
    orderBy?: ESIMProfileOrderByWithRelationInput | ESIMProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ESIMProfiles.
     */
    cursor?: ESIMProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ESIMProfiles.
     */
    distinct?: ESIMProfileScalarFieldEnum | ESIMProfileScalarFieldEnum[]
  }

  /**
   * ESIMProfile findMany
   */
  export type ESIMProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter, which ESIMProfiles to fetch.
     */
    where?: ESIMProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ESIMProfiles to fetch.
     */
    orderBy?: ESIMProfileOrderByWithRelationInput | ESIMProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ESIMProfiles.
     */
    cursor?: ESIMProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ESIMProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ESIMProfiles.
     */
    skip?: number
    distinct?: ESIMProfileScalarFieldEnum | ESIMProfileScalarFieldEnum[]
  }

  /**
   * ESIMProfile create
   */
  export type ESIMProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a ESIMProfile.
     */
    data: XOR<ESIMProfileCreateInput, ESIMProfileUncheckedCreateInput>
  }

  /**
   * ESIMProfile createMany
   */
  export type ESIMProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ESIMProfiles.
     */
    data: ESIMProfileCreateManyInput | ESIMProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ESIMProfile createManyAndReturn
   */
  export type ESIMProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * The data used to create many ESIMProfiles.
     */
    data: ESIMProfileCreateManyInput | ESIMProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ESIMProfile update
   */
  export type ESIMProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a ESIMProfile.
     */
    data: XOR<ESIMProfileUpdateInput, ESIMProfileUncheckedUpdateInput>
    /**
     * Choose, which ESIMProfile to update.
     */
    where: ESIMProfileWhereUniqueInput
  }

  /**
   * ESIMProfile updateMany
   */
  export type ESIMProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ESIMProfiles.
     */
    data: XOR<ESIMProfileUpdateManyMutationInput, ESIMProfileUncheckedUpdateManyInput>
    /**
     * Filter which ESIMProfiles to update
     */
    where?: ESIMProfileWhereInput
    /**
     * Limit how many ESIMProfiles to update.
     */
    limit?: number
  }

  /**
   * ESIMProfile updateManyAndReturn
   */
  export type ESIMProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * The data used to update ESIMProfiles.
     */
    data: XOR<ESIMProfileUpdateManyMutationInput, ESIMProfileUncheckedUpdateManyInput>
    /**
     * Filter which ESIMProfiles to update
     */
    where?: ESIMProfileWhereInput
    /**
     * Limit how many ESIMProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ESIMProfile upsert
   */
  export type ESIMProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the ESIMProfile to update in case it exists.
     */
    where: ESIMProfileWhereUniqueInput
    /**
     * In case the ESIMProfile found by the `where` argument doesn't exist, create a new ESIMProfile with this data.
     */
    create: XOR<ESIMProfileCreateInput, ESIMProfileUncheckedCreateInput>
    /**
     * In case the ESIMProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ESIMProfileUpdateInput, ESIMProfileUncheckedUpdateInput>
  }

  /**
   * ESIMProfile delete
   */
  export type ESIMProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
    /**
     * Filter which ESIMProfile to delete.
     */
    where: ESIMProfileWhereUniqueInput
  }

  /**
   * ESIMProfile deleteMany
   */
  export type ESIMProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ESIMProfiles to delete
     */
    where?: ESIMProfileWhereInput
    /**
     * Limit how many ESIMProfiles to delete.
     */
    limit?: number
  }

  /**
   * ESIMProfile without action
   */
  export type ESIMProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ESIMProfile
     */
    select?: ESIMProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ESIMProfile
     */
    omit?: ESIMProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ESIMProfileInclude<ExtArgs> | null
  }


  /**
   * Model DataPlan
   */

  export type AggregateDataPlan = {
    _count: DataPlanCountAggregateOutputType | null
    _avg: DataPlanAvgAggregateOutputType | null
    _sum: DataPlanSumAggregateOutputType | null
    _min: DataPlanMinAggregateOutputType | null
    _max: DataPlanMaxAggregateOutputType | null
  }

  export type DataPlanAvgAggregateOutputType = {
    price: number | null
  }

  export type DataPlanSumAggregateOutputType = {
    price: number | null
  }

  export type DataPlanMinAggregateOutputType = {
    id: string | null
    name: string | null
    dataAmount: string | null
    duration: string | null
    price: number | null
    currency: string | null
    region: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DataPlanMaxAggregateOutputType = {
    id: string | null
    name: string | null
    dataAmount: string | null
    duration: string | null
    price: number | null
    currency: string | null
    region: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DataPlanCountAggregateOutputType = {
    id: number
    name: number
    dataAmount: number
    duration: number
    price: number
    currency: number
    region: number
    features: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DataPlanAvgAggregateInputType = {
    price?: true
  }

  export type DataPlanSumAggregateInputType = {
    price?: true
  }

  export type DataPlanMinAggregateInputType = {
    id?: true
    name?: true
    dataAmount?: true
    duration?: true
    price?: true
    currency?: true
    region?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DataPlanMaxAggregateInputType = {
    id?: true
    name?: true
    dataAmount?: true
    duration?: true
    price?: true
    currency?: true
    region?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DataPlanCountAggregateInputType = {
    id?: true
    name?: true
    dataAmount?: true
    duration?: true
    price?: true
    currency?: true
    region?: true
    features?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DataPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataPlan to aggregate.
     */
    where?: DataPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataPlans to fetch.
     */
    orderBy?: DataPlanOrderByWithRelationInput | DataPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DataPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DataPlans
    **/
    _count?: true | DataPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DataPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DataPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DataPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DataPlanMaxAggregateInputType
  }

  export type GetDataPlanAggregateType<T extends DataPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateDataPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDataPlan[P]>
      : GetScalarType<T[P], AggregateDataPlan[P]>
  }




  export type DataPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataPlanWhereInput
    orderBy?: DataPlanOrderByWithAggregationInput | DataPlanOrderByWithAggregationInput[]
    by: DataPlanScalarFieldEnum[] | DataPlanScalarFieldEnum
    having?: DataPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DataPlanCountAggregateInputType | true
    _avg?: DataPlanAvgAggregateInputType
    _sum?: DataPlanSumAggregateInputType
    _min?: DataPlanMinAggregateInputType
    _max?: DataPlanMaxAggregateInputType
  }

  export type DataPlanGroupByOutputType = {
    id: string
    name: string
    dataAmount: string
    duration: string
    price: number
    currency: string
    region: string
    features: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: DataPlanCountAggregateOutputType | null
    _avg: DataPlanAvgAggregateOutputType | null
    _sum: DataPlanSumAggregateOutputType | null
    _min: DataPlanMinAggregateOutputType | null
    _max: DataPlanMaxAggregateOutputType | null
  }

  type GetDataPlanGroupByPayload<T extends DataPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DataPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DataPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DataPlanGroupByOutputType[P]>
            : GetScalarType<T[P], DataPlanGroupByOutputType[P]>
        }
      >
    >


  export type DataPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    dataAmount?: boolean
    duration?: boolean
    price?: boolean
    currency?: boolean
    region?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataPlan"]>

  export type DataPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    dataAmount?: boolean
    duration?: boolean
    price?: boolean
    currency?: boolean
    region?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataPlan"]>

  export type DataPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    dataAmount?: boolean
    duration?: boolean
    price?: boolean
    currency?: boolean
    region?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataPlan"]>

  export type DataPlanSelectScalar = {
    id?: boolean
    name?: boolean
    dataAmount?: boolean
    duration?: boolean
    price?: boolean
    currency?: boolean
    region?: boolean
    features?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DataPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "dataAmount" | "duration" | "price" | "currency" | "region" | "features" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["dataPlan"]>

  export type $DataPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DataPlan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      dataAmount: string
      duration: string
      price: number
      currency: string
      region: string
      features: string[]
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dataPlan"]>
    composites: {}
  }

  type DataPlanGetPayload<S extends boolean | null | undefined | DataPlanDefaultArgs> = $Result.GetResult<Prisma.$DataPlanPayload, S>

  type DataPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DataPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DataPlanCountAggregateInputType | true
    }

  export interface DataPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DataPlan'], meta: { name: 'DataPlan' } }
    /**
     * Find zero or one DataPlan that matches the filter.
     * @param {DataPlanFindUniqueArgs} args - Arguments to find a DataPlan
     * @example
     * // Get one DataPlan
     * const dataPlan = await prisma.dataPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DataPlanFindUniqueArgs>(args: SelectSubset<T, DataPlanFindUniqueArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DataPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DataPlanFindUniqueOrThrowArgs} args - Arguments to find a DataPlan
     * @example
     * // Get one DataPlan
     * const dataPlan = await prisma.dataPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DataPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, DataPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanFindFirstArgs} args - Arguments to find a DataPlan
     * @example
     * // Get one DataPlan
     * const dataPlan = await prisma.dataPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DataPlanFindFirstArgs>(args?: SelectSubset<T, DataPlanFindFirstArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanFindFirstOrThrowArgs} args - Arguments to find a DataPlan
     * @example
     * // Get one DataPlan
     * const dataPlan = await prisma.dataPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DataPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, DataPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DataPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DataPlans
     * const dataPlans = await prisma.dataPlan.findMany()
     * 
     * // Get first 10 DataPlans
     * const dataPlans = await prisma.dataPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dataPlanWithIdOnly = await prisma.dataPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DataPlanFindManyArgs>(args?: SelectSubset<T, DataPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DataPlan.
     * @param {DataPlanCreateArgs} args - Arguments to create a DataPlan.
     * @example
     * // Create one DataPlan
     * const DataPlan = await prisma.dataPlan.create({
     *   data: {
     *     // ... data to create a DataPlan
     *   }
     * })
     * 
     */
    create<T extends DataPlanCreateArgs>(args: SelectSubset<T, DataPlanCreateArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DataPlans.
     * @param {DataPlanCreateManyArgs} args - Arguments to create many DataPlans.
     * @example
     * // Create many DataPlans
     * const dataPlan = await prisma.dataPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DataPlanCreateManyArgs>(args?: SelectSubset<T, DataPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DataPlans and returns the data saved in the database.
     * @param {DataPlanCreateManyAndReturnArgs} args - Arguments to create many DataPlans.
     * @example
     * // Create many DataPlans
     * const dataPlan = await prisma.dataPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DataPlans and only return the `id`
     * const dataPlanWithIdOnly = await prisma.dataPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DataPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, DataPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DataPlan.
     * @param {DataPlanDeleteArgs} args - Arguments to delete one DataPlan.
     * @example
     * // Delete one DataPlan
     * const DataPlan = await prisma.dataPlan.delete({
     *   where: {
     *     // ... filter to delete one DataPlan
     *   }
     * })
     * 
     */
    delete<T extends DataPlanDeleteArgs>(args: SelectSubset<T, DataPlanDeleteArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DataPlan.
     * @param {DataPlanUpdateArgs} args - Arguments to update one DataPlan.
     * @example
     * // Update one DataPlan
     * const dataPlan = await prisma.dataPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DataPlanUpdateArgs>(args: SelectSubset<T, DataPlanUpdateArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DataPlans.
     * @param {DataPlanDeleteManyArgs} args - Arguments to filter DataPlans to delete.
     * @example
     * // Delete a few DataPlans
     * const { count } = await prisma.dataPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DataPlanDeleteManyArgs>(args?: SelectSubset<T, DataPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DataPlans
     * const dataPlan = await prisma.dataPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DataPlanUpdateManyArgs>(args: SelectSubset<T, DataPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataPlans and returns the data updated in the database.
     * @param {DataPlanUpdateManyAndReturnArgs} args - Arguments to update many DataPlans.
     * @example
     * // Update many DataPlans
     * const dataPlan = await prisma.dataPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DataPlans and only return the `id`
     * const dataPlanWithIdOnly = await prisma.dataPlan.updateManyAndReturn({
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
    updateManyAndReturn<T extends DataPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, DataPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DataPlan.
     * @param {DataPlanUpsertArgs} args - Arguments to update or create a DataPlan.
     * @example
     * // Update or create a DataPlan
     * const dataPlan = await prisma.dataPlan.upsert({
     *   create: {
     *     // ... data to create a DataPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DataPlan we want to update
     *   }
     * })
     */
    upsert<T extends DataPlanUpsertArgs>(args: SelectSubset<T, DataPlanUpsertArgs<ExtArgs>>): Prisma__DataPlanClient<$Result.GetResult<Prisma.$DataPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DataPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanCountArgs} args - Arguments to filter DataPlans to count.
     * @example
     * // Count the number of DataPlans
     * const count = await prisma.dataPlan.count({
     *   where: {
     *     // ... the filter for the DataPlans we want to count
     *   }
     * })
    **/
    count<T extends DataPlanCountArgs>(
      args?: Subset<T, DataPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DataPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DataPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DataPlanAggregateArgs>(args: Subset<T, DataPlanAggregateArgs>): Prisma.PrismaPromise<GetDataPlanAggregateType<T>>

    /**
     * Group by DataPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataPlanGroupByArgs} args - Group by arguments.
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
      T extends DataPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DataPlanGroupByArgs['orderBy'] }
        : { orderBy?: DataPlanGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DataPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DataPlan model
   */
  readonly fields: DataPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DataPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DataPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DataPlan model
   */
  interface DataPlanFieldRefs {
    readonly id: FieldRef<"DataPlan", 'String'>
    readonly name: FieldRef<"DataPlan", 'String'>
    readonly dataAmount: FieldRef<"DataPlan", 'String'>
    readonly duration: FieldRef<"DataPlan", 'String'>
    readonly price: FieldRef<"DataPlan", 'Float'>
    readonly currency: FieldRef<"DataPlan", 'String'>
    readonly region: FieldRef<"DataPlan", 'String'>
    readonly features: FieldRef<"DataPlan", 'String[]'>
    readonly isActive: FieldRef<"DataPlan", 'Boolean'>
    readonly createdAt: FieldRef<"DataPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"DataPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DataPlan findUnique
   */
  export type DataPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter, which DataPlan to fetch.
     */
    where: DataPlanWhereUniqueInput
  }

  /**
   * DataPlan findUniqueOrThrow
   */
  export type DataPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter, which DataPlan to fetch.
     */
    where: DataPlanWhereUniqueInput
  }

  /**
   * DataPlan findFirst
   */
  export type DataPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter, which DataPlan to fetch.
     */
    where?: DataPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataPlans to fetch.
     */
    orderBy?: DataPlanOrderByWithRelationInput | DataPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataPlans.
     */
    cursor?: DataPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataPlans.
     */
    distinct?: DataPlanScalarFieldEnum | DataPlanScalarFieldEnum[]
  }

  /**
   * DataPlan findFirstOrThrow
   */
  export type DataPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter, which DataPlan to fetch.
     */
    where?: DataPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataPlans to fetch.
     */
    orderBy?: DataPlanOrderByWithRelationInput | DataPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataPlans.
     */
    cursor?: DataPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataPlans.
     */
    distinct?: DataPlanScalarFieldEnum | DataPlanScalarFieldEnum[]
  }

  /**
   * DataPlan findMany
   */
  export type DataPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter, which DataPlans to fetch.
     */
    where?: DataPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataPlans to fetch.
     */
    orderBy?: DataPlanOrderByWithRelationInput | DataPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DataPlans.
     */
    cursor?: DataPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataPlans.
     */
    skip?: number
    distinct?: DataPlanScalarFieldEnum | DataPlanScalarFieldEnum[]
  }

  /**
   * DataPlan create
   */
  export type DataPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * The data needed to create a DataPlan.
     */
    data: XOR<DataPlanCreateInput, DataPlanUncheckedCreateInput>
  }

  /**
   * DataPlan createMany
   */
  export type DataPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DataPlans.
     */
    data: DataPlanCreateManyInput | DataPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataPlan createManyAndReturn
   */
  export type DataPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * The data used to create many DataPlans.
     */
    data: DataPlanCreateManyInput | DataPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataPlan update
   */
  export type DataPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * The data needed to update a DataPlan.
     */
    data: XOR<DataPlanUpdateInput, DataPlanUncheckedUpdateInput>
    /**
     * Choose, which DataPlan to update.
     */
    where: DataPlanWhereUniqueInput
  }

  /**
   * DataPlan updateMany
   */
  export type DataPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DataPlans.
     */
    data: XOR<DataPlanUpdateManyMutationInput, DataPlanUncheckedUpdateManyInput>
    /**
     * Filter which DataPlans to update
     */
    where?: DataPlanWhereInput
    /**
     * Limit how many DataPlans to update.
     */
    limit?: number
  }

  /**
   * DataPlan updateManyAndReturn
   */
  export type DataPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * The data used to update DataPlans.
     */
    data: XOR<DataPlanUpdateManyMutationInput, DataPlanUncheckedUpdateManyInput>
    /**
     * Filter which DataPlans to update
     */
    where?: DataPlanWhereInput
    /**
     * Limit how many DataPlans to update.
     */
    limit?: number
  }

  /**
   * DataPlan upsert
   */
  export type DataPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * The filter to search for the DataPlan to update in case it exists.
     */
    where: DataPlanWhereUniqueInput
    /**
     * In case the DataPlan found by the `where` argument doesn't exist, create a new DataPlan with this data.
     */
    create: XOR<DataPlanCreateInput, DataPlanUncheckedCreateInput>
    /**
     * In case the DataPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DataPlanUpdateInput, DataPlanUncheckedUpdateInput>
  }

  /**
   * DataPlan delete
   */
  export type DataPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
    /**
     * Filter which DataPlan to delete.
     */
    where: DataPlanWhereUniqueInput
  }

  /**
   * DataPlan deleteMany
   */
  export type DataPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataPlans to delete
     */
    where?: DataPlanWhereInput
    /**
     * Limit how many DataPlans to delete.
     */
    limit?: number
  }

  /**
   * DataPlan without action
   */
  export type DataPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataPlan
     */
    select?: DataPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataPlan
     */
    omit?: DataPlanOmit<ExtArgs> | null
  }


  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  export type PaymentAvgAggregateOutputType = {
    amount: number | null
    refundAmount: number | null
  }

  export type PaymentSumAggregateOutputType = {
    amount: number | null
    refundAmount: number | null
  }

  export type PaymentMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    amount: number | null
    currency: string | null
    paymentMethod: string | null
    customerId: string | null
    status: $Enums.PaymentStatus | null
    completedAt: Date | null
    refundAmount: number | null
    refundedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    amount: number | null
    currency: string | null
    paymentMethod: string | null
    customerId: string | null
    status: $Enums.PaymentStatus | null
    completedAt: Date | null
    refundAmount: number | null
    refundedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentCountAggregateOutputType = {
    id: number
    orderId: number
    amount: number
    currency: number
    paymentMethod: number
    customerId: number
    billingAddress: number
    status: number
    completedAt: number
    refundAmount: number
    refundedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PaymentAvgAggregateInputType = {
    amount?: true
    refundAmount?: true
  }

  export type PaymentSumAggregateInputType = {
    amount?: true
    refundAmount?: true
  }

  export type PaymentMinAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    currency?: true
    paymentMethod?: true
    customerId?: true
    status?: true
    completedAt?: true
    refundAmount?: true
    refundedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentMaxAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    currency?: true
    paymentMethod?: true
    customerId?: true
    status?: true
    completedAt?: true
    refundAmount?: true
    refundedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentCountAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
    currency?: true
    paymentMethod?: true
    customerId?: true
    billingAddress?: true
    status?: true
    completedAt?: true
    refundAmount?: true
    refundedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Payments
    **/
    _count?: true | PaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentMaxAggregateInputType
  }

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>
  }




  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[]
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum
    having?: PaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentCountAggregateInputType | true
    _avg?: PaymentAvgAggregateInputType
    _sum?: PaymentSumAggregateInputType
    _min?: PaymentMinAggregateInputType
    _max?: PaymentMaxAggregateInputType
  }

  export type PaymentGroupByOutputType = {
    id: string
    orderId: string
    amount: number
    currency: string
    paymentMethod: string
    customerId: string
    billingAddress: JsonValue | null
    status: $Enums.PaymentStatus
    completedAt: Date | null
    refundAmount: number | null
    refundedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
        }
      >
    >


  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    paymentMethod?: boolean
    customerId?: boolean
    billingAddress?: boolean
    status?: boolean
    completedAt?: boolean
    refundAmount?: boolean
    refundedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    paymentMethod?: boolean
    customerId?: boolean
    billingAddress?: boolean
    status?: boolean
    completedAt?: boolean
    refundAmount?: boolean
    refundedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    paymentMethod?: boolean
    customerId?: boolean
    billingAddress?: boolean
    status?: boolean
    completedAt?: boolean
    refundAmount?: boolean
    refundedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectScalar = {
    id?: boolean
    orderId?: boolean
    amount?: boolean
    currency?: boolean
    paymentMethod?: boolean
    customerId?: boolean
    billingAddress?: boolean
    status?: boolean
    completedAt?: boolean
    refundAmount?: boolean
    refundedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderId" | "amount" | "currency" | "paymentMethod" | "customerId" | "billingAddress" | "status" | "completedAt" | "refundAmount" | "refundedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["payment"]>
  export type PaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type PaymentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      amount: number
      currency: string
      paymentMethod: string
      customerId: string
      billingAddress: Prisma.JsonValue | null
      status: $Enums.PaymentStatus
      completedAt: Date | null
      refundAmount: number | null
      refundedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["payment"]>
    composites: {}
  }

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<Prisma.$PaymentPayload, S>

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PaymentCountAggregateInputType | true
    }

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Payment'], meta: { name: 'Payment' } }
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     * 
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentFindManyArgs>(args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     * 
     */
    create<T extends PaymentCreateArgs>(args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentCreateManyArgs>(args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     * 
     */
    delete<T extends PaymentDeleteArgs>(args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentUpdateArgs>(args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentDeleteManyArgs>(args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentUpdateManyArgs>(args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments and returns the data updated in the database.
     * @param {PaymentUpdateManyAndReturnArgs} args - Arguments to update many Payments.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.updateManyAndReturn({
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
    updateManyAndReturn<T extends PaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, PaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
    **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PaymentAggregateArgs>(args: Subset<T, PaymentAggregateArgs>): Prisma.PrismaPromise<GetPaymentAggregateType<T>>

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
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
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs['orderBy'] }
        : { orderBy?: PaymentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Payment model
   */
  readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Payment model
   */
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", 'String'>
    readonly orderId: FieldRef<"Payment", 'String'>
    readonly amount: FieldRef<"Payment", 'Float'>
    readonly currency: FieldRef<"Payment", 'String'>
    readonly paymentMethod: FieldRef<"Payment", 'String'>
    readonly customerId: FieldRef<"Payment", 'String'>
    readonly billingAddress: FieldRef<"Payment", 'Json'>
    readonly status: FieldRef<"Payment", 'PaymentStatus'>
    readonly completedAt: FieldRef<"Payment", 'DateTime'>
    readonly refundAmount: FieldRef<"Payment", 'Float'>
    readonly refundedAt: FieldRef<"Payment", 'DateTime'>
    readonly createdAt: FieldRef<"Payment", 'DateTime'>
    readonly updatedAt: FieldRef<"Payment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
  }

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
  }

  /**
   * Payment updateManyAndReturn
   */
  export type PaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
  }

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to delete.
     */
    limit?: number
  }

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaymentInclude<ExtArgs> | null
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


  export const OrderScalarFieldEnum: {
    id: 'id',
    customerId: 'customerId',
    esimType: 'esimType',
    dataPlan: 'dataPlan',
    duration: 'duration',
    region: 'region',
    quantity: 'quantity',
    status: 'status',
    trackingId: 'trackingId',
    estimatedDelivery: 'estimatedDelivery',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    cancelledAt: 'cancelledAt',
    cancellationReason: 'cancellationReason',
    refundAmount: 'refundAmount'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const ESIMScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    activationCode: 'activationCode',
    deviceInfo: 'deviceInfo',
    status: 'status',
    activatedAt: 'activatedAt',
    deactivatedAt: 'deactivatedAt',
    deactivationReason: 'deactivationReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ESIMScalarFieldEnum = (typeof ESIMScalarFieldEnum)[keyof typeof ESIMScalarFieldEnum]


  export const ESIMProfileScalarFieldEnum: {
    id: 'id',
    esimId: 'esimId',
    profileId: 'profileId',
    iccid: 'iccid',
    downloadUrl: 'downloadUrl',
    qrCode: 'qrCode',
    expiresAt: 'expiresAt',
    deviceInfo: 'deviceInfo',
    createdAt: 'createdAt'
  };

  export type ESIMProfileScalarFieldEnum = (typeof ESIMProfileScalarFieldEnum)[keyof typeof ESIMProfileScalarFieldEnum]


  export const DataPlanScalarFieldEnum: {
    id: 'id',
    name: 'name',
    dataAmount: 'dataAmount',
    duration: 'duration',
    price: 'price',
    currency: 'currency',
    region: 'region',
    features: 'features',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DataPlanScalarFieldEnum = (typeof DataPlanScalarFieldEnum)[keyof typeof DataPlanScalarFieldEnum]


  export const PaymentScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    amount: 'amount',
    currency: 'currency',
    paymentMethod: 'paymentMethod',
    customerId: 'customerId',
    billingAddress: 'billingAddress',
    status: 'status',
    completedAt: 'completedAt',
    refundAmount: 'refundAmount',
    refundedAt: 'refundedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'OrderStatus[]'
   */
  export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'ESIMStatus'
   */
  export type EnumESIMStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ESIMStatus'>
    


  /**
   * Reference to a field of type 'ESIMStatus[]'
   */
  export type ListEnumESIMStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ESIMStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'PaymentStatus'
   */
  export type EnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus'>
    


  /**
   * Reference to a field of type 'PaymentStatus[]'
   */
  export type ListEnumPaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PaymentStatus[]'>
    


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


  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    customerId?: StringFilter<"Order"> | string
    esimType?: StringFilter<"Order"> | string
    dataPlan?: StringFilter<"Order"> | string
    duration?: StringFilter<"Order"> | string
    region?: StringFilter<"Order"> | string
    quantity?: IntFilter<"Order"> | number
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    trackingId?: StringNullableFilter<"Order"> | string | null
    estimatedDelivery?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    cancellationReason?: StringNullableFilter<"Order"> | string | null
    refundAmount?: FloatNullableFilter<"Order"> | number | null
    esims?: ESIMListRelationFilter
    payments?: PaymentListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    esimType?: SortOrder
    dataPlan?: SortOrder
    duration?: SortOrder
    region?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    trackingId?: SortOrderInput | SortOrder
    estimatedDelivery?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    refundAmount?: SortOrderInput | SortOrder
    esims?: ESIMOrderByRelationAggregateInput
    payments?: PaymentOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    customerId?: StringFilter<"Order"> | string
    esimType?: StringFilter<"Order"> | string
    dataPlan?: StringFilter<"Order"> | string
    duration?: StringFilter<"Order"> | string
    region?: StringFilter<"Order"> | string
    quantity?: IntFilter<"Order"> | number
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    trackingId?: StringNullableFilter<"Order"> | string | null
    estimatedDelivery?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    cancellationReason?: StringNullableFilter<"Order"> | string | null
    refundAmount?: FloatNullableFilter<"Order"> | number | null
    esims?: ESIMListRelationFilter
    payments?: PaymentListRelationFilter
  }, "id">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    esimType?: SortOrder
    dataPlan?: SortOrder
    duration?: SortOrder
    region?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    trackingId?: SortOrderInput | SortOrder
    estimatedDelivery?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    cancellationReason?: SortOrderInput | SortOrder
    refundAmount?: SortOrderInput | SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    customerId?: StringWithAggregatesFilter<"Order"> | string
    esimType?: StringWithAggregatesFilter<"Order"> | string
    dataPlan?: StringWithAggregatesFilter<"Order"> | string
    duration?: StringWithAggregatesFilter<"Order"> | string
    region?: StringWithAggregatesFilter<"Order"> | string
    quantity?: IntWithAggregatesFilter<"Order"> | number
    status?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    trackingId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    estimatedDelivery?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    cancellationReason?: StringNullableWithAggregatesFilter<"Order"> | string | null
    refundAmount?: FloatNullableWithAggregatesFilter<"Order"> | number | null
  }

  export type ESIMWhereInput = {
    AND?: ESIMWhereInput | ESIMWhereInput[]
    OR?: ESIMWhereInput[]
    NOT?: ESIMWhereInput | ESIMWhereInput[]
    id?: StringFilter<"ESIM"> | string
    orderId?: StringFilter<"ESIM"> | string
    activationCode?: StringFilter<"ESIM"> | string
    deviceInfo?: JsonNullableFilter<"ESIM">
    status?: EnumESIMStatusFilter<"ESIM"> | $Enums.ESIMStatus
    activatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivationReason?: StringNullableFilter<"ESIM"> | string | null
    createdAt?: DateTimeFilter<"ESIM"> | Date | string
    updatedAt?: DateTimeFilter<"ESIM"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    profiles?: ESIMProfileListRelationFilter
  }

  export type ESIMOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    activationCode?: SortOrder
    deviceInfo?: SortOrderInput | SortOrder
    status?: SortOrder
    activatedAt?: SortOrderInput | SortOrder
    deactivatedAt?: SortOrderInput | SortOrder
    deactivationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
    profiles?: ESIMProfileOrderByRelationAggregateInput
  }

  export type ESIMWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ESIMWhereInput | ESIMWhereInput[]
    OR?: ESIMWhereInput[]
    NOT?: ESIMWhereInput | ESIMWhereInput[]
    orderId?: StringFilter<"ESIM"> | string
    activationCode?: StringFilter<"ESIM"> | string
    deviceInfo?: JsonNullableFilter<"ESIM">
    status?: EnumESIMStatusFilter<"ESIM"> | $Enums.ESIMStatus
    activatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivationReason?: StringNullableFilter<"ESIM"> | string | null
    createdAt?: DateTimeFilter<"ESIM"> | Date | string
    updatedAt?: DateTimeFilter<"ESIM"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    profiles?: ESIMProfileListRelationFilter
  }, "id">

  export type ESIMOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    activationCode?: SortOrder
    deviceInfo?: SortOrderInput | SortOrder
    status?: SortOrder
    activatedAt?: SortOrderInput | SortOrder
    deactivatedAt?: SortOrderInput | SortOrder
    deactivationReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ESIMCountOrderByAggregateInput
    _max?: ESIMMaxOrderByAggregateInput
    _min?: ESIMMinOrderByAggregateInput
  }

  export type ESIMScalarWhereWithAggregatesInput = {
    AND?: ESIMScalarWhereWithAggregatesInput | ESIMScalarWhereWithAggregatesInput[]
    OR?: ESIMScalarWhereWithAggregatesInput[]
    NOT?: ESIMScalarWhereWithAggregatesInput | ESIMScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ESIM"> | string
    orderId?: StringWithAggregatesFilter<"ESIM"> | string
    activationCode?: StringWithAggregatesFilter<"ESIM"> | string
    deviceInfo?: JsonNullableWithAggregatesFilter<"ESIM">
    status?: EnumESIMStatusWithAggregatesFilter<"ESIM"> | $Enums.ESIMStatus
    activatedAt?: DateTimeNullableWithAggregatesFilter<"ESIM"> | Date | string | null
    deactivatedAt?: DateTimeNullableWithAggregatesFilter<"ESIM"> | Date | string | null
    deactivationReason?: StringNullableWithAggregatesFilter<"ESIM"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ESIM"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ESIM"> | Date | string
  }

  export type ESIMProfileWhereInput = {
    AND?: ESIMProfileWhereInput | ESIMProfileWhereInput[]
    OR?: ESIMProfileWhereInput[]
    NOT?: ESIMProfileWhereInput | ESIMProfileWhereInput[]
    id?: StringFilter<"ESIMProfile"> | string
    esimId?: StringFilter<"ESIMProfile"> | string
    profileId?: StringFilter<"ESIMProfile"> | string
    iccid?: StringFilter<"ESIMProfile"> | string
    downloadUrl?: StringFilter<"ESIMProfile"> | string
    qrCode?: StringFilter<"ESIMProfile"> | string
    expiresAt?: DateTimeFilter<"ESIMProfile"> | Date | string
    deviceInfo?: JsonNullableFilter<"ESIMProfile">
    createdAt?: DateTimeFilter<"ESIMProfile"> | Date | string
    esim?: XOR<ESIMScalarRelationFilter, ESIMWhereInput>
  }

  export type ESIMProfileOrderByWithRelationInput = {
    id?: SortOrder
    esimId?: SortOrder
    profileId?: SortOrder
    iccid?: SortOrder
    downloadUrl?: SortOrder
    qrCode?: SortOrder
    expiresAt?: SortOrder
    deviceInfo?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    esim?: ESIMOrderByWithRelationInput
  }

  export type ESIMProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    profileId?: string
    iccid?: string
    AND?: ESIMProfileWhereInput | ESIMProfileWhereInput[]
    OR?: ESIMProfileWhereInput[]
    NOT?: ESIMProfileWhereInput | ESIMProfileWhereInput[]
    esimId?: StringFilter<"ESIMProfile"> | string
    downloadUrl?: StringFilter<"ESIMProfile"> | string
    qrCode?: StringFilter<"ESIMProfile"> | string
    expiresAt?: DateTimeFilter<"ESIMProfile"> | Date | string
    deviceInfo?: JsonNullableFilter<"ESIMProfile">
    createdAt?: DateTimeFilter<"ESIMProfile"> | Date | string
    esim?: XOR<ESIMScalarRelationFilter, ESIMWhereInput>
  }, "id" | "profileId" | "iccid">

  export type ESIMProfileOrderByWithAggregationInput = {
    id?: SortOrder
    esimId?: SortOrder
    profileId?: SortOrder
    iccid?: SortOrder
    downloadUrl?: SortOrder
    qrCode?: SortOrder
    expiresAt?: SortOrder
    deviceInfo?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ESIMProfileCountOrderByAggregateInput
    _max?: ESIMProfileMaxOrderByAggregateInput
    _min?: ESIMProfileMinOrderByAggregateInput
  }

  export type ESIMProfileScalarWhereWithAggregatesInput = {
    AND?: ESIMProfileScalarWhereWithAggregatesInput | ESIMProfileScalarWhereWithAggregatesInput[]
    OR?: ESIMProfileScalarWhereWithAggregatesInput[]
    NOT?: ESIMProfileScalarWhereWithAggregatesInput | ESIMProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ESIMProfile"> | string
    esimId?: StringWithAggregatesFilter<"ESIMProfile"> | string
    profileId?: StringWithAggregatesFilter<"ESIMProfile"> | string
    iccid?: StringWithAggregatesFilter<"ESIMProfile"> | string
    downloadUrl?: StringWithAggregatesFilter<"ESIMProfile"> | string
    qrCode?: StringWithAggregatesFilter<"ESIMProfile"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"ESIMProfile"> | Date | string
    deviceInfo?: JsonNullableWithAggregatesFilter<"ESIMProfile">
    createdAt?: DateTimeWithAggregatesFilter<"ESIMProfile"> | Date | string
  }

  export type DataPlanWhereInput = {
    AND?: DataPlanWhereInput | DataPlanWhereInput[]
    OR?: DataPlanWhereInput[]
    NOT?: DataPlanWhereInput | DataPlanWhereInput[]
    id?: StringFilter<"DataPlan"> | string
    name?: StringFilter<"DataPlan"> | string
    dataAmount?: StringFilter<"DataPlan"> | string
    duration?: StringFilter<"DataPlan"> | string
    price?: FloatFilter<"DataPlan"> | number
    currency?: StringFilter<"DataPlan"> | string
    region?: StringFilter<"DataPlan"> | string
    features?: StringNullableListFilter<"DataPlan">
    isActive?: BoolFilter<"DataPlan"> | boolean
    createdAt?: DateTimeFilter<"DataPlan"> | Date | string
    updatedAt?: DateTimeFilter<"DataPlan"> | Date | string
  }

  export type DataPlanOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    dataAmount?: SortOrder
    duration?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    region?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DataPlanWhereInput | DataPlanWhereInput[]
    OR?: DataPlanWhereInput[]
    NOT?: DataPlanWhereInput | DataPlanWhereInput[]
    name?: StringFilter<"DataPlan"> | string
    dataAmount?: StringFilter<"DataPlan"> | string
    duration?: StringFilter<"DataPlan"> | string
    price?: FloatFilter<"DataPlan"> | number
    currency?: StringFilter<"DataPlan"> | string
    region?: StringFilter<"DataPlan"> | string
    features?: StringNullableListFilter<"DataPlan">
    isActive?: BoolFilter<"DataPlan"> | boolean
    createdAt?: DateTimeFilter<"DataPlan"> | Date | string
    updatedAt?: DateTimeFilter<"DataPlan"> | Date | string
  }, "id">

  export type DataPlanOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    dataAmount?: SortOrder
    duration?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    region?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DataPlanCountOrderByAggregateInput
    _avg?: DataPlanAvgOrderByAggregateInput
    _max?: DataPlanMaxOrderByAggregateInput
    _min?: DataPlanMinOrderByAggregateInput
    _sum?: DataPlanSumOrderByAggregateInput
  }

  export type DataPlanScalarWhereWithAggregatesInput = {
    AND?: DataPlanScalarWhereWithAggregatesInput | DataPlanScalarWhereWithAggregatesInput[]
    OR?: DataPlanScalarWhereWithAggregatesInput[]
    NOT?: DataPlanScalarWhereWithAggregatesInput | DataPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DataPlan"> | string
    name?: StringWithAggregatesFilter<"DataPlan"> | string
    dataAmount?: StringWithAggregatesFilter<"DataPlan"> | string
    duration?: StringWithAggregatesFilter<"DataPlan"> | string
    price?: FloatWithAggregatesFilter<"DataPlan"> | number
    currency?: StringWithAggregatesFilter<"DataPlan"> | string
    region?: StringWithAggregatesFilter<"DataPlan"> | string
    features?: StringNullableListFilter<"DataPlan">
    isActive?: BoolWithAggregatesFilter<"DataPlan"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"DataPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DataPlan"> | Date | string
  }

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    id?: StringFilter<"Payment"> | string
    orderId?: StringFilter<"Payment"> | string
    amount?: FloatFilter<"Payment"> | number
    currency?: StringFilter<"Payment"> | string
    paymentMethod?: StringFilter<"Payment"> | string
    customerId?: StringFilter<"Payment"> | string
    billingAddress?: JsonNullableFilter<"Payment">
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    completedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    refundAmount?: FloatNullableFilter<"Payment"> | number | null
    refundedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    paymentMethod?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    status?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    refundAmount?: SortOrderInput | SortOrder
    refundedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type PaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    orderId?: StringFilter<"Payment"> | string
    amount?: FloatFilter<"Payment"> | number
    currency?: StringFilter<"Payment"> | string
    paymentMethod?: StringFilter<"Payment"> | string
    customerId?: StringFilter<"Payment"> | string
    billingAddress?: JsonNullableFilter<"Payment">
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    completedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    refundAmount?: FloatNullableFilter<"Payment"> | number | null
    refundedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }, "id">

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    paymentMethod?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrderInput | SortOrder
    status?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    refundAmount?: SortOrderInput | SortOrder
    refundedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PaymentCountOrderByAggregateInput
    _avg?: PaymentAvgOrderByAggregateInput
    _max?: PaymentMaxOrderByAggregateInput
    _min?: PaymentMinOrderByAggregateInput
    _sum?: PaymentSumOrderByAggregateInput
  }

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    OR?: PaymentScalarWhereWithAggregatesInput[]
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Payment"> | string
    orderId?: StringWithAggregatesFilter<"Payment"> | string
    amount?: FloatWithAggregatesFilter<"Payment"> | number
    currency?: StringWithAggregatesFilter<"Payment"> | string
    paymentMethod?: StringWithAggregatesFilter<"Payment"> | string
    customerId?: StringWithAggregatesFilter<"Payment"> | string
    billingAddress?: JsonNullableWithAggregatesFilter<"Payment">
    status?: EnumPaymentStatusWithAggregatesFilter<"Payment"> | $Enums.PaymentStatus
    completedAt?: DateTimeNullableWithAggregatesFilter<"Payment"> | Date | string | null
    refundAmount?: FloatNullableWithAggregatesFilter<"Payment"> | number | null
    refundedAt?: DateTimeNullableWithAggregatesFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
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

  export type OrderCreateInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    esims?: ESIMCreateNestedManyWithoutOrderInput
    payments?: PaymentCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    esims?: ESIMUncheckedCreateNestedManyWithoutOrderInput
    payments?: PaymentUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    esims?: ESIMUpdateManyWithoutOrderNestedInput
    payments?: PaymentUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    esims?: ESIMUncheckedUpdateManyWithoutOrderNestedInput
    payments?: PaymentUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ESIMCreateInput = {
    id?: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutEsimsInput
    profiles?: ESIMProfileCreateNestedManyWithoutEsimInput
  }

  export type ESIMUncheckedCreateInput = {
    id?: string
    orderId: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    profiles?: ESIMProfileUncheckedCreateNestedManyWithoutEsimInput
  }

  export type ESIMUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutEsimsNestedInput
    profiles?: ESIMProfileUpdateManyWithoutEsimNestedInput
  }

  export type ESIMUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profiles?: ESIMProfileUncheckedUpdateManyWithoutEsimNestedInput
  }

  export type ESIMCreateManyInput = {
    id?: string
    orderId: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ESIMUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileCreateInput = {
    id?: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    esim: ESIMCreateNestedOneWithoutProfilesInput
  }

  export type ESIMProfileUncheckedCreateInput = {
    id?: string
    esimId: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ESIMProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    esim?: ESIMUpdateOneRequiredWithoutProfilesNestedInput
  }

  export type ESIMProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    esimId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileCreateManyInput = {
    id?: string
    esimId: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ESIMProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    esimId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataPlanCreateInput = {
    id?: string
    name: string
    dataAmount: string
    duration: string
    price: number
    currency?: string
    region: string
    features?: DataPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DataPlanUncheckedCreateInput = {
    id?: string
    name: string
    dataAmount: string
    duration: string
    price: number
    currency?: string
    region: string
    features?: DataPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DataPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dataAmount?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    features?: DataPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dataAmount?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    features?: DataPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataPlanCreateManyInput = {
    id?: string
    name: string
    dataAmount: string
    duration: string
    price: number
    currency?: string
    region: string
    features?: DataPlanCreatefeaturesInput | string[]
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DataPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dataAmount?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    features?: DataPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dataAmount?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    features?: DataPlanUpdatefeaturesInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateInput = {
    id?: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutPaymentsInput
  }

  export type PaymentUncheckedCreateInput = {
    id?: string
    orderId: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutPaymentsNestedInput
  }

  export type PaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateManyInput = {
    id?: string
    orderId: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
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

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ESIMListRelationFilter = {
    every?: ESIMWhereInput
    some?: ESIMWhereInput
    none?: ESIMWhereInput
  }

  export type PaymentListRelationFilter = {
    every?: PaymentWhereInput
    some?: PaymentWhereInput
    none?: PaymentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ESIMOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    esimType?: SortOrder
    dataPlan?: SortOrder
    duration?: SortOrder
    region?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    trackingId?: SortOrder
    estimatedDelivery?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    refundAmount?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    quantity?: SortOrder
    refundAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    esimType?: SortOrder
    dataPlan?: SortOrder
    duration?: SortOrder
    region?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    trackingId?: SortOrder
    estimatedDelivery?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    refundAmount?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    esimType?: SortOrder
    dataPlan?: SortOrder
    duration?: SortOrder
    region?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    trackingId?: SortOrder
    estimatedDelivery?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cancelledAt?: SortOrder
    cancellationReason?: SortOrder
    refundAmount?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    quantity?: SortOrder
    refundAmount?: SortOrder
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

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
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

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type EnumESIMStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ESIMStatus | EnumESIMStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumESIMStatusFilter<$PrismaModel> | $Enums.ESIMStatus
  }

  export type OrderScalarRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type ESIMProfileListRelationFilter = {
    every?: ESIMProfileWhereInput
    some?: ESIMProfileWhereInput
    none?: ESIMProfileWhereInput
  }

  export type ESIMProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ESIMCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    activationCode?: SortOrder
    deviceInfo?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    deactivatedAt?: SortOrder
    deactivationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ESIMMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    activationCode?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    deactivatedAt?: SortOrder
    deactivationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ESIMMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    activationCode?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    deactivatedAt?: SortOrder
    deactivationReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type EnumESIMStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ESIMStatus | EnumESIMStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumESIMStatusWithAggregatesFilter<$PrismaModel> | $Enums.ESIMStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumESIMStatusFilter<$PrismaModel>
    _max?: NestedEnumESIMStatusFilter<$PrismaModel>
  }

  export type ESIMScalarRelationFilter = {
    is?: ESIMWhereInput
    isNot?: ESIMWhereInput
  }

  export type ESIMProfileCountOrderByAggregateInput = {
    id?: SortOrder
    esimId?: SortOrder
    profileId?: SortOrder
    iccid?: SortOrder
    downloadUrl?: SortOrder
    qrCode?: SortOrder
    expiresAt?: SortOrder
    deviceInfo?: SortOrder
    createdAt?: SortOrder
  }

  export type ESIMProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    esimId?: SortOrder
    profileId?: SortOrder
    iccid?: SortOrder
    downloadUrl?: SortOrder
    qrCode?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ESIMProfileMinOrderByAggregateInput = {
    id?: SortOrder
    esimId?: SortOrder
    profileId?: SortOrder
    iccid?: SortOrder
    downloadUrl?: SortOrder
    qrCode?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
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

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DataPlanCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    dataAmount?: SortOrder
    duration?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    region?: SortOrder
    features?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataPlanAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type DataPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    dataAmount?: SortOrder
    duration?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    region?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataPlanMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    dataAmount?: SortOrder
    duration?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    region?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataPlanSumOrderByAggregateInput = {
    price?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    paymentMethod?: SortOrder
    customerId?: SortOrder
    billingAddress?: SortOrder
    status?: SortOrder
    completedAt?: SortOrder
    refundAmount?: SortOrder
    refundedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
    refundAmount?: SortOrder
  }

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    paymentMethod?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    completedAt?: SortOrder
    refundAmount?: SortOrder
    refundedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    paymentMethod?: SortOrder
    customerId?: SortOrder
    status?: SortOrder
    completedAt?: SortOrder
    refundAmount?: SortOrder
    refundedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentSumOrderByAggregateInput = {
    amount?: SortOrder
    refundAmount?: SortOrder
  }

  export type EnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
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

  export type ESIMCreateNestedManyWithoutOrderInput = {
    create?: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput> | ESIMCreateWithoutOrderInput[] | ESIMUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ESIMCreateOrConnectWithoutOrderInput | ESIMCreateOrConnectWithoutOrderInput[]
    createMany?: ESIMCreateManyOrderInputEnvelope
    connect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
  }

  export type PaymentCreateNestedManyWithoutOrderInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type ESIMUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput> | ESIMCreateWithoutOrderInput[] | ESIMUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ESIMCreateOrConnectWithoutOrderInput | ESIMCreateOrConnectWithoutOrderInput[]
    createMany?: ESIMCreateManyOrderInputEnvelope
    connect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
  }

  export type PaymentUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ESIMUpdateManyWithoutOrderNestedInput = {
    create?: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput> | ESIMCreateWithoutOrderInput[] | ESIMUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ESIMCreateOrConnectWithoutOrderInput | ESIMCreateOrConnectWithoutOrderInput[]
    upsert?: ESIMUpsertWithWhereUniqueWithoutOrderInput | ESIMUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: ESIMCreateManyOrderInputEnvelope
    set?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    disconnect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    delete?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    connect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    update?: ESIMUpdateWithWhereUniqueWithoutOrderInput | ESIMUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: ESIMUpdateManyWithWhereWithoutOrderInput | ESIMUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: ESIMScalarWhereInput | ESIMScalarWhereInput[]
  }

  export type PaymentUpdateManyWithoutOrderNestedInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutOrderInput | PaymentUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutOrderInput | PaymentUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutOrderInput | PaymentUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type ESIMUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput> | ESIMCreateWithoutOrderInput[] | ESIMUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: ESIMCreateOrConnectWithoutOrderInput | ESIMCreateOrConnectWithoutOrderInput[]
    upsert?: ESIMUpsertWithWhereUniqueWithoutOrderInput | ESIMUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: ESIMCreateManyOrderInputEnvelope
    set?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    disconnect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    delete?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    connect?: ESIMWhereUniqueInput | ESIMWhereUniqueInput[]
    update?: ESIMUpdateWithWhereUniqueWithoutOrderInput | ESIMUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: ESIMUpdateManyWithWhereWithoutOrderInput | ESIMUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: ESIMScalarWhereInput | ESIMScalarWhereInput[]
  }

  export type PaymentUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput> | PaymentCreateWithoutOrderInput[] | PaymentUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: PaymentCreateOrConnectWithoutOrderInput | PaymentCreateOrConnectWithoutOrderInput[]
    upsert?: PaymentUpsertWithWhereUniqueWithoutOrderInput | PaymentUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: PaymentCreateManyOrderInputEnvelope
    set?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    disconnect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    delete?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    connect?: PaymentWhereUniqueInput | PaymentWhereUniqueInput[]
    update?: PaymentUpdateWithWhereUniqueWithoutOrderInput | PaymentUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: PaymentUpdateManyWithWhereWithoutOrderInput | PaymentUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutEsimsInput = {
    create?: XOR<OrderCreateWithoutEsimsInput, OrderUncheckedCreateWithoutEsimsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutEsimsInput
    connect?: OrderWhereUniqueInput
  }

  export type ESIMProfileCreateNestedManyWithoutEsimInput = {
    create?: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput> | ESIMProfileCreateWithoutEsimInput[] | ESIMProfileUncheckedCreateWithoutEsimInput[]
    connectOrCreate?: ESIMProfileCreateOrConnectWithoutEsimInput | ESIMProfileCreateOrConnectWithoutEsimInput[]
    createMany?: ESIMProfileCreateManyEsimInputEnvelope
    connect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
  }

  export type ESIMProfileUncheckedCreateNestedManyWithoutEsimInput = {
    create?: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput> | ESIMProfileCreateWithoutEsimInput[] | ESIMProfileUncheckedCreateWithoutEsimInput[]
    connectOrCreate?: ESIMProfileCreateOrConnectWithoutEsimInput | ESIMProfileCreateOrConnectWithoutEsimInput[]
    createMany?: ESIMProfileCreateManyEsimInputEnvelope
    connect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
  }

  export type EnumESIMStatusFieldUpdateOperationsInput = {
    set?: $Enums.ESIMStatus
  }

  export type OrderUpdateOneRequiredWithoutEsimsNestedInput = {
    create?: XOR<OrderCreateWithoutEsimsInput, OrderUncheckedCreateWithoutEsimsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutEsimsInput
    upsert?: OrderUpsertWithoutEsimsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutEsimsInput, OrderUpdateWithoutEsimsInput>, OrderUncheckedUpdateWithoutEsimsInput>
  }

  export type ESIMProfileUpdateManyWithoutEsimNestedInput = {
    create?: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput> | ESIMProfileCreateWithoutEsimInput[] | ESIMProfileUncheckedCreateWithoutEsimInput[]
    connectOrCreate?: ESIMProfileCreateOrConnectWithoutEsimInput | ESIMProfileCreateOrConnectWithoutEsimInput[]
    upsert?: ESIMProfileUpsertWithWhereUniqueWithoutEsimInput | ESIMProfileUpsertWithWhereUniqueWithoutEsimInput[]
    createMany?: ESIMProfileCreateManyEsimInputEnvelope
    set?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    disconnect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    delete?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    connect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    update?: ESIMProfileUpdateWithWhereUniqueWithoutEsimInput | ESIMProfileUpdateWithWhereUniqueWithoutEsimInput[]
    updateMany?: ESIMProfileUpdateManyWithWhereWithoutEsimInput | ESIMProfileUpdateManyWithWhereWithoutEsimInput[]
    deleteMany?: ESIMProfileScalarWhereInput | ESIMProfileScalarWhereInput[]
  }

  export type ESIMProfileUncheckedUpdateManyWithoutEsimNestedInput = {
    create?: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput> | ESIMProfileCreateWithoutEsimInput[] | ESIMProfileUncheckedCreateWithoutEsimInput[]
    connectOrCreate?: ESIMProfileCreateOrConnectWithoutEsimInput | ESIMProfileCreateOrConnectWithoutEsimInput[]
    upsert?: ESIMProfileUpsertWithWhereUniqueWithoutEsimInput | ESIMProfileUpsertWithWhereUniqueWithoutEsimInput[]
    createMany?: ESIMProfileCreateManyEsimInputEnvelope
    set?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    disconnect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    delete?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    connect?: ESIMProfileWhereUniqueInput | ESIMProfileWhereUniqueInput[]
    update?: ESIMProfileUpdateWithWhereUniqueWithoutEsimInput | ESIMProfileUpdateWithWhereUniqueWithoutEsimInput[]
    updateMany?: ESIMProfileUpdateManyWithWhereWithoutEsimInput | ESIMProfileUpdateManyWithWhereWithoutEsimInput[]
    deleteMany?: ESIMProfileScalarWhereInput | ESIMProfileScalarWhereInput[]
  }

  export type ESIMCreateNestedOneWithoutProfilesInput = {
    create?: XOR<ESIMCreateWithoutProfilesInput, ESIMUncheckedCreateWithoutProfilesInput>
    connectOrCreate?: ESIMCreateOrConnectWithoutProfilesInput
    connect?: ESIMWhereUniqueInput
  }

  export type ESIMUpdateOneRequiredWithoutProfilesNestedInput = {
    create?: XOR<ESIMCreateWithoutProfilesInput, ESIMUncheckedCreateWithoutProfilesInput>
    connectOrCreate?: ESIMCreateOrConnectWithoutProfilesInput
    upsert?: ESIMUpsertWithoutProfilesInput
    connect?: ESIMWhereUniqueInput
    update?: XOR<XOR<ESIMUpdateToOneWithWhereWithoutProfilesInput, ESIMUpdateWithoutProfilesInput>, ESIMUncheckedUpdateWithoutProfilesInput>
  }

  export type DataPlanCreatefeaturesInput = {
    set: string[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DataPlanUpdatefeaturesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type OrderCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutPaymentsInput
    connect?: OrderWhereUniqueInput
  }

  export type EnumPaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.PaymentStatus
  }

  export type OrderUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutPaymentsInput
    upsert?: OrderUpsertWithoutPaymentsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutPaymentsInput, OrderUpdateWithoutPaymentsInput>, OrderUncheckedUpdateWithoutPaymentsInput>
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

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
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

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderStatus[] | ListEnumOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
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

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumESIMStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ESIMStatus | EnumESIMStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumESIMStatusFilter<$PrismaModel> | $Enums.ESIMStatus
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

  export type NestedEnumESIMStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ESIMStatus | EnumESIMStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ESIMStatus[] | ListEnumESIMStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumESIMStatusWithAggregatesFilter<$PrismaModel> | $Enums.ESIMStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumESIMStatusFilter<$PrismaModel>
    _max?: NestedEnumESIMStatusFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumPaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusFilter<$PrismaModel> | $Enums.PaymentStatus
  }

  export type NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PaymentStatus | EnumPaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PaymentStatus[] | ListEnumPaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.PaymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumPaymentStatusFilter<$PrismaModel>
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

  export type ESIMCreateWithoutOrderInput = {
    id?: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    profiles?: ESIMProfileCreateNestedManyWithoutEsimInput
  }

  export type ESIMUncheckedCreateWithoutOrderInput = {
    id?: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    profiles?: ESIMProfileUncheckedCreateNestedManyWithoutEsimInput
  }

  export type ESIMCreateOrConnectWithoutOrderInput = {
    where: ESIMWhereUniqueInput
    create: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput>
  }

  export type ESIMCreateManyOrderInputEnvelope = {
    data: ESIMCreateManyOrderInput | ESIMCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type PaymentCreateWithoutOrderInput = {
    id?: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUncheckedCreateWithoutOrderInput = {
    id?: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentCreateOrConnectWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    create: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput>
  }

  export type PaymentCreateManyOrderInputEnvelope = {
    data: PaymentCreateManyOrderInput | PaymentCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type ESIMUpsertWithWhereUniqueWithoutOrderInput = {
    where: ESIMWhereUniqueInput
    update: XOR<ESIMUpdateWithoutOrderInput, ESIMUncheckedUpdateWithoutOrderInput>
    create: XOR<ESIMCreateWithoutOrderInput, ESIMUncheckedCreateWithoutOrderInput>
  }

  export type ESIMUpdateWithWhereUniqueWithoutOrderInput = {
    where: ESIMWhereUniqueInput
    data: XOR<ESIMUpdateWithoutOrderInput, ESIMUncheckedUpdateWithoutOrderInput>
  }

  export type ESIMUpdateManyWithWhereWithoutOrderInput = {
    where: ESIMScalarWhereInput
    data: XOR<ESIMUpdateManyMutationInput, ESIMUncheckedUpdateManyWithoutOrderInput>
  }

  export type ESIMScalarWhereInput = {
    AND?: ESIMScalarWhereInput | ESIMScalarWhereInput[]
    OR?: ESIMScalarWhereInput[]
    NOT?: ESIMScalarWhereInput | ESIMScalarWhereInput[]
    id?: StringFilter<"ESIM"> | string
    orderId?: StringFilter<"ESIM"> | string
    activationCode?: StringFilter<"ESIM"> | string
    deviceInfo?: JsonNullableFilter<"ESIM">
    status?: EnumESIMStatusFilter<"ESIM"> | $Enums.ESIMStatus
    activatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivatedAt?: DateTimeNullableFilter<"ESIM"> | Date | string | null
    deactivationReason?: StringNullableFilter<"ESIM"> | string | null
    createdAt?: DateTimeFilter<"ESIM"> | Date | string
    updatedAt?: DateTimeFilter<"ESIM"> | Date | string
  }

  export type PaymentUpsertWithWhereUniqueWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    update: XOR<PaymentUpdateWithoutOrderInput, PaymentUncheckedUpdateWithoutOrderInput>
    create: XOR<PaymentCreateWithoutOrderInput, PaymentUncheckedCreateWithoutOrderInput>
  }

  export type PaymentUpdateWithWhereUniqueWithoutOrderInput = {
    where: PaymentWhereUniqueInput
    data: XOR<PaymentUpdateWithoutOrderInput, PaymentUncheckedUpdateWithoutOrderInput>
  }

  export type PaymentUpdateManyWithWhereWithoutOrderInput = {
    where: PaymentScalarWhereInput
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyWithoutOrderInput>
  }

  export type PaymentScalarWhereInput = {
    AND?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    OR?: PaymentScalarWhereInput[]
    NOT?: PaymentScalarWhereInput | PaymentScalarWhereInput[]
    id?: StringFilter<"Payment"> | string
    orderId?: StringFilter<"Payment"> | string
    amount?: FloatFilter<"Payment"> | number
    currency?: StringFilter<"Payment"> | string
    paymentMethod?: StringFilter<"Payment"> | string
    customerId?: StringFilter<"Payment"> | string
    billingAddress?: JsonNullableFilter<"Payment">
    status?: EnumPaymentStatusFilter<"Payment"> | $Enums.PaymentStatus
    completedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    refundAmount?: FloatNullableFilter<"Payment"> | number | null
    refundedAt?: DateTimeNullableFilter<"Payment"> | Date | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
  }

  export type OrderCreateWithoutEsimsInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    payments?: PaymentCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutEsimsInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    payments?: PaymentUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutEsimsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutEsimsInput, OrderUncheckedCreateWithoutEsimsInput>
  }

  export type ESIMProfileCreateWithoutEsimInput = {
    id?: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ESIMProfileUncheckedCreateWithoutEsimInput = {
    id?: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ESIMProfileCreateOrConnectWithoutEsimInput = {
    where: ESIMProfileWhereUniqueInput
    create: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput>
  }

  export type ESIMProfileCreateManyEsimInputEnvelope = {
    data: ESIMProfileCreateManyEsimInput | ESIMProfileCreateManyEsimInput[]
    skipDuplicates?: boolean
  }

  export type OrderUpsertWithoutEsimsInput = {
    update: XOR<OrderUpdateWithoutEsimsInput, OrderUncheckedUpdateWithoutEsimsInput>
    create: XOR<OrderCreateWithoutEsimsInput, OrderUncheckedCreateWithoutEsimsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutEsimsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutEsimsInput, OrderUncheckedUpdateWithoutEsimsInput>
  }

  export type OrderUpdateWithoutEsimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    payments?: PaymentUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutEsimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    payments?: PaymentUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type ESIMProfileUpsertWithWhereUniqueWithoutEsimInput = {
    where: ESIMProfileWhereUniqueInput
    update: XOR<ESIMProfileUpdateWithoutEsimInput, ESIMProfileUncheckedUpdateWithoutEsimInput>
    create: XOR<ESIMProfileCreateWithoutEsimInput, ESIMProfileUncheckedCreateWithoutEsimInput>
  }

  export type ESIMProfileUpdateWithWhereUniqueWithoutEsimInput = {
    where: ESIMProfileWhereUniqueInput
    data: XOR<ESIMProfileUpdateWithoutEsimInput, ESIMProfileUncheckedUpdateWithoutEsimInput>
  }

  export type ESIMProfileUpdateManyWithWhereWithoutEsimInput = {
    where: ESIMProfileScalarWhereInput
    data: XOR<ESIMProfileUpdateManyMutationInput, ESIMProfileUncheckedUpdateManyWithoutEsimInput>
  }

  export type ESIMProfileScalarWhereInput = {
    AND?: ESIMProfileScalarWhereInput | ESIMProfileScalarWhereInput[]
    OR?: ESIMProfileScalarWhereInput[]
    NOT?: ESIMProfileScalarWhereInput | ESIMProfileScalarWhereInput[]
    id?: StringFilter<"ESIMProfile"> | string
    esimId?: StringFilter<"ESIMProfile"> | string
    profileId?: StringFilter<"ESIMProfile"> | string
    iccid?: StringFilter<"ESIMProfile"> | string
    downloadUrl?: StringFilter<"ESIMProfile"> | string
    qrCode?: StringFilter<"ESIMProfile"> | string
    expiresAt?: DateTimeFilter<"ESIMProfile"> | Date | string
    deviceInfo?: JsonNullableFilter<"ESIMProfile">
    createdAt?: DateTimeFilter<"ESIMProfile"> | Date | string
  }

  export type ESIMCreateWithoutProfilesInput = {
    id?: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutEsimsInput
  }

  export type ESIMUncheckedCreateWithoutProfilesInput = {
    id?: string
    orderId: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ESIMCreateOrConnectWithoutProfilesInput = {
    where: ESIMWhereUniqueInput
    create: XOR<ESIMCreateWithoutProfilesInput, ESIMUncheckedCreateWithoutProfilesInput>
  }

  export type ESIMUpsertWithoutProfilesInput = {
    update: XOR<ESIMUpdateWithoutProfilesInput, ESIMUncheckedUpdateWithoutProfilesInput>
    create: XOR<ESIMCreateWithoutProfilesInput, ESIMUncheckedCreateWithoutProfilesInput>
    where?: ESIMWhereInput
  }

  export type ESIMUpdateToOneWithWhereWithoutProfilesInput = {
    where?: ESIMWhereInput
    data: XOR<ESIMUpdateWithoutProfilesInput, ESIMUncheckedUpdateWithoutProfilesInput>
  }

  export type ESIMUpdateWithoutProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutEsimsNestedInput
  }

  export type ESIMUncheckedUpdateWithoutProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateWithoutPaymentsInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    esims?: ESIMCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutPaymentsInput = {
    id?: string
    customerId: string
    esimType: string
    dataPlan: string
    duration: string
    region: string
    quantity?: number
    status?: $Enums.OrderStatus
    trackingId?: string | null
    estimatedDelivery?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cancelledAt?: Date | string | null
    cancellationReason?: string | null
    refundAmount?: number | null
    esims?: ESIMUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutPaymentsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
  }

  export type OrderUpsertWithoutPaymentsInput = {
    update: XOR<OrderUpdateWithoutPaymentsInput, OrderUncheckedUpdateWithoutPaymentsInput>
    create: XOR<OrderCreateWithoutPaymentsInput, OrderUncheckedCreateWithoutPaymentsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutPaymentsInput, OrderUncheckedUpdateWithoutPaymentsInput>
  }

  export type OrderUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    esims?: ESIMUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    esimType?: StringFieldUpdateOperationsInput | string
    dataPlan?: StringFieldUpdateOperationsInput | string
    duration?: StringFieldUpdateOperationsInput | string
    region?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    trackingId?: NullableStringFieldUpdateOperationsInput | string | null
    estimatedDelivery?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancellationReason?: NullableStringFieldUpdateOperationsInput | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    esims?: ESIMUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type ESIMCreateManyOrderInput = {
    id?: string
    activationCode: string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.ESIMStatus
    activatedAt?: Date | string | null
    deactivatedAt?: Date | string | null
    deactivationReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentCreateManyOrderInput = {
    id?: string
    amount: number
    currency?: string
    paymentMethod: string
    customerId: string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: $Enums.PaymentStatus
    completedAt?: Date | string | null
    refundAmount?: number | null
    refundedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ESIMUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profiles?: ESIMProfileUpdateManyWithoutEsimNestedInput
  }

  export type ESIMUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profiles?: ESIMProfileUncheckedUpdateManyWithoutEsimNestedInput
  }

  export type ESIMUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationCode?: StringFieldUpdateOperationsInput | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumESIMStatusFieldUpdateOperationsInput | $Enums.ESIMStatus
    activatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deactivationReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    billingAddress?: NullableJsonNullValueInput | InputJsonValue
    status?: EnumPaymentStatusFieldUpdateOperationsInput | $Enums.PaymentStatus
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refundAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    refundedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileCreateManyEsimInput = {
    id?: string
    profileId: string
    iccid: string
    downloadUrl: string
    qrCode: string
    expiresAt: Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ESIMProfileUpdateWithoutEsimInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileUncheckedUpdateWithoutEsimInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ESIMProfileUncheckedUpdateManyWithoutEsimInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    iccid?: StringFieldUpdateOperationsInput | string
    downloadUrl?: StringFieldUpdateOperationsInput | string
    qrCode?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deviceInfo?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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