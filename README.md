## Environment variables
Before starting, you need to create a .env file in the root of the project and put the following values there (you can also find them in .env.example):
```
// If true, autosave will not work
REACT_APP_DEBUG=false

// Url for current canvas project
REACT_APP_CURRENT_APP_URL=http://localhost:4200

PORT=3002

// Url for backend (Dashboard-API project)
REACT_APP_API_URL=https://staging-api.funnelytics.io

// Url for analytics
REACT_APP_ANALYTICS_API_URL=https://staging-analytics.funnelytics.io

// Hubspot account id
HUBSPOT_ID=20334689
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
