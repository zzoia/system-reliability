import React from 'react';
import AppContainer from './components/constructor/app-container';
import ReliabilityModelContainer from './components/states/reliability-model-container';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import LinkTab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import PlotsContainer from './components/plots/plots-container';
import EquationSystemContainer from './components/equation-system/equation-system-container';

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

const getUrlIndex = () => {
  switch (window.location.pathname) {
    case paths.systemConstructor:
      return 0;
    case paths.reliabilityModel:
      return 1;
    case paths.equationSystem:
      return 2;
    case paths.plots:
      return 3;
    default:
      return 0;
  }
}

const paths = {
  systemConstructor: "/system-constructor",
  reliabilityModel: "/reliability-model",
  plots: "/plots",
  equationSystem: "/equation-system"
}

export default function App() {

  const classes = useStyles();

  const [value, setValue] = React.useState(getUrlIndex());

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
            <LinkTab label="Конструктор системи" href={paths.systemConstructor} />
            <LinkTab label="Модель надійності" href={paths.reliabilityModel} />
            <LinkTab label="Система рівнянь" href={paths.equationSystem} />
            <LinkTab label="Графіки" href={paths.plots} />
          </Tabs>
        </AppBar>
        <Route exact path="/" component={AppContainer} />
        <Route path={paths.systemConstructor} component={AppContainer} />
        <Route path={paths.reliabilityModel} component={ReliabilityModelContainer} />
        <Route path={paths.equationSystem} component={EquationSystemContainer} />
        <Route path={paths.plots} component={PlotsContainer} />
      </Router>
    </ThemeProvider >
  );
}

