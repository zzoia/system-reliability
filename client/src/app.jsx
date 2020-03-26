import React from 'react';
import AppContainer from './components/app-container';
import ReliabilityModelContainer from './components/reliability-model-container';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import LinkTab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })
  }
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#4b9fea',
      main: '#1e88e5',
      dark: '#155fa0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff669a',
      main: '#ff4081',
      dark: '#b22c5a',
      contrastText: '#fff',
    },
  },
});

export default function App() {

  const classes = useStyles();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar position="fixed" className={classes.appBar}>
          <Tabs
            value={value}
            onChange={handleChange}
            centered>
            <LinkTab label="Конструктор системи" href="/system-constructor" />
            <LinkTab label="Модель надійності" href="/reliability-model" />
          </Tabs>
        </AppBar>
        <Route exact path="/" component={AppContainer} />
        <Route path="/system-constructor" component={AppContainer} />
        <Route path="/reliability-model" component={ReliabilityModelContainer} />
      </Router>
    </ThemeProvider >
  );
}

