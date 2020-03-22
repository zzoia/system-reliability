import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';

class ModuleGraphRules extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rules: [
                "To add nodes, hold shift and click on the grid.",
                "To add edges, hold shift and click/drag to between nodes.",
                "To delete a node or edge, click on it and press delete.",
                "Click and drag nodes to change their position."
            ]
        }
    }

    render() {
        return (
            <List component="nav" aria-label="main mailbox folders">
                {
                    this.state.rules.map((rule, index) => (
                        <ListItem button key={index}>
                            <ListItemIcon>
                                <CheckRoundedIcon />
                            </ListItemIcon>
                            <ListItemText primary={rule} />
                        </ListItem>
                    ))
                }
            </List>
        );
    }

}

export default ModuleGraphRules;