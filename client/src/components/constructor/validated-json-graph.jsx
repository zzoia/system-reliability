import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactJson from 'react-json-view'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import DoneOutlineRoundedIcon from '@material-ui/icons/DoneOutlineRounded';

const useStyles = makeStyles(theme => ({
    margin: {
        marginLeft: "16px",
        marginRight: "16px",
        display: "flex",
        flexDirection: "column"
    }
}));

export default function ValidatedJsonGraph({ json }) {

    const classes = useStyles();

    if (!json) return (<div></div>);

    return (
        <div>
            <List>
                <ListItem button key="1">
                    <ListItemIcon><DoneOutlineRoundedIcon color="secondary" /></ListItemIcon>
                    <ListItemText primary={"Граф коректний"} />
                </ListItem>
            </List>

            <div className={classes.margin}>
                <ReactJson src={json} style={{ fontSize: "18px" }} />
            </div>
        </div>
    );
}