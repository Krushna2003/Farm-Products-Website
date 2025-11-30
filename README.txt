✅ 1. Install Node.js

A new user must install Node.js from:

👉 https://nodejs.org/

Then open terminal and check:

node -v
npm -v

If both commands show a version number → Node is installed.

-----------------------------------------------------------------------------------------------------------

✅ 2. Install project dependencies

Go inside your project folder in terminal:

cd farmer-shop   # or your project folder name

Then install the required packages:

npm install express cors


If your project has a package.json, you can instead run:

npm install

-----------------------------------------------------------------------------------------

✅ 3. Start the backend server

Still inside the project folder:

node server.js

Expected output:

Backend running on http://localhost:3000

--------------------------------------------------------------------------------------------------------

✅ 4. Open the frontend

Open the file index.html

Double-click it OR

Right click → Open with browser

As long as the backend server is running, products will load.

🎉 That’s it!

A new user only needs to install Node.js, then run:

npm install express cors
node server.js