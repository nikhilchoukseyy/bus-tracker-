# Bus Tracker

Real-time bus tracking web app using React (Vite), Node.js/Express, MongoDB, and Socket.io.

## Project Structure

- `server/`: Express API + Socket.io + MongoDB models
- `client/`: React frontend with driver and student flows

## Roles

- `Admin`: creates driver accounts with `Driver ID + Password`
- `Driver`: logs in with driver ID/password, chooses active bus number/name, shares location
- `Student`: opens live map and tracks active buses

