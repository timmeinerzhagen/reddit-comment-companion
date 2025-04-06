import React from 'react';
import './spinner.css'; 

const Spinner: React.FC = () => {
    return (
        <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
        </div>
    );
};

export default Spinner;