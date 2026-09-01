// This file is used to store the access token in memory. It is not persisted across page reloads or browser sessions. 
// This is a simple implementation and may not be suitable for production use. 
// Consider using a more secure storage mechanism, such as cookies or localStorage, depending on your security requirements.
let accessToken: string | null = null;

// Function to set the access token
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}