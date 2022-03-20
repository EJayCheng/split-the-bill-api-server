export interface FacebookTokenInfo {
  app_id: string;
  type: 'USER' | 'PAGE';
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  scopes: FacebookTokenScopeType[];
  user_id: string;
}
export type FacebookTokenScopeType = 'email' | 'public_profile';

export interface FacebookUserInfo {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      url: string;
    };
  };
}
