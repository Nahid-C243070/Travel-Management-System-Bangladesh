# Postman Testing

1. Import both JSON files into Postman.
2. Select **Travel Management BD - Local** as the active environment.
3. Make sure XAMPP MySQL and the Node server are running.
4. Run **Login User** before traveler requests. Its test script stores the access and refresh tokens.
5. Run **Login Admin** before analytics, user management or log requests.
6. The collection contains automated tests for successful status codes and the standard response format.

For a collection run, authentication order matters. Run the folders in numerical order, but remember that `Logout Current Session` revokes the current refresh token. Run `Login User` again after logout before continuing protected user requests.
