import firebase from 'firebase';
import moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { Provider } from 'react-redux';
import { IStore } from '~react-redux~redux';
import { applyRouterMiddleware, hashHistory, IndexRoute, Redirect, Route, Router } from 'react-router';
import { useScroll } from 'react-router-scroll';

import App from './app/containers/App';
import configureStore from './app/store/configureStore';
import Donations from './app/pages/Donations';
import FoodDonation from './app/pages/FoodDonation';
import Homepage from './app/pages/Homepage';
import NewFoodDonation from './app/pages/NewFoodDonation';
import NewNonfoodDonation from './app/pages/NewNonfoodDonation';
import NonfoodDonation from './app/pages/NonfoodDonation';
import NotFound from './app/pages/NotFound';
import User from './app/pages/User';

import 'moment/locale/ar-sa';

const store: IStore<any> = configureStore();

firebase.initializeApp({
  apiKey: 'AIzaSyCBf9V-x1HK0dtwoY1HE8ebjyDblgeixD0',
  authDomain: 'donation-web-pla-1479993243743.firebaseapp.com',
  databaseURL: 'https://donation-web-pla-1479993243743.firebaseio.com',
  storageBucket: 'donation-web-pla-1479993243743.appspot.com',
  messagingSenderId: '349166973233'
});

moment.locale('ar-sa');

ReactGA.initialize('UA-49010546-7', { debug: true });

function logPageView() {
  ReactGA.set({ page: window.location.hash });
  ReactGA.pageview(window.location.hash);
}

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory} onUpdate={logPageView} render={applyRouterMiddleware(useScroll(() => ([0, 0])))}>
      <Route path='/' component={App}>
        <IndexRoute component={Homepage} />
      </Route>

      <Route path='/404' component={App}>
        <IndexRoute component={NotFound} />
      </Route>

      <Route path='/donate' component={App}>
        <Route path='food' component={NewFoodDonation} />
        <Route path='nonfood' component={NewNonfoodDonation} />
      </Route>

      <Route path='/donations' component={App}>
        <IndexRoute component={Donations} />

        <Route path='food/:id' component={FoodDonation} />
        <Route path='nonfood/:id' component={NonfoodDonation} />

        <Route path='receive' component={Donations} />
        <Route path='deliver' component={Donations} />
      </Route>

      <Route path='/users' component={App}>
        <Route path=':id' component={User} />
      </Route>

      <Redirect from='*' to='/' />
    </Router>
  </Provider>,
  document.getElementById('root')
);
