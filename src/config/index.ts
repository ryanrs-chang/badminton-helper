export const channelSecret: string = process.env.API_SECRET;
export const channelAccessToken: string = process.env.API_ACCESS_TOKEN;
export enum Role {
  User = 1,
  Manager = 2,
  Maintainer = 3,
  Administrator = 4
}

export enum Status {
  Normal = "normal",
  Deleted = "deleted"
}

export enum UserType {
  Line = "line",
  Undefined = "undefined"
}
