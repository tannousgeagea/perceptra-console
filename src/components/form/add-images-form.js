import React from 'react'
import { useState } from 'react';
import TextLabel from './text-label'
import './add-images-form.css'
import uploadIcon from '@/assets/icons/upload.png'

const AddFormTemplate = ({ onSubmit, loading }) => {

    const images_keys = {
        'plant_id': '',
        'plant_name': '',
        'plant_location': '',
        'meta_info': '',
    }

    const [newData, setNewData] = useState(images_keys)

    const handleChange = (name, value) => {
        setNewData((prevData) => ({
            ...prevData,
            [name]: value
        }));

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newData);
    };

    return (
        <form className='form-container' onSubmit={handleSubmit}>
            {Object.keys(newData).map((key, index) =>
                <div className='form-content'>
                    <TextLabel 
                        key={key}
                        label={key.replace('_', ' ').toUpperCase()}
                        value={newData[key]}
                        name={key}
                        onChange={handleChange}
                        placeholder={`Enter ${key} `}
                    />
                </div>
            )}
        
            <div className='form-submit'>
                <button type='submit' className='form-submit-button' disabled={loading}>
                    <img src={uploadIcon} alt="Button icon" className="form-submit-icon"/>
                    <span>Upload</span>
                </button>
            </div>
        </form>
    )
}

export default AddFormTemplate