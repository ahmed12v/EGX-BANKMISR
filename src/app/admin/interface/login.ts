export interface LoginRequest  {
  UserID: string
  UserPwd: string
}

export interface ApiResponse {
  Code: string;
  Description: string;
  JasonString: string;
}

export interface LoginResponse {
  Code: string;
  Description: string;
  UserCredentials: UserCredentials;
}

export interface UserCredentials {
  CoCode: string;
  DivCode: string;
  ShipmentType: string;
  UserID: string;
  UserName: string;
  UserPWD: string;
  UserTag: string;
  UserType: string;
}