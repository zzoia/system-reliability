import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';

export const StringList = ({ items }) => {

    return (
        <div>
            <List component="nav">
                {
                    items.map((rule, index) => (
                        <ListItem button key={index}>
                            <ListItemIcon>
                                <CheckRoundedIcon color="secondary" />
                            </ListItemIcon>
                            <ListItemText primary={rule} />
                        </ListItem>
                    ))
                }
            </List>
        </div>
    );
}

export default StringList;