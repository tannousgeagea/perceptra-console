import { FC } from "react";
import './label-text.css';

interface TextLabelProps {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    placeholder?: string;
}

const TextLabel: FC<TextLabelProps> = (props) => {
    return (
        <div className="text-label">
            <label htmlFor='label'>{props.label}</label>
            <input 
                type="text" 
                id='label'
                name={props.name}
                value={props.value} 
                onChange={(e) => props.onChange(e.target.name, e.target.value)}
                placeholder={props.placeholder}
                required
            />
        </div>
    )
}

export default TextLabel;