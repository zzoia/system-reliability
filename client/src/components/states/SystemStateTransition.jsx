import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CancelIcon from '@material-ui/icons/Cancel';
import UpdateIcon from '@material-ui/icons/Update';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    chip: {
        marginRight: "2px"
    },
    iconContainer: {
        display: "flex",
        alignItems: "center"
    }
}));

export const SystemStateTransition = ({ transition }) => {

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const getIconComponent = state => {

        let icon = null;
    
        switch (state.status) {
            case "terminal":
                icon = <CancelIcon style={{ color: "red" }} />;
                break;
    
            case "waitingRecovery":
                icon = <UpdateIcon style={{ color: "orange" }} />;
                break;
    
            case "working":
                icon = <CheckCircleIcon style={{ color: "green" }} />;
                break;
    
            default:
                break;
        }
    
        return (<div className={classes.iconContainer}>{icon}{state.index}</div>);
    }

    const getChips = (moduleStates) => {
        return moduleStates.map((mod, index) => (
            <Chip
                key={index}
                variant={mod.isWorking ? "outlined" : "default"}
                size="small"
                icon={mod.isWorking ? <AddIcon /> : <RemoveIcon />}
                label={(mod.name) + (mod.left == null ? "" : ` (${mod.left})`)}
                clickable
                className={classes.chip}
            />
        ));
    };

    const nextStates = transition.toStates.map((state, index) => (
        <ListItem key={index} button className={classes.nested}>
            <ListItemIcon>{getIconComponent(state.toState)}</ListItemIcon>
            {
                getChips(state.toState.moduleStates)
            }
        </ListItem>
    ));

    return (
        <List
            component="nav"
            className={classes.root}>

            <ListItem key={-1} button onClick={handleClick}>
                <ListItemIcon>{getIconComponent(transition.fromState)}</ListItemIcon>
                <ListItemText >{
                    getChips(transition.fromState.moduleStates)
                }</ListItemText>
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {nextStates}
                </List>
            </Collapse>

            <Divider />

        </List>
    );
};

export default SystemStateTransition;
