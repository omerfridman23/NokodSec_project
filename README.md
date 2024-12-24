# Fullstack task

You are provided with a working application consisting of a backend server and a client-side React table.
The backend server exposes a single API endpoint `/automations` to fetch all automations data from a JSON file.
The client currently fetches all data at once and displays it in a table with a scroll.

## What to do:

1. **Backend Pagination**: Load and display data in pages instead of fetching all items at once.
2. **Backend Sorting**: Allow the user to sort table columns by making backend requests.
3. **Backend Filtering**: Add the ability to filter data (e.g., by status or type) using query parameters in the API.
4. Add filters components that will allow you to choose the value from a dropdown menu (if you have many options in the drop down what will you do?). The filter should support only "is" operation, i.e if the user choose type = 'flow' you should bring all entities with this type.
5. Add pagination component in the UI.

## Bonus:

- Add sorting in the UI.
- Implement the "items per page" functionality - Dropdown in the UI and support on the server

## Clarifications

1. You can use MUI library and any other library as you like.
2. You can use chatGPT.
3. Due to the fact we don't have a real DB here, its ok to do "query" on the json (make it object and get whatever data you need with javascript) even though it's not efficient.
4. Don't spend time on design and fancy css.

## Getting Started

To start the application, please follow these steps:

### BE

1. Navigate to server folder
2. Run `npm install`
3. Run `npm start` to start the backend server.

### FE

1. Navigate to client folder
2. Run `npm install`
3. Run `npm run dev` to start the frontend.

### Example

You can see a working example with different data [here](https://drive.google.com/file/d/16733CJ6TFLz36x2wx2jzR-pWnlKHFBE3/view?usp=sharing).

Feel free to ask any questions ;]
Enjoy!
