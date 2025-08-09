declare module 'lodash/get' {
  const get: (obj: any, path: any, defaultValue?: any) => any;
  export default get;
}

declare module 'lodash/matches' {
  const matches: (source: any) => (object: any) => boolean;
  export default matches;
}

declare module 'lodash/pickBy' {
  const pickBy: (object: any, predicate?: (value: any, key: string) => boolean) => any;
  export default pickBy;
}
