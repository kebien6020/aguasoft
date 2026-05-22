declare module '*.png' {
  const value: string
  export default value
}

declare module '*.ttf' {
  const value: string
  export default value
}

declare module '*.css' {}

declare let process : {
  env: {
    NODE_ENV: string
  }
}
