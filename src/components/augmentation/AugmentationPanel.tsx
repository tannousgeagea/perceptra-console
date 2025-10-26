import React, { useEffect, useState } from "react";
import AugmentationCard from "../ui/card/AugmentationCard";
import "./AugmentationPanel.css";

interface AugmentationParameter {
  name: string;
  parameter_type: string;
  min_value?: number;
  max_value?: number;
  default_value?: number;
}

interface Augmentation {
  id: number;
  name: string;
  title: string;
  description: string;
  thumbnail: string;
  parameters: AugmentationParameter[];
  active: boolean;
}


interface AugmentationProps {
    data: Array<Augmentation>
}

const AugmentationPanel: React.FC<AugmentationProps> = ({ data }) => {
  const [augmentations, setAugmentations] = useState<Augmentation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        if (data) {
            setAugmentations(data.map((aug) => ({ ...aug, active: false })));
        }
    };
    fetchData();
  }, []);

  // const toggleAugmentation = (id: number) => {
  //   setAugmentations((prev) =>
  //     prev.map((aug) =>
  //       aug.id === id ? { ...aug, active: !aug.active } : aug
  //     )
  //   );
  // };

  // const updateParameter = (id: number, paramName: string, value: number) => {
  //   setAugmentations((prev) =>
  //     prev.map((aug) =>
  //       aug.id === id
  //         ? {
  //             ...aug,
  //             parameters: aug.parameters.map((param) =>
  //               param.name === paramName ? { ...param, default_value: value } : param
  //             ),
  //           }
  //         : aug
  //     )
  //   );
  // };

  return (
    <div className="augmentation-panel">
      <h2>Image Level Augmentations</h2>
      <div className="augmentation-list">
        {augmentations.map((aug) => (
            <AugmentationCard 
                name={aug.title}
                description={aug.description}
                exampleImage={aug.thumbnail}
            />
        ))}
      </div>
    </div>
  );
};

export default AugmentationPanel;
