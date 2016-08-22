# Frontline Processing Blaster Mass Email Application

*Prerequisites: node.js and git*

```
git clone https://github.com/Frontline-Processing/Blaster.git
cd fp-dashboard
npm install
npm start
npm run open # (from a different console window, otherwise open localhost:3000)
```

## Getting Started

#### Start building

- Add a route to `src/constants/ROUTES.js`
- Add a nav menu item for your route in `src/components/ApplicationLayout.jsx`
- Add a component for your route in `src/components`
- Add reducers and actions for your component's view model in `src/actions` and `src/reducers/view`
- Add any data models which your component reqiures in `src/reducers/data`
- Add a container to map your store's `state` and `dispatch` to component props in `src/containers`
- Configure your route in `src/Application.jsx`

#### Distribution

- Run `gulp dist` to output a web-ready build of your app to `dist`

## Structure

### Entry point

`main.js` is the entry point to your application. It defines your redux store, handles any actions dispatched to your redux store, handles changes to the browser's current URL, and also makes an initial route change dispatch.

Most of the above will be obvious from a quick read through `main.js` - if there is one thing which may strike you as "interesting", it'll be the block which handles actors.

### Actors

*[Read the introduction to actors](http://jamesknelson.com/join-the-dark-side-of-the-flux-responding-to-actions-with-actors/)*

Each time your store's state changes, a sequence of functions are called on the *current state* of your store. These functions are called **actors**.

There is one important exception to this rule: actors will not be called if `main.js` is currently in the midst of calling the sequence from a previous update. This allows earlier actors in a sequence to dispatch actions to the store, with later actors in the sequence receiving the *updated* state.

The code which accomplishes this is very small:

```javascript
let acting = false
store.subscribe(function() {
  // Ensure that any action dispatched by actors do not result in a new
  // actor run, allowing actors to dispatch with impunity.
  if (!acting) {
    acting = true

    for (let actor of actors) {
      actor(store.getState(), store.dispatch.bind(store))
    }

    acting = false
  }
})
```

The actor is defined in `src/actors/index.js`. By default, it runs the following sequence:

- **redirector** - dispatch a navigation action if the current location should redirect to another location
- **renderer** - renders your <Application> component with React

### Model

Your model (i.e. reducers and actions) is pre-configured with three parts:

#### Navigation

The `navigation` state holds the following information:

- `location` is the object which your `ROUTES` constant's `lookup` function returns for the current URL. With the default uniloc-based `ROUTES` object, this will have a string `name` property, and an `options` object containing any route parameters.
- `transitioning` is true if a navigation `start` action has been dispatched, but the browser hasn't changed URL yet

#### Data

The `data` state can be thought of as the database for your application. If your application reads data from a remote server, it should be stored here. Any metadata should also be stored here, including the time it was fetched or its current version number.

#### View

The `view` state has a property for each of the view's in your app, holding their current state. For example, form state should be stored in the view models.

### Directories

- `src/actions` - Redux action creators
- `src/actors` - Handle changes to your store's state
- `src/components` - React components, stateless where possible
- `src/constants` - Define stateless data
- `src/containers` - Unstyled "smart" components which take your store's `state` and `dispatch`, and possibly navigation `location`, and pass them to "dumb" components
- `src/reducers` - Redux reducers
- `src/static` - Files which will be copied across to the root directory on build
- `src/styles` - Helpers for stylesheets for individual components
- `src/utils` - General code which isn't specific to your application
- `src/validators` - Functions which take an object containing user entry and return an object containing any errors

Other directories:

- `build` - Intermediate files produced by the development server. Don't touch these.
- `dist` - The output of `gulp dist`, which contains your distribution-ready app.
- `config/environments` - The build system will assign one of these to the `environment` module, depending on the current build environment.

Main application files:

- `src/Application.jsx` - Your application's top-level React component
- `src/index.html` - The single page for your single page application
- `src/main.js` - The application's entry point
- `src/main.less` - Global styles for your application

Main build files:

- `gulpfile.babel.js` - Build scripts written with [gulp](http://gulpjs.com/)
- `webpack.config.js` - [Webpack](http://webpack.github.io/) configuration
