import React from 'react';
import ReactJson from 'react-json-view'
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import DoneOutlineRoundedIcon from '@material-ui/icons/DoneOutlineRounded';
import Button from '@material-ui/core/Button';

const drawerWidth = 400;

const useStyles = makeStyles(theme => ({
    drawer: {
        flexShrink: 0
    },
    drawerPaper: {
        width: drawerWidth
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start'
    },
    margin: {
        marginLeft: "16px",
        marginRight: "16px",
        display: "flex",
        flexDirection: "column"
    },
    submitButtom: {
        marginTop: "16px"
    }
}));

export default function SystemJsonView(props) {
    const classes = useStyles();

    return (
        <Drawer
            className={classes.drawer}
            style={{width: ((props.open) ? drawerWidth : 0) }}
            variant="persistent"
            anchor="left"
            open={props.open}
            classes={{
                paper: classes.drawerPaper,
            }}>
            <div className={classes.drawerHeader}>
            </div>
            <Divider />
            <List>
                <ListItem button key="1">
                    <ListItemIcon><DoneOutlineRoundedIcon color="secondary" /></ListItemIcon>
                    <ListItemText primary={"Граф коректний"} />
                </ListItem>
            </List>

            <div className={classes.margin}>
                <ReactJson src={props.json} style={{fontSize: "18px"}} />
                <Button
                    variant="contained"
                    className={classes.submitButtom}
                    color="primary">Перевірити надійність</Button>
            </div>
        </Drawer>
    );
}