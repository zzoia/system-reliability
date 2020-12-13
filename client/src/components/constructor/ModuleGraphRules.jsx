import * as React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export const ModuleGraphRules = () => {

    const rules = [
        "Щоб додати модулі, натисніть Shift і клацніть на сітці",
        "Щоб додати переходи, затисніть Shift і почність тягнути мишею від одного модуля до іншого",
        "Щоб видалити перехід чи модуль, виберіть його за допомогою миші і натисність Delete",
        "Перетягуйте мишею об'єкти, щоб змінити їх положення"
    ];

    return (
        <ExpansionPanel>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography>Інструкції</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <List component="nav">
                    {
                        rules.map((rule, index) => (
                            <ListItem button key={index}>
                                <ListItemIcon>
                                    <CheckRoundedIcon color="secondary" />
                                </ListItemIcon>
                                <ListItemText primary={rule} />
                            </ListItem>
                        ))
                    }
                </List>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}

export default ModuleGraphRules;