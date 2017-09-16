import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import './App.css'
import theme from './theme'
import Dashboard from './../dashboard/Dashboard'
import Signin from './../signin/Signin'
import PageNotFound from './../page_not_found/PageNotFound'
import { ThemeProvider } from 'react-css-themr'
import { Provider } from 'react-redux'
import configureStore from './../../store/configureStore'
import history from './../../store/history'
import { ConnectedRouter } from 'react-router-redux'
import Toast from './../toast/Toast'
import Confirm from './../confirm/Confirm'

const store = configureStore()
console.log('initial store', store.getState())

class App extends Component {

  render() {
    // console.log(theme)

    const { location } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history} >
            <div className="adex-dapp">
              <Switch location={location}>
                <Route path="/dashboard/:side" component={Dashboard} />
                <Redirect from="/dashboard" to="/side-select" />
                <Route path="/" component={Signin} />

                <Route component={PageNotFound} />
              </Switch>
              <Toast />
              <Confirm />
            </div>
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;
