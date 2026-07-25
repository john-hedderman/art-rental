// See this project's README for detail, but in short:

// set to localhost normally, for development and running unit tests
// ensure that the front end app is running via "ng serve"
// ensure that the back end node app is also running on localhost

// when wanting local mobile access or access from other devices on the same network as the server, set to local IPV4 address
// ensure that the front end app is running via "npm run start:lan" (on 0.0.0.0)
// ensure that the back end node app is running on host 0.0.0.0

export const environment = {
  apiUrl: 'http://localhost:3000'
};
// export const environment = {
//   apiUrl: 'http://192.168.1.26:3000'
// };
