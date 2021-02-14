import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
    submitButton: {
        margin: "16px"
    }
});

export const FilePicker = ({ onUploaded }) => {

    const classes = useStyles();
    const filePicker = useRef(null);

    const onFileChange = event => onUploaded(event.target.files[0]);

    return (
        <React.Fragment>
            <input
                type="file"
                onChange={onFileChange}
                ref={filePicker}
                style={{ display: "none" }}
                accept=".json" />
            <Button
                className={classes.submitButton}
                variant="contained"
                color="primary"
                onClick={() => filePicker.current.click()}>
                Завантажити граф
            </Button>
        </React.Fragment >
    );
};

export default FilePicker;